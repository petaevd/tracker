import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Favorites from './pages/Favorites'; // Новая страница
import Settings from './pages/Settings'; // Новая страница
import Help from './pages/Help'; // Новая страница
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Ошибка при загрузке пользователя:', e);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    const userWithAvatar = {
      ...userData,
      avatarLetter: userData.username?.charAt(0).toUpperCase() || 
                   userData.email?.charAt(0).toUpperCase() || 'U'
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithAvatar));
    setUser(userWithAvatar);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setEvents([]);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        <Route path="/home" element={<Home user={user} onLogout={handleLogout} />} />
        <Route path="/calendar" element={
          <Calendar 
            user={user} 
            events={events} 
            setEvents={setEvents} 
            onLogout={handleLogout}
          />
        } />
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/project" element={<Project user={user} onLogout={handleLogout} />} />
        <Route path="/favorites" element={<Favorites user={user} onLogout={handleLogout} />} />
        <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} />} />
        <Route path="/help" element={<Help user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={
          user ? <Home user={user} /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Home user={user} /> : <Register onLogin={handleLogin} />
        } />
      </Routes>
    </Router>
  );
};

export default App;