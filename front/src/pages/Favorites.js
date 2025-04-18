import React, { useState, useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt, FaBookmark, FaTrash, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Favorites.css';

const Favorites = ({ user, onLogout }) => {
  const [favorites, setFavorites] = useState([
    { id: 1, title: 'Задача по математике', subject: 'Математика', difficulty: 'Средняя', isBookmarked: true },
    { id: 2, title: 'Лабораторная по физике', subject: 'Физика', difficulty: 'Высокая', isBookmarked: true },
    { id: 3, title: 'Эссе по литературе', subject: 'Литература', difficulty: 'Низкая', isBookmarked: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

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

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || item.difficulty.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-container">
      {/* Верхняя панель с поиском */}
      <div className="top-bar">
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              id="search-input" 
              type="text" 
              placeholder="Поиск" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
        <div className="breadcrumb">Домашняя / Избранное</div>
        <h1 className="dashboard-title">Избранное</h1>
        <p className="dashboard-subtitle">Ваши сохраненные элементы и закладки</p>
        
        {/* Фильтры и управление */}
        <div className="favorites-controls">
          <div className="filter-controls">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все
            </button>
            <button 
              className={`filter-btn ${filter === 'низкая' ? 'active' : ''}`}
              onClick={() => setFilter('низкая')}
            >
              Легкие
            </button>
            <button 
              className={`filter-btn ${filter === 'средняя' ? 'active' : ''}`}
              onClick={() => setFilter('средняя')}
            >
              Средние
            </button>
            <button 
              className={`filter-btn ${filter === 'высокая' ? 'active' : ''}`}
              onClick={() => setFilter('высокая')}
            >
              Сложные
            </button>
          </div>
        </div>
        
        {/* Список избранных задач */}
        <div className="favorites-list">
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map(item => (
              <div key={item.id} className="favorite-item">
                <div className="favorite-content">
                  <div className="favorite-icon">
                    <FaBookmark className="bookmark-icon" />
                  </div>
                  <div className="favorite-details">
                    <h3 className="favorite-title">{item.title}</h3>
                    <div className="favorite-meta">
                      <span className={`difficulty-badge ${item.difficulty.toLowerCase()}`}>
                        {item.difficulty}
                      </span>
                      <span className="subject-tag">{item.subject}</span>
                    </div>
                  </div>
                </div>
                <button 
                  className="remove-favorite-btn"
                  onClick={() => removeFromFavorites(item.id)}
                  title="Удалить из избранного"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Нет избранных задач</p>
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Очистить поиск
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;