import React, { useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from '../../store/slices/projectSlice';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, loading, error } = useSelector((state) => state.projects);

  // Загрузка проектов, если они еще не загружены
  useEffect(() => {
    if (!projects.length) {
      dispatch(getProjects());
    }
  }, [dispatch, projects.length]);

  // Находим проект по ID
  const project = projects.find((p) => p.id === projectId);

  // Обработчик Command+F
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

  // Получение первой буквы для аватара
  const getAvatarLetter = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="dashboard-container">
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

      <div className="main-content">
        <div className="breadcrumb">Домашняя / Проект / {project?.name || 'Панель управления'}</div>
        <h1 className="dashboard-title">{project?.name || 'Панель управления проектом'}</h1>
        <p className="dashboard-subtitle">
          {project ? `Управляйте проектом "${project.name}"` : 'Внимательно изучите показатели и управляйте своим проектом'}
        </p>

        {loading && <div className="loading-message">Загрузка...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !project && !error && (
          <div className="error-message">Проект не найден</div>
        )}

        {project && (
          <div className="project-details">
            <div className="dashboard-card">
              <h3 className="card-title">Информация о проекте</h3>
              <p><strong>Описание:</strong> {project.description || 'Нет описания'}</p>
              <p><strong>Досок:</strong> {project.boards?.length || 0}</p>
              <p><strong>Участников:</strong> {project.members_count || 1}</p>
            </div>
            <div className="dashboard-card">
              <h3 className="card-title">Доски проекта</h3>
              {project.boards?.length > 0 ? (
                <ul>
                  {project.boards.map((board) => (
                    <li key={board.id}>{board.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Доски отсутствуют</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;