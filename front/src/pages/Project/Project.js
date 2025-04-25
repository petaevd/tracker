import React, { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaColumns, FaEllipsisH } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, addBoard, addUser } from '../../store/slices/projectSlice';
import './Project.css';

const Project = ({ user }) => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [boardName, setBoardName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch, user, navigate]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      dispatch({ type: 'projects/setError', payload: 'Название проекта не может быть пустым' });
      return;
    }

    try {
      const response = await dispatch(
        addProject({ name: projectName, description: 'Новый проект' })
      ).unwrap();
      setProjectName('');
      setShowCreateModal(false);
      navigate(`/project/${response.id}/dashboard`);
    } catch (err) {
      console.error('Ошибка создания проекта:', err);
      dispatch({ type: 'projects/setError', payload: err.message || 'Ошибка создания проекта' });
    }
  };

  const handleAddBoard = async () => {
    if (!boardName.trim()) {
      dispatch({ type: 'projects/setError', payload: 'Название доски не может быть пустым' });
      return;
    }

    if (!selectedProjectId) {
      dispatch({ type: 'projects/setError', payload: 'Выберите проект' });
      return;
    }

    try {
      await dispatch(
        addBoard({ projectId: selectedProjectId, boardData: { name: boardName } })
      ).unwrap();
      setBoardName('');
      setShowAddBoardModal(false);
      alert('Доска добавлена (заглушка, данные не сохраняются на сервере)');
    } catch (err) {
      console.error('Ошибка создания доски:', err);
      dispatch({ type: 'projects/setError', payload: err.message || 'Ошибка добавления доски' });
    }
  };

  const handleAddUser = async () => {
    if (!userEmail.trim()) {
      dispatch({ type: 'projects/setError', payload: 'Введите email пользователя' });
      return;
    }

    if (!selectedProjectId) {
      dispatch({ type: 'projects/setError', payload: 'Выберите проект' });
      return;
    }

    try {
      await dispatch(
        addUser({ projectId: selectedProjectId, userData: { email: userEmail } })
      ).unwrap();
      setUserEmail('');
      setShowAddUserModal(false);
      alert(`Пользователь ${userEmail} добавлен (заглушка, данные не сохраняются на сервере)`);
    } catch (err) {
      console.error('Ошибка добавления пользователя:', err);
      dispatch({ type: 'projects/setError', payload: err.message || 'Ошибка добавления пользователя' });
    }
  };

  const handleProjectClick = (projectId) => {
    if (projectId) {
      navigate(`/project/${projectId}/dashboard`);
    } else {
      console.error('Project ID is undefined');
    }
  };

  return (
    <div className="project-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Проект</div>
        <h1 className="project-title">Проект</h1>
        <p className="project-subtitle">Управление и мониторинг вашего проекта</p>

        {error && <div className="error-message">{error}</div>}

        <div className="action-buttons">
          <button
            className="action-btn purple"
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
          >
            <FaPlus /> Создать проект
          </button>
          <button
            className="action-btn purple"
            onClick={() => setShowAddBoardModal(true)}
            disabled={projects.length === 0 || loading}
          >
            <FaColumns /> Добавить доску
          </button>
          <button
            className="action-btn purple"
            onClick={() => setShowAddUserModal(true)}
            disabled={projects.length === 0 || loading}
          >
            <FaUsers /> Добавить пользователя
          </button>
        </div>

        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 onClick={() => handleProjectClick(project.id)}>{project.name}</h3>
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
            <p>У вас пока нет проектов. Создайте свой первый проект!</p>
          </div>
        )}

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
                    dispatch({ type: 'projects/setError', payload: '' });
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

        {showAddBoardModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Добавить новую доску</h3>
              <select
                className="modal-input"
                onChange={(e) => setSelectedProjectId(e.target.value)}
                defaultValue=""
                disabled={loading}
              >
                <option value="" disabled>
                  Выберите проект
                </option>
                {projects.map((project) => (
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
                    dispatch({ type: 'projects/setError', payload: '' });
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={handleAddBoard}
                  disabled={loading}
                >
                  {loading ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Добавить пользователя в проект</h3>
              <select
                className="modal-input"
                onChange={(e) => setSelectedProjectId(e.target.value)}
                defaultValue=""
                disabled={loading}
              >
                <option value="" disabled>
                  Выберите проект
                </option>
                {projects.map((project) => (
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
                    dispatch({ type: 'projects/setError', payload: '' });
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={handleAddUser}
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