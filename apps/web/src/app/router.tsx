import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { RouteProgressBar } from './ProgressBar.js';
import { ProtectedRoute } from '../components/layout/ProtectedRoute.js';
import { Skeleton } from '../components/ui/Skeleton.js';

// Lazy-loaded routes for optimized code splitting
const LandingPage = lazy(() =>
  import('../pages/LandingPage.js').then((module) => ({ default: module.LandingPage })),
);
const DesignSystemPage = lazy(() =>
  import('../pages/DesignSystemPage.js').then((module) => ({ default: module.DesignSystemPage })),
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage.js').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('../pages/RegisterPage.js').then((module) => ({ default: module.RegisterPage })),
);
const DashboardPreviewPage = lazy(() =>
  import('../pages/DashboardPreviewPage.js').then((module) => ({
    default: module.DashboardPreviewPage,
  })),
);
const HouseholdIntakePage = lazy(() =>
  import('../pages/HouseholdIntakePage.js').then((module) => ({
    default: module.HouseholdIntakePage,
  })),
);
const TradeExplorerPage = lazy(() =>
  import('../pages/TradeExplorerPage.js').then((module) => ({
    default: module.TradeExplorerPage,
  })),
);
const TradeDetailPage = lazy(() =>
  import('../pages/TradeDetailPage.js').then((module) => ({
    default: module.TradeDetailPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage.js').then((module) => ({ default: module.NotFoundPage })),
);
const PrivateWindowPage = lazy(() =>
  import('../pages/PrivateWindowPage.js').then((module) => ({
    default: module.PrivateWindowPage,
  })),
);
const JointRoomPage = lazy(() =>
  import('../pages/JointRoomPage.js').then((module) => ({ default: module.JointRoomPage })),
);
const ConsentLedgerPage = lazy(() =>
  import('../pages/ConsentLedgerPage.js').then((module) => ({
    default: module.ConsentLedgerPage,
  })),
);
const CounsellorConsolePage = lazy(() =>
  import('../pages/CounsellorConsolePage.js').then((module) => ({
    default: module.CounsellorConsolePage,
  })),
);
const DecisionCardPage = lazy(() =>
  import('../pages/DecisionCardPage.js').then((module) => ({
    default: module.DecisionCardPage,
  })),
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
          path: 'login',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <LoginPage />
            </Suspense>
          ),
        },
        {
          path: 'register',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <RegisterPage />
            </Suspense>
          ),
        },
        {
          path: 'intake',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<RouteSuspenseFallback />}>
                <HouseholdIntakePage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: 'trades',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <TradeExplorerPage />
            </Suspense>
          ),
        },
        {
          path: 'trades/:code',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <TradeDetailPage />
            </Suspense>
          ),
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<RouteSuspenseFallback />}>
                <DashboardPreviewPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: 'private',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<RouteSuspenseFallback />}>
                <PrivateWindowPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: 'joint-room',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<RouteSuspenseFallback />}>
                <JointRoomPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: 'consent-ledger',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<RouteSuspenseFallback />}>
                <ConsentLedgerPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: 'counsellor',
          element: (
            <Suspense fallback={<RouteSuspenseFallback />}>
              <CounsellorConsolePage />
            </Suspense>
          ),
        },
        {
          path: 'decision-card',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<RouteSuspenseFallback />}>
                <DecisionCardPage />
              </Suspense>
            </ProtectedRoute>
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
