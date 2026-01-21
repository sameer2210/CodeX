import {
  BrowserRouter as AppRouter,
  Routes as AppRoutes,
  Navigate,
  Outlet,
  Route,
} from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAppSelector } from '../store/hooks';
import Login from '../views/auth/Login';
import Register from '../views/auth/Register';
import CreateProject from '../views/create-project/CreateProject';
import Dashboard from '../views/Dashboard';
import Project from '../views/home/project/Project';
import Landing from '../views/Landing';
import NotFound from '../views/NotFound';

const PrivateRoute = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const Routes = () => {
  return (
    <AppRouter>
      <AppRoutes>
        {/* Public Routes (with Layout where needed) */}
        <Route element={<PublicRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes (no global Layout; assume per-component) */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Dashboard />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/team" element={<Dashboard />} />
          <Route path="/activity" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/help" element={<Dashboard />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route element={<Layout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </AppRoutes>
    </AppRouter>
  );
};

export default Routes;
