import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@saathi/shared';
import { useSessionStore } from '../../stores/session.store.js';
import { Skeleton } from '../ui/Skeleton.js';
import { ErrorState } from '../ui/ErrorState.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useSessionStore();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <Skeleton height={40} width="50%" />
        <Skeleton height={200} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="py-12">
        <ErrorState
          title={t('common.accessRestricted')}
          description={t('common.roleNotAuthorized', { role: user.role })}
        />
      </div>
    );
  }

  return <>{children}</>;
};
