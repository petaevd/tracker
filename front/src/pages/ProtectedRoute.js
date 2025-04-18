import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, onlyUnauthenticated = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (onlyUnauthenticated) {
    // Для страниц входа/регистрации - перенаправляем если уже авторизованы
    return isAuthenticated ? <Navigate to="/" replace /> : children;
  }

  // Для защищенных страниц - перенаправляем если не авторизованы
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};