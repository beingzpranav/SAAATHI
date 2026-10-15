/**
 * IndexedDB-backed offline mutation queue.
 *
 * When the user submits a form offline, mutations are serialised here and
 * replayed in FIFO order once the device reconnects.
 *
 * No external dependencies — uses the raw IndexedDB API so the bundle stays
 * small and works on Lite mode / 2G devices.
 */

export interface OfflineMutation {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: unknown;
  headers?: Record<string, string>;
  enqueuedAt: string;
  retries: number;
}

const DB_NAME = 'saathi-offline';
const STORE_NAME = 'mutation-queue';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Enqueue a mutation for later replay. */
export async function enqueueOfflineMutation(
  mutation: Omit<OfflineMutation, 'id' | 'enqueuedAt' | 'retries'>,
): Promise<string> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record: OfflineMutation = {
    ...mutation,
    id,
    enqueuedAt: new Date().toISOString(),
    retries: 0,
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(record);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

/** Read all queued mutations in insertion order. */
export async function getAllQueuedMutations(): Promise<OfflineMutation[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () =>
      resolve(
        (req.result as OfflineMutation[]).sort(
          (a, b) => new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime(),
        ),
      );
    req.onerror = () => reject(req.error);
  });
}

/** Remove a mutation from the queue after successful replay. */
export async function dequeueOfflineMutation(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Increment retry count for a failed replay attempt. */
export async function incrementRetry(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const record = req.result as OfflineMutation | undefined;
      if (record) {
        store.put({ ...record, retries: record.retries + 1 });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Replay all queued mutations. Call on `window online` event. */
export async function replayOfflineQueue(
  fetchFn: typeof fetch = fetch,
  maxRetries = 3,
): Promise<{ replayed: number; failed: number }> {
  const mutations = await getAllQueuedMutations();
  let replayed = 0;
  let failed = 0;

  for (const mutation of mutations) {
    if (mutation.retries >= maxRetries) {
      // Give up on mutations that have failed too many times
      await dequeueOfflineMutation(mutation.id);
      failed++;
      continue;
    }

    try {
      const res = await fetchFn(mutation.url, {
        method: mutation.method,
        headers: {
          'Content-Type': 'application/json',
          ...mutation.headers,
        },
        body: mutation.body !== undefined ? JSON.stringify(mutation.body) : undefined,
        credentials: 'include',
      });

      if (res.ok) {
        await dequeueOfflineMutation(mutation.id);
        replayed++;
      } else {
        await incrementRetry(mutation.id);
        failed++;
      }
    } catch {
      await incrementRetry(mutation.id);
      failed++;
    }
  }

  return { replayed, failed };
}
