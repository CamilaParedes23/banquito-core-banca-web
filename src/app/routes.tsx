import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const ActivateAccount = lazy(() => import('./pages/ActivateAccount'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Transfers = lazy(() => import('./pages/Transfers'));
const NotFound = lazy(() => import('./pages/NotFound'));

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<Login />) },
  { path: '/activar', element: withSuspense(<ActivateAccount />) },
  {
    path: '/',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['CLIENTE_PERSONA', 'CLIENTE_EMPRESA']}>
        <Dashboard />
      </ProtectedRoute>,
    ),
  },
  {
    path: '/cuentas',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['CLIENTE_PERSONA', 'CLIENTE_EMPRESA']}>
        <Accounts />
      </ProtectedRoute>,
    ),
  },
  {
    path: '/transferencias',
    element: withSuspense(
      <ProtectedRoute
        allowedRoles={['CLIENTE_PERSONA']}
        requiredScopes={['core.account.transfer.p2p']}
      >
        <Transfers />
      </ProtectedRoute>,
    ),
  },
  { path: '*', element: withSuspense(<NotFound />) },
]);
