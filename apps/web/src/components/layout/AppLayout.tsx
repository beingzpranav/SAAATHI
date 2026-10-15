import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { Toast } from '../ui/Toast.js';
import { NetworkStatusBar } from './NetworkStatusBar.js';
import { useUiStore } from '../../stores/ui.store.js';
import { cn } from '../../lib/cn.js';

export const AppLayout: React.FC = () => {
  const liteMode = useUiStore((s) => s.liteMode);

  return (
    <div className={cn(
      'min-h-screen flex flex-col bg-[#FFFDF9] text-[#3A2E2A] dark:bg-[#171311] dark:text-[#F5EFEB] antialiased',
      liteMode && 'lite-mode',
    )}>
      <NetworkStatusBar />
      <Header />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
