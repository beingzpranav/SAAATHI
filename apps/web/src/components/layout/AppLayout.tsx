import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { Toast } from '../ui/Toast.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#3A2E2A] dark:bg-[#171311] dark:text-[#F5EFEB] antialiased">
      <Header />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
