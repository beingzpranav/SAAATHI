import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock Zustand stores
vi.mock('../stores/ui.store.js', () => ({
  useUiStore: (selector: (s: { liteMode: boolean; setLiteMode: (v: boolean) => void }) => unknown) => {
    const state = { liteMode: false, setLiteMode: vi.fn() };
    return selector(state);
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

// ─── 1. Network Status Hook Tests ────────────────────────────────────────────

describe('useNetworkStatus hook', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
  });

  it('reports online when navigator.onLine is true', async () => {
    const { useNetworkStatus } = await import('../lib/useNetworkStatus.js');
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('reports offline when navigator.onLine is false', async () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
    const { useNetworkStatus } = await import('../lib/useNetworkStatus.js');
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
    expect(result.current.effectiveType).toBe('offline');
    expect(result.current.isLiteRecommended).toBe(true);
  });

  it('recommends Lite mode when effectiveType is 2g', async () => {
    // Simulate Network Information API with 2g
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: { effectiveType: '2g', downlink: 0.2, rtt: 600, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
    const { useNetworkStatus } = await import('../lib/useNetworkStatus.js');
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.effectiveType).toBe('2g');
    expect(result.current.isLiteRecommended).toBe(true);
  });

  it('does NOT recommend Lite mode on 4g connection', async () => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: { effectiveType: '4g', downlink: 10, rtt: 50, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
    Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
    const { useNetworkStatus } = await import('../lib/useNetworkStatus.js');
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.isLiteRecommended).toBe(false);
  });

  it('recommends Lite mode when downlink < 0.5 Mbps', async () => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: { effectiveType: '3g', downlink: 0.3, rtt: 300, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
    const { useNetworkStatus } = await import('../lib/useNetworkStatus.js');
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isLiteRecommended).toBe(true);
  });

  it('recommends Lite mode when RTT > 800ms', async () => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: { effectiveType: '3g', downlink: 1, rtt: 950, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
    const { useNetworkStatus } = await import('../lib/useNetworkStatus.js');
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isLiteRecommended).toBe(true);
  });
});

// ─── 2. Offline Queue Tests ───────────────────────────────────────────────────

