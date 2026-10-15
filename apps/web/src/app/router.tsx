import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { RouteProgressBar } from './ProgressBar.js';
import { Skeleton } from '../components/ui/Skeleton.js';

// Lazy-loaded routes for optimized code splitting
const LandingPage = lazy(() =>
  import('../pages/LandingPage.js').then((module) => ({ default: module.LandingPage })),
);
const DesignSystemPage = lazy(() =>
  import('../pages/DesignSystemPage.js').then((module) => ({ default: module.DesignSystemPage })),
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage.js').then((module) => ({ default: module.NotFoundPage })),
);

const RouteSuspenseFallback = () => (
  <div className="flex flex-col gap-6 py-8">
    <Skeleton height={48} width="60%" />
    <Skeleton height={24} width="40%" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <Skeleton height={180} />
      <Skeleton height={180} />
      <Skeleton height={180} />
    </div>
  </div>
);

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <ErrorBoundary>
          <RouteProgressBar />
          <AppLayout />
        </ErrorBoundary>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <LandingPage />
            </Suspense>
          ),
        },
        {
          path: 'design',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <DesignSystemPage />
            </Suspense>
          ),
        },
        {
          path: '*',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <NotFoundPage />
            </Suspense>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
