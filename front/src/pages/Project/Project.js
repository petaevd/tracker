import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, editProject, removeProject } from '../../store/slices/projectSlice';
import { fetchTeams } from '../../api/teamApi';
import { toast } from 'react-toastify';
import './Project.css';

const Project = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);
  const user = useSelector((state) => state.auth.user); // Получаем user из Redux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, есть ли пользователь
    if (!user) {
      navigate('/login'); // Перенаправляем на логин, если пользователь не авторизован
      return;
    }

    dispatch(getProjects());
    if (user.role !== 'employee') {
      fetchTeams()
        .then((data) => setTeams(data))
        .catch(() => toast.error('Ошибка загрузки команд'));
    }
  }, [dispatch, user, navigate]);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !teamId) {
      toast.error('Заполните название и выберите команду');
      return;
    }

    try {
      const response = await dispatch(
        addProject({ name: projectName, description: projectDescription, team_id: teamId })
      ).unwrap();
      setProjectName('');
      setProjectDescription('');
      setTeamId('');
      setShowCreateModal(false);
      toast.success('Проект успешно создан');
      navigate(`/project/${response.id}/dashboard`);
    } catch (err) {
      toast.error(err || 'Ошибка создания проекта');
    }
  };

  const handleEditProject = async () => {
    if (!projectName.trim() || !teamId) {
      toast.error('Заполните название и выберите команду');
      return;
    }

    try {
      await dispatch(
        editProject({ id: selectedProjectId, projectData: { name: projectName, description: projectDescription, team_id: teamId } })
      ).unwrap();
      setProjectName('');
      setProjectDescription('');
      setTeamId('');
      setShowEditModal(false);
      setSelectedProjectId(null);
      toast.success('Проект успешно обновлён');
    } catch (err) {
      toast.error(err || 'Ошибка редактирования проекта');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Вы уверены, что хотите удалить проект?')) {
      try {
        await dispatch(removeProject(projectId)).unwrap();
        toast.success('Проект успешно удалён');
      } catch (err) {
        toast.error(err || 'Ошибка удаления проекта');
      }
    }
  };

  const handleProjectClick = (projectId) => {
    if (projectId) {
      navigate(`/project/${projectId}/dashboard`);
    }
  };

  const openEditModal = (project) => {
    setSelectedProjectId(project.id);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setTeamId(project.team_id);
    setShowEditModal(true);
  };

  // Если пользователь не загружен, показываем лоадер или ничего
  if (!user) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="project-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Проекты</div>
        <h1 className="project-title">Проекты</h1>
        <p className="project-subtitle">Управление и мониторинг ваших проектов</p>

        {error && <div className="error-message">{error}</div>}

        <div className="action-buttons">
          {user.role !== 'employee' && (
            <button
              className="action-btn purple"
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
            >
              <FaPlus /> Создать проект
            </button>
          )}
        </div>

        {loading && <div className="loading-message">Загрузка...</div>}

        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 onClick={() => handleProjectClick(project.id)}>{project.name}</h3>
                  {user.role !== 'employee' && (
                    <div className="project-actions">
                      <button className="project-action-btn" onClick={() => openEditModal(project)}>
                        <FaEdit />
                      </button>
                      <button className="project-action-btn" onClick={() => handleDeleteProject(project.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <p>{project.description || 'Описание отсутствует'}</p>
                <div className="project-meta">
                  <span>Команда: {project.team?.name || 'Не указана'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="empty-state">
              <p>У вас пока нет проектов. {user.role !== 'employee' ? 'Создайте свой первый проект!' : ''}</p>
            </div>
          )
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
              <input
                type="text"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Описание проекта"
                className="modal-input"
                disabled={loading}
              />
              <select
                className="modal-input"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={loading}
              >
                <option value="" disabled>Выберите команду</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowCreateModal(false)}
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

        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Редактировать проект</h3>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Название проекта"
                className="modal-input"
                disabled={loading}
              />
              <input
                type="text"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Описание проекта"
                className="modal-input"
                disabled={loading}
              />
              <select
                className="modal-input"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={loading}
              >
                <option value="" disabled>Выберите команду</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProjectId(null);
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={handleEditProject}
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
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