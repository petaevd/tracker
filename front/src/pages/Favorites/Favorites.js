import React, { useState, useEffect } from 'react';
import { FaBookmark, FaTrash } from 'react-icons/fa';
import './Favorites.css';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const Favorites = () => {

  const user = useSelector((state) => state.auth.user);
  // ================ Избранные задачи ================

  const getFavoritesKey = () => `favoriteTasks_${user.id}`;

  const priorityMap = {
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая',
  };

  const getFavoriteTasks = () => {
    const data = localStorage.getItem(getFavoritesKey());
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const setFavoriteTasks = (favorites) => {
    localStorage.setItem(getFavoritesKey(), JSON.stringify(favorites));
  };

  const toggleFavoriteTask = (task) => {
    let favorites = getFavoriteTasks();
    const exists = favorites.some(t => t.id === task.id);
  
    if (exists) {
      favorites = favorites.filter(t => t.id !== task.id);
    } else {
      favorites.push(task);
    }
  
    setFavoriteTasks(favorites);
    return favorites;
  };

  const [favoriteTasks, setFavoriteTasksState] = useState(getFavoriteTasks());

  const handleToggleFavorite = (task) => {
    const updated = toggleFavoriteTask(task);
    setFavoriteTasksState(updated);
  };

  // ================ Избранные задачи ================

  const [filter, setFilter] = useState('all');


  const filteredFavorites = favoriteTasks.filter(item => {
    return filter === 'all' || item.priority === filter;
  });


  
  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">
          {t('favorites_breadcrumb_home')} / {t('favorites_breadcrumb')}
        </div>
        <h1 className="">{t('favorites_title')}</h1>
        
        {/* Фильтры */}
        <div className="favorites-controls">
          <div className="filter-controls">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('favorites_filter_all')}
            </button>
            <button 
              className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              {t('favorites_filter_low')}
            </button>
            <button 
              className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
              onClick={() => setFilter('medium')}
            >
              {t('favorites_filter_medium')}
            </button>
            <button 
              className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              {t('favorites_filter_high')}
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
                    {typeof item.tags === 'string' && item.tags.trim() && (
                      <div className="task-tags my-1">
                        {item.tags.split(',').map((tag, index) => (
                          <span key={index} className="badge mx-1">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="favorite-meta">
                      <span className={`difficulty-badge ${item.priority}`}>
                        {priorityMap[item.priority]}
                      </span>
                      <span className="category-tag">{item.category}</span>
                      <span className="tech-tag">{item.tech}</span>
                    </div>
                  </div>
                </div>
                <button 
                  className="remove-favorite-btn"
                  onClick={() => handleToggleFavorite(item)}
                  title={t('favorites_remove_tooltip')}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>{t('favorites_empty_state')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;