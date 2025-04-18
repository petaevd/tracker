import React, { useState, useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt, FaPlus, FaUsers, FaColumns, FaEllipsisH } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Project.css';
import { fetchProjects } from '../api/projectApi';

const Project = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [boardName, setBoardName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
        setError('Не удалось загрузить проекты. Проверьте подключение к серверу.');
      }
    };
    loadProjects();
  }, []);

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

  // Создание проекта
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Название проекта не может быть пустым');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/projects', {
        name: projectName,
        description: 'Новый проект'
      });

      setProjects([...projects, response.data]);
      setProjectName('');
      setShowCreateModal(false);
      navigate(`/project/${response.data.id}`);
    } catch (err) {
      console.error('Ошибка создания проекта:', err);
      setError(err.response?.data?.message || 'Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  // Добавление доски
  const handleAddBoard = async (projectId) => {
    if (!boardName.trim()) {
      setError('Название доски не может быть пустым');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`/api/projects/${projectId}/boards`, {
        name: boardName
      });

      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            boards: [...(project.boards || []), response.data]
          };
        }
        return project;
      });

      setProjects(updatedProjects);
      setBoardName('');
      setShowAddBoardModal(false);
    } catch (err) {
      console.error('Ошибка создания доски:', err);
      setError(err.response?.data?.message || 'Ошибка при создании доски');
    } finally {
      setLoading(false);
    }
  };

  // Добавление пользователя
  const handleAddUser = async (projectId) => {
    if (!userEmail.trim()) {
      setError('Введите email пользователя');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`/api/projects/${projectId}/members`, {
        email: userEmail
      });

      setUserEmail('');
      setShowAddUserModal(false);
      // Можно обновить список проектов или показать уведомление
      alert(`Пользователь ${userEmail} добавлен в проект`);
    } catch (err) {
      console.error('Ошибка добавления пользователя:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении пользователя');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация проектов по поиску
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Получение первой буквы для аватара
  const getAvatarLetter = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <div className="project-container">
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
        <div className="breadcrumb">Домашняя / Проект</div>
        <h1 className="project-title">Проект</h1>
        <p className="project-subtitle">Управление и мониторинг вашего проекта</p>

        {/* Кнопки действий */}
        <div className="action-buttons">
          <button
            className="action-btn purple"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Создать проект
          </button>
          <button
            className="action-btn purple"
            onClick={() => setShowAddBoardModal(true)}
            disabled={projects.length === 0}
          >
            <FaColumns /> Добавить доску
          </button>
          <button
            className="action-btn purple"
            onClick={() => setShowAddUserModal(true)}
            disabled={projects.length === 0}
          >
            <FaUsers /> Добавить пользователя
          </button>
        </div>

        {/* Список проектов */}
        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 onClick={() => navigate(`/project/${project.id}`)}>
                    {project.name}
                  </h3>
                  <div className="project-actions">
                    <button className="project-action-btn">
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>
                <p>{project.description || 'Описание отсутствует'}</p>
                <div className="project-meta">
                  <span>Досок: {project.boards?.length || 0}</span>
                  <span>Участников: {project.members_count || 1}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {searchQuery ? (
              <p>Проекты по запросу "{searchQuery}" не найдены</p>
            ) : (
              <p>У вас пока нет проектов. Создайте свой первый проект!</p>
            )}
          </div>
        )}

        {/* Модальное окно создания проекта */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Создать новый проект</h3>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Название проекта"
                className="modal-input"
                disabled={loading}
              />
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={handleCreateProject}
                  disabled={loading}
                >
                  {loading ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно добавления доски */}
        {showAddBoardModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Добавить новую доску</h3>
              <select className="modal-input">
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Название доски"
                className="modal-input"
                disabled={loading}
              />
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowAddBoardModal(false);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={() => handleAddBoard(projects[0].id)} // В реальном приложении нужно выбрать проект
                  disabled={loading}
                >
                  {loading ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно добавления пользователя */}
        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Добавить пользователя в проект</h3>
              <select className="modal-input">
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Email пользователя"
                className="modal-input"
                disabled={loading}
              />
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={() => handleAddUser(projects[0].id)} // В реальном приложении нужно выбрать проект
                  disabled={loading}
                >
                  {loading ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;