import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, editProject, removeProject } from '../../store/slices/projectSlice';
import { getTeams, addTeam, addMember, removeMember, editTeam, removeTeam, searchUsers, clearSearchResults } from '../../store/slices/teamSlice';
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
  const [projectTeamId, setProjectTeamId] = useState('');
  const [status, setStatus] = useState('active');
  const [deadline, setDeadline] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [userEmails, setUserEmails] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(getProjects(user.id)).catch((err) => {
      console.error('Ошибка загрузки проектов:', err);
      toast.error('Не удалось загрузить проекты');
    });
    dispatch(getTeams(user)).catch((err) => {
      console.error('Ошибка загрузки команд:', err);
      toast.error('Не удалось загрузить команды');
    });
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, user, navigate]);

  useEffect(() => {
    // Сохраняем результаты поиска, избегая дубликатов
    setAllSearchResults((prev) => [
      ...prev,
      ...searchResults.filter((user) => !prev.some((u) => u.id === user.id)),
    ]);
  }, [searchResults]);

  const resetProjectForm = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectTeamId('');
    setStatus('active');
    setDeadline('');
  };

  const resetTeamForm = useCallback(() => {
    setTeamId('');
    setTeamName('');
    setTeamDescription('');
    setUserEmails('');
    setSelectedUsers([]);
    setAllSearchResults([]);
    setEmailSuggestions([]);
    dispatch(clearSearchResults());
  }, [dispatch]);

  const handleCreateProject = useCallback(async () => {
    if (!projectName.trim() || !projectTeamId) {
      toast.error('Название проекта и команда обязательны');
      return;
    }

    try {
      await dispatch(
        addProject({
          name: projectName,
          description: projectDescription,
          team_id: projectTeamId,
          status,
          deadline,
        })
      ).unwrap();
      resetProjectForm();
      setModalType(null);
      toast.success('Проект успешно создан');
    } catch (err) {
      toast.error(err || 'Ошибка создания проекта');
    }
  }, [projectName, projectDescription, projectTeamId, status, deadline, dispatch]);

  const handleEditProject = useCallback(async () => {
    if (!projectName.trim() || !projectTeamId) {
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
            team_id: projectTeamId,
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
  }, [selectedProjectId, projectName, projectDescription, projectTeamId, status, deadline, dispatch]);

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

      toast.info('Создание команды завершено, добавление участников...');
      for (const userId of selectedUsers) {
        const user = allSearchResults.find((u) => u.id === userId);
        if (user) {
          await dispatch(addMember({ teamId: response.id, user })).unwrap();
          toast.info(`Добавлен участник: ${user.username}`);
        }
      }

      resetTeamForm();
      setModalType(null);
      toast.success('Команда успешно создана');
    } catch (err) {
      toast.error(err || 'Ошибка создания команды');
    }
  }, [teamName, teamDescription, user.id, selectedUsers, allSearchResults, dispatch, resetTeamForm]);

  const handleEditTeam = useCallback(async () => {
    if (!teamName.trim()) {
      toast.error('Название команды обязательно');
      return;
    }

    try {
      // Обновление данных команды
      await dispatch(
        editTeam({
          id: teamId,
          teamData: {
            name: teamName,
            description: teamDescription,
          },
        })
      ).unwrap();

      // Синхронизация участников
      const currentMembers = teams.find((t) => t.id === teamId)?.members?.map((m) => m.id) || [];
      const membersToAdd = selectedUsers.filter((id) => !currentMembers.includes(id));
      const membersToRemove = currentMembers.filter((id) => !selectedUsers.includes(id));

      for (const userId of membersToAdd) {
        const user = allSearchResults.find((u) => u.id === userId);
        if (user) {
          await dispatch(addMember({ teamId, user })).unwrap();
          toast.info(`Добавлен участник: ${user.username}`);
        }
      }

      for (const userId of membersToRemove) {
        await dispatch(removeMember({ teamId, userId })).unwrap();
        toast.info(`Удалён участник с ID: ${userId}`);
      }

      resetTeamForm();
      setModalType(null);
      toast.success('Команда успешно обновлена');
    } catch (err) {
      toast.error(err || 'Ошибка редактирования команды');
    }
  }, [teamId, teamName, teamDescription, selectedUsers, teams, allSearchResults, dispatch, resetTeamForm]);

  const handleDeleteTeam = useCallback(async (teamId) => {
    if (window.confirm('Вы уверены, что хотите удалить команду?')) {
      try {
        await dispatch(removeTeam(teamId)).unwrap();
        toast.success('Команда успешно удалена');
      } catch (err) {
        toast.error(err || 'Ошибка удаления команды');
      }
    }
  }, [dispatch]);

  const handleSearchUsers = useCallback(async () => {
    if (!userEmails.trim()) {
      toast.error('Введите email для поиска');
      return;
    }

    try {
      await dispatch(searchUsers(userEmails)).unwrap();
      setUserEmails(''); // Очищаем поле после поиска
    } catch (err) {
      toast.error(err || 'Ошибка поиска пользователей');
    }
  }, [userEmails, dispatch]);

  const handleEmailsInputChange = (e) => {
    const input = e.target.value;
    setUserEmails(input);
    if (input.length > 2) {
      dispatch(searchUsers(input))
        .unwrap()
        .then((users) => {
          setEmailSuggestions(users.map((user) => user.email));
        })
        .catch(() => setEmailSuggestions([]));
    } else {
      setEmailSuggestions([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      toast.warn('Пользователь уже добавлен');
      return;
    }
    setSelectedUsers([...selectedUsers, userId]);
    setUserEmails(''); // Очищаем поле ввода после добавления
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  };

  const handleProjectClick = useCallback((projectId) => {
    if (projectId) {
      navigate(`/project/${projectId}/dashboard`);
    }
  }, [navigate]);

  const openEditProjectModal = useCallback((project) => {
    setSelectedProjectId(project.id);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectTeamId(project.team_id);
    setStatus(project.status || 'active');
    setDeadline(project.deadline || '');
    setModalType('edit');
  }, []);

  const openEditTeamModal = useCallback((team) => {
    setTeamId(team.id);
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setSelectedUsers(team.members?.map((m) => m.id) || []);
    setModalType('editTeam');
  }, []);

  const closeModal = () => {
    setModalType(null);
    setSelectedProjectId(null);
    setTeamId('');
    resetProjectForm();
    resetTeamForm();
  };

  if (!user) {
    return <div className="loading-message">Загрузка...</div>;
  }

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
                  <div className="team-card-header">
                    <h3>{team.name}</h3>
                    {user.role !== 'employee' && (
                      <div className="team-actions">
                        <button
                          className="team-action-btn"
                          data-bs-toggle="modal"
                          data-bs-target="#teamModal"
                          onClick={() => openEditTeamModal(team)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="team-action-btn"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
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
                        onClick={() => openEditProjectModal(project)}
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
                    value={projectTeamId}
                    onChange={(e) => setProjectTeamId(e.target.value)}
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
                  {modalType === 'createTeam' ? 'Создать новую команду' : 'Редактировать команду'}
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
                  <label htmlFor="userEmails" className="form-label">
                    Поиск участников по email
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="userEmails"
                      value={userEmails}
                      onChange={handleEmailsInputChange}
                      placeholder="Введите email"
                      disabled={teamLoading}
                      list="emailSuggestions"
                    />
                    <datalist id="emailSuggestions">
                      {emailSuggestions.map((email, index) => (
                        <option key={index} value={email} />
                      ))}
                    </datalist>
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
                {allSearchResults.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Найденные пользователи</label>
                    <ul className="list-group">
                      {allSearchResults
                        .filter((result) => !selectedUsers.includes(result.id))
                        .map((result) => (
                          <li
                            key={result.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span>
                              {result.username} ({result.email})
                            </span>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSelectUser(result.id)}
                              disabled={teamLoading}
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
                    <label className="form-label">Добавленные участники</label>
                    <ul className="list-group">
                      {selectedUsers.map((userId) => {
                        const user = allSearchResults.find((u) => u.id === userId) ||
                                    teams.find((t) => t.id === teamId)?.members?.find((m) => m.id === userId);
                        return user ? (
                          <li
                            key={user.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span>
                              {user.username} ({user.email})
                            </span>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveUser(user.id)}
                              disabled={teamLoading}
                            >
                              Удалить
                            </button>
                          </li>
                        ) : null;
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
                  onClick={modalType === 'createTeam' ? handleCreateTeam : handleEditTeam}
                  disabled={teamLoading}
                >
                  {teamLoading ? 'Сохранение...' : modalType === 'createTeam' ? 'Создать' : 'Сохранить'}
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