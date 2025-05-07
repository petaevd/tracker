import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState, logout } from './store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import Home from './pages/Home/Home';
import Calendar from './pages/Calendar/Calendar';
import Dashboard from './pages/Dashboard/Dashboard';
import Project from './pages/Project/Project';
import Favorites from './pages/Favorites/Favorites';
import Settings from './pages/Settings/Settings';
import Help from './pages/Help/Help';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskListPage from './components/TaskList/TaskList';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/Layout/Layout';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        dispatch(logout());
        setIsLoading(false);
        return;
      }

      try {
        // Проверяем срок действия токена
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        const parsedUser = JSON.parse(storedUser);
        dispatch(setAuthState({ user: parsedUser, token }));
      } catch (error) {
        console.error('Authentication error:', error);
        dispatch(logout());
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project"
          element={
            <ProtectedRoute>
              <Layout>
                <Project />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Layout>
                <Favorites />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Layout>
                <Help />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Добавленный маршрут для страницы задач */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <TaskListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;