// import { cn } from '@/lib/utils'
import React, { Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/toast"
import { ErrorBoundary } from 'react-error-boundary';
import { Routes, Route, Navigate } from 'react-router-dom'; // No need for <BrowserRouter> here
import { PATHS } from '@/utils/enums';

// Import route components
import Home from '@/pages/Home';
import Transaction from '@/pages/Transaction';
import CreateTransaction from '@/pages/CreateTransaction';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

// Loading spinner component
export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

export const LoadingSpinner = ({
  size = 24,
  className,
  ...props
}: ISVGProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      {...props}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`animate-spin ${className}`}
    >
      <path d='M21 12a9 9 0 1 1-6.219-8.56' />
    </svg>
  )
}

function ErrorFallback({ error }) {
  return (
    <div role="alert" className="text-white">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner size={32} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}>
          <Routes>
            <Route path={PATHS.DASHBOARD} element={<Home />} />
            <Route path={PATHS.TRANSACTION} element={<Transaction />} />
            <Route path={PATHS.CREATE_TRANSACTION} element={<CreateTransaction />} />
            <Route path={PATHS.SETTINGS} element={<Settings />} />
            <Route path={PATHS.REGISTER} element={<Register />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path={PATHS.LOGIN} element={<Login />} />
            <Route path="*" element={<Navigate to={PATHS.DASHBOARD} replace />} />
          </Routes>
          <Toaster />
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}