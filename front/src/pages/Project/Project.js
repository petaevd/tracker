import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [modalType, setModalType] = useState(null); // 'create', 'edit', или null
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();
  const modalRef = useRef(null);

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

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && !loading) {
      setModalType(null);
      setSelectedProjectId(null);
      resetForm();
    }
  }, [loading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setTeamId('');
  };

  const handleCreateProject = useCallback(async () => {
    if (!projectName.trim() || !teamId) {
      toast.error('Название проекта и команда обязательны');
      return;
    }

    try {
      const response = await dispatch(
        addProject({ name: projectName, description: projectDescription, team_id: teamId })
      ).unwrap();
      resetForm();
      setModalType(null);
      toast.success('Проект успешно создан');
      navigate(`/project/${response.id}/dashboard`);
    } catch (err) {
      toast.error(err || 'Ошибка создания проекта');
    }
  }, [projectName, projectDescription, teamId, dispatch, navigate]);

  const handleEditProject = useCallback(async () => {
    if (!projectName.trim() || !teamId) {
      toast.error('Название проекта и команда обязательны');
      return;
    }

    try {
      await dispatch(
        editProject({
          id: selectedProjectId,
          projectData: { name: projectName, description: projectDescription, team_id: teamId },
        })
      ).unwrap();
      resetForm();
      setModalType(null);
      setSelectedProjectId(null);
      toast.success('Проект успешно обновлён');
    } catch (err) {
      toast.error(err || 'Ошибка редактирования проекта');
    }
  }, [selectedProjectId, projectName, projectDescription, teamId, dispatch]);

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
    setModalType('edit');
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !loading) {
      setModalType(null);
      setSelectedProjectId(null);
      resetForm();
    }
  }, [loading]);

  const Modal = ({ type }) => {
    if (!type) return null;

    const isCreate = type === 'create';
    const title = isCreate ? 'Создать новый проект' : 'Редактировать проект';
    const onConfirm = isCreate ? handleCreateProject : handleEditProject;

    return createPortal(
      <div
        className="modal-overlay"
        onClick={handleOverlayClick}
        role="dialog"
        aria-labelledby={`${type}-modal-title`}
      >
        <div className="modal" ref={modalRef}>
          <h3 id={`${type}-modal-title`}>{title}</h3>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Название проекта"
            className="modal-input"
            disabled={loading}
            aria-label="Название проекта"
          />
          <input
            type="text"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Описание проекта"
            className="modal-input"
            disabled={loading}
            aria-label="Описание проекта"
          />
          <select
            className="modal-input"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            disabled={loading}
            aria-label="Выберите команду"
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
                setModalType(null);
                setSelectedProjectId(null);
                resetForm();
              }}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              className="modal-btn confirm"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Сохранение...' : isCreate ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
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

        <Modal type={modalType} />
      </div>
    </div>
  );
};

export default Project;