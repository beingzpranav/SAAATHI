import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  id?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  id = 'mobile-menu-drawer',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Focus first interactive element in drawer
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable && focusable.length > 0) {
        focusable[0]?.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!isOpen}
    >
      <div
        ref={drawerRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed inset-y-0 w-full max-w-xs p-6 shadow-2xl flex flex-col transition-transform duration-200 ease-in-out',
          'bg-[#FFFDF9] text-[#3A2E2A] dark:bg-[#1F1A17] dark:text-[#F5EFEB]',
          position === 'right'
            ? 'right-0 border-l border-[#E8DDD2] dark:border-[#3D3430]'
            : 'left-0 border-r border-[#E8DDD2] dark:border-[#3D3430]',
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD2] dark:border-[#3D3430]">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu drawer"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[8px] text-[#6A5B55] hover:text-[#3A2E2A] hover:bg-[#F3ECE4] dark:text-[#B8AAA3] dark:hover:text-[#F5EFEB] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">{children}</div>
      </div>
    </div>
  );
};
