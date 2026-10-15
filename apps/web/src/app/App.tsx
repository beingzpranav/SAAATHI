import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.js';

export const App: React.FC = () => {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
};
