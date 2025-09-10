import { BrowserRouter as AppRouter, Routes as AppRoutes, Navigate, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Login from '../views/auth/Login';
import Register from '../views/auth/Register';
import CreateProject from '../views/create-project/CreateProject';
import Dashboard from '../views/Dashboard';
import Project from '../views/home/project/Project';
import Landing from '../views/Landing';

const isAuthenticated = () => {
  const token = localStorage.getItem('codex_token');
  const teamName = localStorage.getItem('codex_team');
  const username = localStorage.getItem('codex_username');

  if (!token || !teamName || !username) return false;

  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    if (tokenData.exp && tokenData.exp < currentTime) {
      localStorage.clear();
      return false;
    }
    return true;
  } catch {
    localStorage.clear();
    return false;
  }
};

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

const PublicRoute = ({ children }) =>
  isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;

const Routes = () => {
  return (
    <AppRouter>
      <AppRoutes>
        {/* Public Routes inside Layout */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Layout />
            </PublicRoute>
          }
        >
          <Route index element={<Landing />} />
        </Route>

        {/* Auth Routes (without Layout) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          // element={
          //   <ProtectedRoute>
          //     <Layout />
          //   </ProtectedRoute>
          // }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Dashboard />} />
          <Route path="create-project" element={<CreateProject />} />
          <Route path="project/:id" element={<Project />} />
          <Route path="team" element={<Dashboard />} />
          <Route path="activity" element={<Dashboard />} />
          <Route path="settings" element={<Dashboard />} />
          <Route path="help" element={<Dashboard />} />
        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? '/dashboard' : '/'} replace />}
        />
      </AppRoutes>
    </AppRouter>
  );
};

export default Routes;
