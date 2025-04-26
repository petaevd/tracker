import React, { useState, useEffect, useCallback } from 'react';
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
  const user = useSelector((state) => state.auth.user);
  const [modalType, setModalType] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState('active');
  const [deadline, setDeadline] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(getProjects());
    if (user.role !== 'employee') {
      fetchTeams()
        .then((data) => setTeams(data))
        .catch(() => toast.error('Ошибка загрузки команд'));
    }
  }, [dispatch, user, navigate]);

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setTeamId('');
    setStatus('active');
    setDeadline('');
  };

  const handleCreateProject = useCallback(async () => {
    if (!projectName.trim() || !teamId) {
      toast.error('Название проекта и команда обязательны');
      return;
    }

    try {
      const response = await dispatch(
        addProject({
          name: projectName,
          description: projectDescription,
          team_id: teamId,
          status,
          deadline,
        })
      ).unwrap();
      resetForm();
      setModalType(null);
      toast.success('Проект успешно создан');
      navigate(`/project/${response.id}/dashboard`);
    } catch (err) {
      toast.error(err || 'Ошибка создания проекта');
    }
  }, [projectName, projectDescription, teamId, status, deadline, dispatch, navigate]);

  const handleEditProject = useCallback(async () => {
    if (!projectName.trim() || !teamId) {
      toast.error('Название проекта и команда обязательны');
      return;
    }

    try {
      await dispatch(
        editProject({
          id: selectedProjectId,
          projectData: {
            name: projectName,
            description: projectDescription,
            team_id: teamId,
            status,
            deadline,
          },
        })
      ).unwrap();
      resetForm();
      setModalType(null);
      setSelectedProjectId(null);
      toast.success('Проект успешно обновлён');
    } catch (err) {
      toast.error(err || 'Ошибка редактирования проекта');
    }
  }, [selectedProjectId, projectName, projectDescription, teamId, status, deadline, dispatch]);

  const handleDeleteProject = useCallback(async (projectId) => {
    if (window.confirm('Вы уверены, что хотите удалить проект?')) {
      try {
        await dispatch(removeProject(projectId)).unwrap();
        toast.success('Проект успешно удалён');
      } catch (err) {
        toast.error(err || 'Ошибка удаления проекта');
      }
    }
  }, [dispatch]);

  const handleProjectClick = useCallback((projectId) => {
    if (projectId) {
      navigate(`/project/${projectId}/dashboard`);
    }
  }, [navigate]);

  const openEditModal = useCallback((project) => {
    setSelectedProjectId(project.id);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setTeamId(project.team_id);
    setStatus(project.status || 'active');
    setDeadline(project.deadline || '');
    setModalType('edit');
  }, []);

  const closeModal = () => {
    setModalType(null);
    setSelectedProjectId(null);
    resetForm();
  };

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
              data-bs-toggle="modal"
              data-bs-target="#projectModal"
              onClick={() => setModalType('create')}
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
                      <button
                        className="project-action-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#projectModal"
                        onClick={() => openEditModal(project)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="project-action-btn"
                        onClick={() => handleDeleteProject(project.id)}
                      >
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

        <div
          className="modal fade"
          id="projectModal"
          tabIndex="-1"
          aria-labelledby="projectModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="projectModalLabel">
                  {modalType === 'create' ? 'Создать новый проект' : 'Редактировать проект'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Закрыть"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="projectName" className="form-label">
                    Название проекта
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Название проекта"
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="projectDescription" className="form-label">
                    Описание проекта
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Описание проекта"
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="projectStatus" className="form-label">
                    Статус проекта
                  </label>
                  <select
                    className="form-select"
                    id="projectStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                  >
                    <option value="active">Активный</option>
                    <option value="archived">Архивированный</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="projectDeadline" className="form-label">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="projectDeadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="teamSelect" className="form-label">
                    Выберите команду
                  </label>
                  <select
                    className="form-select"
                    id="teamSelect"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="" disabled>
                      Выберите команду
                    </option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={modalType === 'create' ? handleCreateProject : handleEditProject}
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : modalType === 'create' ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;