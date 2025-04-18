import React, { useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Help.css';

const Help = ({ user, onLogout }) => {
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

  const getAvatarLetter = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
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
        <div className="breadcrumb">Домашняя/Помощь</div>
        <h1 className="dashboard-title"> Помощь</h1>

        <p className="dashboard-subtitle">Найдите ответы на ваши вопросы</p>
        
        {/* Секции помощи */}
        <div className="help-sections">
          <div className="help-section">
            <h2 className="help-section-title">Основные вопросы</h2>
            <div className="help-item">
              <h3 className="help-question">Как создать новый проект?</h3>
              <p className="help-answer">Перейдите в раздел "Проекты" и нажмите кнопку "Создать проект". Заполните необходимые поля и сохраните.</p>
            </div>
            <div className="help-item">
              <h3 className="help-question">Как пригласить участников?</h3>
              <p className="help-answer">В настройках проекта есть раздел "Участники", где вы можете отправить приглашения по email.</p>
            </div>
          </div>
          
          <div className="help-section">
            <h2 className="help-section-title">Настройки аккаунта</h2>
            <div className="help-item">
              <h3 className="help-question">Как изменить пароль?</h3>
              <p className="help-answer">В разделе "Настройки" - "Безопасность" вы можете изменить ваш пароль.</p>
            </div>
            <div className="help-item">
              <h3 className="help-question">Как обновить профиль?</h3>
              <p className="help-answer">Перейдите в "Настройки" - "Профиль" для изменения информации о себе.</p>
            </div>
          </div>
          
          <div className="help-section">
            <h2 className="help-section-title">Горячие клавиши</h2>
            <div className="help-item">
              <h3 className="help-question">Быстрый поиск</h3>
              <p className="help-answer">Используйте Ctrl+F (Cmd+F на Mac) для быстрого доступа к поиску.</p>
            </div>
            <div className="help-item">
              <h3 className="help-question">Навигация</h3>
              <p className="help-answer">Alt+Стрелки для быстрой навигации между разделами.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;