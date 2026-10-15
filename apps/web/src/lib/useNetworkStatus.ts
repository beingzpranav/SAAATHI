import { useEffect, useCallback } from 'react';
import { useUiStore } from '../stores/ui.store.js';

export type EffectiveConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'offline' | 'unknown';

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType: EffectiveConnectionType;
  isLiteRecommended: boolean;
  downlinkMbps: number | null;
  rttMs: number | null;
}

/**
 * Returns the current Network Information API state (or best-effort fallback).
 * Automatically enables Lite mode when effective connection is 2g / slow-2g / offline.
 */
export function useNetworkStatus(): NetworkStatus {
  const setLiteMode = useUiStore((s) => s.setLiteMode);
  const liteMode = useUiStore((s) => s.liteMode);

  const getStatus = useCallback((): NetworkStatus => {
    if (typeof navigator === 'undefined') {
      return { isOnline: true, effectiveType: 'unknown', isLiteRecommended: false, downlinkMbps: null, rttMs: null };
    }

    const isOnline = navigator.onLine;

    if (!isOnline) {
      return { isOnline: false, effectiveType: 'offline', isLiteRecommended: true, downlinkMbps: null, rttMs: null };
    }

    // Network Information API (Chrome / Android)
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const effectiveType = (conn?.effectiveType ?? 'unknown') as EffectiveConnectionType;
    const downlinkMbps = conn?.downlink ?? null;
    const rttMs = conn?.rtt ?? null;

    const isLiteRecommended =
      effectiveType === 'slow-2g' ||
      effectiveType === '2g' ||
      effectiveType === 'offline' ||
      (downlinkMbps !== null && downlinkMbps < 0.5) ||
      (rttMs !== null && rttMs > 800);

    return { isOnline, effectiveType, isLiteRecommended, downlinkMbps, rttMs };
  }, []);

  useEffect(() => {
    const applyAutoLite = () => {
      const { isLiteRecommended } = getStatus();
      // Only auto-enable, never auto-disable (user may have manually toggled)
      if (isLiteRecommended && !liteMode) {
        setLiteMode(true);
      }
    };

    applyAutoLite();

    const handleChange = () => applyAutoLite();

    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);

    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    conn?.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
      conn?.removeEventListener('change', handleChange);
    };
  }, [getStatus, setLiteMode, liteMode]);

  return getStatus();
}

// Augment NetworkInformation type (not in lib.dom.d.ts by default)
interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener(type: 'change', listener: EventListener): void;
  removeEventListener(type: 'change', listener: EventListener): void;
}