describe('Offline Mutation Queue', () => {
  // IndexedDB mock using an in-memory store
  const store = new Map<string, unknown>();

  beforeEach(() => {
    store.clear();

    const mockStore = {
      add: vi.fn((record: { id: string }) => { store.set(record.id, record); return { onsuccess: null }; }),
      put: vi.fn((record: { id: string }) => { store.set(record.id, record); }),
      delete: vi.fn((id: string) => { store.delete(id); }),
      get: vi.fn((id: string) => {
        const req = { result: store.get(id), onsuccess: null as ((e: unknown) => void) | null };
        setTimeout(() => req.onsuccess?.({}), 0);
        return req;
      }),
      getAll: vi.fn(() => {
        const req = { result: [...store.values()], onsuccess: null as ((e: unknown) => void) | null };
        setTimeout(() => req.onsuccess?.({}), 0);
        return req;
      }),
    };

    const mockTx = {
      objectStore: vi.fn(() => mockStore),
      oncomplete: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };

    const mockDb = {
      transaction: vi.fn(() => {
        setTimeout(() => mockTx.oncomplete?.(), 0);
        return mockTx;
      }),
      objectStoreNames: { contains: vi.fn(() => true) },
      createObjectStore: vi.fn(),
    };

    const mockRequest = {
      result: mockDb,
      onsuccess: null as ((e: unknown) => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };

    vi.stubGlobal('indexedDB', {
      open: vi.fn(() => {
        setTimeout(() => mockRequest.onsuccess?.({}), 0);
        return mockRequest;
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('enqueueOfflineMutation returns a unique ID', async () => {
    const { enqueueOfflineMutation } = await import('../lib/offlineQueue.js');
    const id = await enqueueOfflineMutation({
      url: '/api/v1/concerns',
      method: 'POST',
      body: { category: 'FINANCIAL_WORRY' },
    });
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('replayOfflineQueue calls fetch for each mutation and returns replayed count', async () => {
    const { replayOfflineQueue } = await import('../lib/offlineQueue.js');

    // Seed the store with a mock mutation
    store.set('m1', {
      id: 'm1',
      url: '/api/v1/concerns',
      method: 'POST',
      body: { category: 'FINANCIAL_WORRY' },
      enqueuedAt: new Date().toISOString(),
      retries: 0,
    });

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    const result = await replayOfflineQueue(mockFetch);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/concerns',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.replayed).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('abandons mutations exceeding maxRetries', async () => {
    const { replayOfflineQueue } = await import('../lib/offlineQueue.js');

    store.set('m2', {
      id: 'm2',
      url: '/api/v1/concerns',
      method: 'POST',
      body: {},
      enqueuedAt: new Date().toISOString(),
      retries: 3, // Already at max
    });

    const mockFetch = vi.fn();
    const result = await replayOfflineQueue(mockFetch, 3);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.failed).toBe(1);
  });
});

// ─── 3. Speech Input Hook Tests ───────────────────────────────────────────────

describe('useSpeechInput hook', () => {
  it('reports isSupported=false when SpeechRecognition is not available', async () => {
    // Ensure no SpeechRecognition in test env
    const originalSR = (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition;
    const originalWSR = (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    delete (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    const { useSpeechInput } = await import('../lib/useSpeechInput.js');
    const { result } = renderHook(() => useSpeechInput());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');

    // Restore
    if (originalSR) (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition = originalSR;
    if (originalWSR) (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = originalWSR;
  });

  it('startListening sets error when browser unsupported', async () => {
    const { useSpeechInput } = await import('../lib/useSpeechInput.js');
    const { result } = renderHook(() => useSpeechInput());

    act(() => {
      result.current.startListening();
    });

    // If unsupported, error should be set
    if (!result.current.isSupported) {
      expect(result.current.error).toContain('not supported');
    }
  });

  it('resetTranscript clears transcript and interim', async () => {
    const { useSpeechInput } = await import('../lib/useSpeechInput.js');
    const { result } = renderHook(() => useSpeechInput());

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.error).toBeNull();
  });
});

// ─── 4. Speech Output (TTS) Hook Tests ───────────────────────────────────────

describe('useSpeechOutput hook', () => {
  it('isSpeaking starts as false', async () => {
    const { useSpeechOutput } = await import('../lib/useSpeechOutput.js');
    const { result } = renderHook(() => useSpeechOutput());
    expect(result.current.isSpeaking).toBe(false);
  });

  it('cancel() does not throw regardless of support', async () => {
    const { useSpeechOutput } = await import('../lib/useSpeechOutput.js');
    const { result } = renderHook(() => useSpeechOutput());
    // cancel is always safe to call
    expect(() => result.current.cancel()).not.toThrow();
  });

  it('speak() does not throw when called', async () => {
    const { useSpeechOutput } = await import('../lib/useSpeechOutput.js');
    const { result } = renderHook(() => useSpeechOutput());
    // In jsdom, speechSynthesis.speak may be a no-op — it must not throw
    expect(() => result.current.speak('Test text', 'en-IN')).not.toThrow();
  });
});

// ─── 5. NetworkStatusBar Component Tests ─────────────────────────────────────

describe('NetworkStatusBar component', () => {
  it('renders nothing on a healthy 4g online connection', async () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: { effectiveType: '4g', downlink: 20, rtt: 30, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });

    const { NetworkStatusBar } = await import('../components/layout/NetworkStatusBar.js');
    const { container } = render(<BrowserRouter><NetworkStatusBar /></BrowserRouter>);
    expect(container.firstChild).toBeNull();
  });

  it('renders offline bar when navigator.onLine is false', async () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: undefined,
    });

    const { NetworkStatusBar } = await import('../components/layout/NetworkStatusBar.js');
    render(<BrowserRouter><NetworkStatusBar /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  it('dismiss button removes the bar', async () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: false });

    const { NetworkStatusBar } = await import('../components/layout/NetworkStatusBar.js');
    render(<BrowserRouter><NetworkStatusBar /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
