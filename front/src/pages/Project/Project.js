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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();
  const createModalRef = useRef(null);
  const editModalRef = useRef(null);

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

  // Обработчик закрытия модалок по Escape
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && !loading) {
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedProjectId(null);
      setProjectName('');
      setProjectDescription('');
      setTeamId('');
    }
  }, [loading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  // Обработчик клика по оверлею
  const handleOverlayClick = (e, modalRef) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !loading) {
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedProjectId(null);
      setProjectName('');
      setProjectDescription('');
      setTeamId('');
    }
  };

  // Компонент модального окна
  const Modal = ({ show, onClose, modalRef, title, children, id }) => {
    if (!show) return null;

    return createPortal(
      <div
        className="modal-overlay"
        onClick={(e) => handleOverlayClick(e, modalRef)}
        role="dialog"
        aria-labelledby={id}
      >
        <div className="modal" ref={modalRef}>
          <h3 id={id}>{title}</h3>
          {children}
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

        <Modal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          modalRef={createModalRef}
          title="Создать новый проект"
          id="create-modal-title"
        >
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
                setShowCreateModal(false);
                setProjectName('');
                setProjectDescription('');
                setTeamId('');
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
        </Modal>

        <Modal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          modalRef={editModalRef}
          title="Редактировать проект"
          id="edit-modal-title"
        >
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
                setShowEditModal(false);
                setSelectedProjectId(null);
                setProjectName('');
                setProjectDescription('');
                setTeamId('');
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
        </Modal>
      </div>
    </div>
  );
};

export default Project;