import React, { useState } from 'react';
import { FaBookmark, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import './Favorites.css';

const Favorites = () => {
  const user = useSelector((state) => state.auth.user);
  const [favorites, setFavorites] = useState([
    { 
      id: 1, 
      title: 'Рефакторинг компонента Dashboard', 
      category: 'Frontend', 
      difficulty: 'Средняя', 
      isBookmarked: true,
      tech: 'React, Redux'
    },
    { 
      id: 2, 
      title: 'Реализация JWT аутентификации', 
      category: 'Backend', 
      difficulty: 'Высокая', 
      isBookmarked: true,
      tech: 'Node.js, Express'
    },
    { 
      id: 3, 
      title: 'Оптимизация SQL запросов', 
      category: 'Базы данных', 
      difficulty: 'Высокая', 
      isBookmarked: true,
      tech: 'PostgreSQL'
    },
    { 
      id: 4, 
      title: 'Настройка CI/CD пайплайна', 
      category: 'DevOps', 
      difficulty: 'Средняя', 
      isBookmarked: true,
      tech: 'GitHub Actions'
    },
    { 
      id: 5, 
      title: 'Создание модального окна', 
      category: 'UI/UX', 
      difficulty: 'Низкая', 
      isBookmarked: true,
      tech: 'React, CSS'
    },
  ]);
  const [filter, setFilter] = useState('all');

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const filteredFavorites = favorites.filter(item => {
    return filter === 'all' || item.difficulty.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">Главная / Избранное</div>
        <h1 className="dashboard-title">Избранные задачи</h1>
        
        {/* Фильтры */}
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
                      <span className="category-tag">{item.category}</span>
                      <span className="tech-tag">{item.tech}</span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;