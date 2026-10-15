import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { useUiStore } from '../../stores/ui.store.js';

export const Toast: React.FC = () => {
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const typeStyles = {
    info: 'bg-white border-[#E8DDD2] text-[#3A2E2A] dark:bg-[#1F1A17] dark:border-[#3D3430] dark:text-[#F5EFEB]',
    success:
      'bg-[#EAF5EF] border-[#2F7D5C] text-[#1E573F] dark:bg-[#182E22] dark:border-[#49A578] dark:text-[#A7E3C4]',
    error:
      'bg-[#FDF2F0] border-[#B83226] text-[#8E241B] dark:bg-[#2E1C1A] dark:border-[#E56658] dark:text-[#F8B3AC]',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-[#C4562B] dark:text-[#D86A3E]" aria-hidden="true" />,
    success: (
      <CheckCircle2 className="w-5 h-5 text-[#2F7D5C] dark:text-[#49A578]" aria-hidden="true" />
    ),
    error: (
      <AlertCircle className="w-5 h-5 text-[#B83226] dark:text-[#E56658]" aria-hidden="true" />
    ),
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-[8px] border shadow-lg max-w-sm"
    >
      <div className={cn('flex items-center gap-3 w-full', typeStyles[toast.type || 'info'])}>
        <span className="shrink-0">{icons[toast.type || 'info']}</span>
        <p className="text-sm font-medium flex-1 m-0">{toast.message}</p>
        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss toast notification"
          className="p-1 rounded-[6px] hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
