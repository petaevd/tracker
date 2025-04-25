import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout } from './store/slices/authSlice';
import Home from './pages/Home/Home';
import Calendar from './pages/Calendar/Calendar';
import Dashboard from './pages/Dashboard/Dashboard';
import Project from './pages/Project/Project';
import Favorites from './pages/Favorites/Favorites';
import Settings from './pages/Settings/Settings';
import Help from './pages/Help/Help';
import Navbar from './pages/NavBar/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/shared/ProtectedRoute';

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));
      } catch (e) {
        console.error('Ошибка при загрузке пользователя:', e);
        dispatch(logout());
      }
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/project" element={
          <ProtectedRoute>
            <Project user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/project/:projectId/dashboard" element={
          <ProtectedRoute>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <Favorites user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <Help user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;