import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { sessionService } from '../services/session.service';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredScopes?: string[];
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requiredScopes = [],
  allowedRoles = [],
}: ProtectedRouteProps) {
  const location = useLocation();
  const session = sessionService.get();

  if (!session || sessionService.isExpired(session)) {
    sessionService.clear();
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'expired' }} />;
  }

  const isCustomer =
    session.profile.actorType === 'CLIENTE' &&
    session.profile.referenceType === 'CUSTOMER' &&
    Boolean(session.profile.customerUuid);

  if (!isCustomer) {
    sessionService.clear();
    return <Navigate to="/login" replace state={{ reason: 'customer-only' }} />;
  }

  const hasScopes = requiredScopes.every((scope) => session.profile.scopes.includes(scope));
  const hasRole =
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => session.profile.roles.includes(role));

  if (!hasScopes || !hasRole) {
    return <Navigate to="/" replace state={{ reason: 'forbidden' }} />;
  }

  return children;
}
