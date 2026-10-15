import React from 'react';
import { Wifi, WifiOff, Zap, ZapOff, X } from 'lucide-react';
import { useNetworkStatus } from '../../lib/useNetworkStatus.js';
import { useUiStore } from '../../stores/ui.store.js';
import { cn } from '../../lib/cn.js';

/**
 * Sticky network status bar displayed at the top of the app when the
 * connection is degraded or Lite mode is active.
 *
 * – Shows nothing on a healthy 4G connection with Lite mode off.
 * – Shows an amber bar on 3G / slow connections with a manual Lite mode toggle.
 * – Shows a red offline bar when the device has no connectivity.
 */
export const NetworkStatusBar: React.FC = () => {
  const { isOnline, effectiveType, isLiteRecommended } = useNetworkStatus();
  const liteMode = useUiStore((s) => s.liteMode);
  const setLiteMode = useUiStore((s) => s.setLiteMode);
  const [dismissed, setDismissed] = React.useState(false);

  // Reset dismissed when network changes
  React.useEffect(() => { setDismissed(false); }, [isOnline, effectiveType]);

  // Don't render on fast connection with lite mode off
  if (isOnline && effectiveType === '4g' && !liteMode && !isLiteRecommended) return null;
  if (isOnline && effectiveType === 'unknown' && !liteMode) return null;
  if (dismissed) return null;

  const isOffline = !isOnline;

  return (
    <div
      id="network-status-bar"
      role="status"
      aria-live="polite"
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 py-2 text-xs font-medium transition-all',
        isOffline
          ? 'bg-red-600 text-white'
          : 'bg-[var(--color-marigold)]/90 text-[var(--color-text)]',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isOffline ? (
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
        ) : (
          <Wifi className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <span className="truncate">
          {isOffline
            ? 'You are offline. Changes will sync when you reconnect.'
            : effectiveType === 'slow-2g' || effectiveType === '2g'
              ? `Slow connection detected (${effectiveType.toUpperCase()}). Lite mode recommended.`
              : 'Limited connection — some features may be slower.'}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Lite mode toggle */}
        {!isOffline && (
          <button
            id="toggle-lite-mode-btn"
            type="button"
            aria-pressed={liteMode}
            onClick={() => setLiteMode(!liteMode)}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold transition-colors',
              liteMode
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-black/10 hover:bg-black/20',
            )}
          >
            {liteMode ? <ZapOff className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            <span>{liteMode ? 'Lite ON' : 'Lite OFF'}</span>
          </button>
        )}

        {/* Dismiss */}
        <button
          id="dismiss-network-bar-btn"
          type="button"
          aria-label="Dismiss network status"
          onClick={() => setDismissed(true)}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
