import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { PATHS } from '@/utils/enums';
import SlideBar from './components/common/SlideBar';

// Lazy-loaded components
const Home = lazy(() => import('@/pages/Home'));
const Transaction = lazy(() => import('@/pages/Transaction'));
const CreateWallet = lazy(() => import('@/pages/CreateWallet'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const CreateTransaction = lazy(() => import('@/pages/CreateTransaction'));

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Use null for loading state

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Check token when the page loads
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    // Show loading state while checking authentication
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return children;
  } else {
    // Redirect to login page if not authenticated
    return <Navigate to={PATHS.LOGIN} replace />;
  }
};

// Layout Component
const Layout = () => (
  <div className="flex w-full">
    <Toaster />
    <div className="w-64">
      <SlideBar />
    </div>
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  </div>
);

// Main Router Component
export default function Router() {
  return useRoutes([
    {
      path: PATHS.HOME,
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Home /> },
        { path: PATHS.CREATE_WALLET, element: <CreateWallet /> },
        { path: PATHS.TRANSACTION, element: <Transaction /> },
        { path: PATHS.CREATE_TRANSACTION, element: <CreateTransaction /> },
      ],
    },
    { path: PATHS.LOGIN, element: <Login /> },
    { path: PATHS.REGISTER, element: <Register /> }, // Ensure this is outside ProtectedRoute
    { path: '*', element: <NotFound /> },  // Catch-all route for undefined paths
  ]);
}
