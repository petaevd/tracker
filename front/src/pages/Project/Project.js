import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, editProject, removeProject } from '../../store/slices/projectSlice';
import { getTeams, addTeam, addMember, searchUsers, clearSearchResults } from '../../store/slices/teamSlice';
import { toast } from 'react-toastify';
import './Project.css';

const Project = () => {
  const dispatch = useDispatch();
  const { projects, loading: projectLoading, error: projectError } = useSelector((state) => state.projects);
  const { teams, searchResults, loading: teamLoading, error: teamError } = useSelector((state) => state.teams);
  const user = useSelector((state) => state.auth.user);
  const [modalType, setModalType] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState('active');
  const [deadline, setDeadline] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(getProjects());
    dispatch(getTeams(user)); // Передаём user для фильтрации команд
    return () => {
      dispatch(clearSearchResults()); // Очищаем результаты поиска при размонтировании
    };
  }, [dispatch, user, navigate]);

  const resetProjectForm = () => {
    setProjectName('');
    setProjectDescription('');
    setTeamId('');
    setStatus('active');
    setDeadline('');
  };

  const resetTeamForm = () => {
    setTeamName('');
    setTeamDescription('');
    setUserEmail('');
    setSelectedUsers([]);
    dispatch(clearSearchResults());
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
      resetProjectForm();
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
      resetProjectForm();
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

  const handleCreateTeam = useCallback(async () => {
    if (!teamName.trim()) {
      toast.error('Название команды обязательно');
      return;
    }

    try {
      const response = await dispatch(
        addTeam({
          name: teamName,
          description: teamDescription,
          created_by: user.id,
        })
      ).unwrap();

      // Добавление выбранных пользователей в команду
      for (const userId of selectedUsers) {
        const user = searchResults.find((u) => u.id === userId);
        if (user) {
          await dispatch(addMember({ teamId: response.id, user })).unwrap();
        }
      }

      resetTeamForm();
      setModalType(null);
      toast.success('Команда успешно создана');
    } catch (err) {
      toast.error(err || 'Ошибка создания команды');
    }
  }, [teamName, teamDescription, user, selectedUsers, searchResults, dispatch]);

  const handleSearchUsers = useCallback(async () => {
    if (!userEmail.trim()) {
      toast.error('Введите email для поиска');
      return;
    }

    try {
      await dispatch(searchUsers(userEmail)).unwrap();
    } catch (err) {
      toast.error(err || 'Ошибка поиска пользователей');
    }
  }, [userEmail, dispatch]);

  const handleSelectUser = (userId) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  };

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
    resetProjectForm();
    resetTeamForm();
  };

  if (!user) {
    return <div className="loading-message">Загрузка...</div>;
  }

  // Фильтрация команд для менеджера (уже выполняется на бэкенде, но оставим для совместимости)
  const filteredTeams = user.role === 'manager' ? teams.filter((team) => team.created_by === user.id) : teams;

  return (
    <div className="project-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Проекты</div>
        <h1 className="project-title">Проекты</h1>
        <p className="project-subtitle">Управление и мониторинг ваших проектов</p>

        {projectError && <div className="error-message">{projectError}</div>}
        {teamError && <div className="error-message">{teamError}</div>}

        <div className="action-buttons">
          {user.role !== 'employee' && (
            <>
              <button
                className="action-btn purple"
                data-bs-toggle="modal"
                data-bs-target="#projectModal"
                onClick={() => setModalType('create')}
                disabled={projectLoading || teamLoading}
              >
                <FaPlus /> Создать проект
              </button>
              <button
                className="action-btn blue"
                data-bs-toggle="modal"
                data-bs-target="#teamModal"
                onClick={() => setModalType('createTeam')}
                disabled={teamLoading}
              >
                <FaUsers /> Создать команду
              </button>
            </>
          )}
        </div>

        {(projectLoading || teamLoading) && <div className="loading-message">Загрузка...</div>}

        <div className="teams-section">
          <h2 className="section-title">Доступные команды</h2>
          {filteredTeams.length > 0 ? (
            <div className="teams-grid">
              {filteredTeams.map((team) => (
                <div key={team.id} className="team-card">
                  <h3>{team.name}</h3>
                  <p>{team.description || 'Описание отсутствует'}</p>
                  <div className="team-meta">
                    <span>Создатель: {team.creator?.username || 'Не указан'}</span>
                    <span>Участников: {team.members?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Нет доступных команд. {user.role !== 'employee' ? 'Создайте свою первую команду!' : ''}</p>
            </div>
          )}
        </div>

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
          !projectLoading && (
            <div className="empty-state">
              <p>У вас пока нет проектов. {user.role !== 'employee' ? 'Создайте свой первый проект!' : ''}</p>
            </div>
          )
        )}

        {/* Модальное окно для проекта */}
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
                    disabled={projectLoading}
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
                    disabled={projectLoading}
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
                    disabled={projectLoading}
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
                    disabled={projectLoading}
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
                    disabled={projectLoading}
                  >
                    <option value="" disabled>
                      Выберите команду
                    </option>
                    {filteredTeams.map((team) => (
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
                  disabled={projectLoading}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={modalType === 'create' ? handleCreateProject : handleEditProject}
                  disabled={projectLoading}
                >
                  {projectLoading ? 'Сохранение...' : modalType === 'create' ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно для команды */}
        <div
          className="modal fade"
          id="teamModal"
          tabIndex="-1"
          aria-labelledby="teamModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="teamModalLabel">
                  Создать новую команду
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
                  <label htmlFor="teamName" className="form-label">
                    Название команды
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Название команды"
                    disabled={teamLoading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="teamDescription" className="form-label">
                    Описание команды
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="teamDescription"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Описание команды"
                    disabled={teamLoading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="userEmail" className="form-label">
                    Добавить участников по email
                  </label>
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control"
                      id="userEmail"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Введите email"
                      disabled={teamLoading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleSearchUsers}
                      disabled={teamLoading}
                    >
                      Поиск
                    </button>
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Найденные пользователи</label>
                    <ul className="list-group">
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {result.username} ({result.email})
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSelectUser(result.id)}
                            disabled={selectedUsers.includes(result.id) || teamLoading}
                          >
                            Добавить
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedUsers.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Выбранные участники</label>
                    <ul className="list-group">
                      {selectedUsers.map((userId) => {
                        const user = searchResults.find((u) => u.id === userId);
                        return (
                          user && (
                            <li
                              key={user.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              {user.username} ({user.email})
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveUser(user.id)}
                                disabled={teamLoading}
                              >
                                Удалить
                              </button>
                            </li>
                          )
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={closeModal}
                  disabled={teamLoading}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateTeam}
                  disabled={teamLoading}
                >
                  {teamLoading ? 'Сохранение...' : 'Создать'}
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