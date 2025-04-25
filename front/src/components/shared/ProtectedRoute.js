import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const storedToken = localStorage.getItem('token');

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    token,
    user,
    storedToken,
  });

  if (!isAuthenticated || !token || !storedToken) {
    console.log('Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;