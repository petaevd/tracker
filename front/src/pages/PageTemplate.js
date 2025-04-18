import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './PageTemplate.css';

const PageTemplate = ({ user, onLogout, title, children }) => {
  return (
    <div className="page-container">
      {/* Верхняя панель */}
      <div className="top-bar">
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Поиск..." className="search-input" />
          </div>
        </div>
        
        {/* Блок пользователя */}
        <div className="user-panel">
          {user ? (
            <>
              <div className="user-avatar" title={user.email}>
                {user.avatarLetter}
              </div>
              <button onClick={onLogout} className="logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <a href="/login" className="login-btn">Войти</a>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="main-content">
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default PageTemplate;