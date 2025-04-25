import React, { useState, useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';


const Dashboard = ({ sharedEvents = [], user, onLogout }) => {
    // Обработчик нажатия Command+F
    useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
          e.preventDefault();
          document.getElementById('search-input').focus();
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
  // Функция для получения первой буквы (из username или email)
  const getAvatarLetter = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?'; // Fallback символ
  };
    const navigate = useNavigate();
  return (
    <div className="dashboard-container">
      {/* Верхняя панель с поиском */}
      <div className="top-bar">
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input id="search-input" type="text" placeholder="Поиск" className="search-input"/>
            <div className="shortcut-box">
              <span className="shortcut-key">⌘</span>
              <span className="shortcut-key">F</span>
            </div>
          </div>
        </div>
        <div className="top-bar-actions">
          <button className="share-button"><FaShareAlt /></button>
          {user ? (
            <div className="user-controls">
              <div className="user-avatar">
                {getAvatarLetter()}
              </div>
              <button 
                className="logout-btn"
                onClick={onLogout}
                title="Выйти"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button 
              className="login-btn"
              onClick={() => navigate('/login')}
            >
              <FaUser />
            </button>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="main-content">
        <div className="breadcrumb">Домашняя/Панель управления проектом</div>
        <h1 className="dashboard-title">Панель управления проектом</h1>
        <p className="dashboard-subtitle">Внимательно изучите показатели и управляйте своим проектом</p>
      </div>
    </div>
  );
};

export default Dashboard;