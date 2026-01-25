import { lazy, Suspense } from 'react';
import {
  BrowserRouter as AppRouter,
  Routes as AppRoutes,
  Navigate,
  Outlet,
  Route,
} from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAppSelector } from '../store/hooks';

// Lazy load components for better performance
const Login = lazy(() => import('../views/auth/Login'));
const Register = lazy(() => import('../views/auth/Register'));
const CreateProject = lazy(() => import('../views/create-project/CreateProject'));
const Dashboard = lazy(() => import('../views/Dashboard'));
const Project = lazy(() => import('../views/home/project/Project'));
const Landing = lazy(() => import('../views/Landing'));
const NotFound = lazy(() => import('../views/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0B0E11]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#17E1FF]/20 border-t-[#17E1FF] rounded-full animate-spin" />
      <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Loading...</p>
    </div>
  </div>
);

// Private route wrapper - redirects to login if not authenticated
const PrivateRoute = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public route wrapper - redirects to dashboard if already authenticated
const PublicRoute = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const Routes = () => {
  return (
    <AppRouter>
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            {/* Landing page with Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
            </Route>

            {/* Auth pages without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            {/* Routes WITH Navigation */}
            <Route element={<Layout />}>
              <Route path="/projects" element={<Dashboard />} />
            </Route>

            {/* Routes WITHOUT Navigation */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/team" element={<Dashboard />} />
            <Route path="/activity" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/help" element={<Dashboard />} />
          </Route>

          {/* 404 Not Found - Accessible to everyone */}
          <Route path="/not-found" element={<NotFound />} />

          {/* Catch-all - Redirect unknown routes to NotFound */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </AppRoutes>
      </Suspense>
    </AppRouter>
  );
};

export default Routes;
