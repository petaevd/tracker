import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaArchive } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, editProject, removeProject } from '../../store/slices/projectSlice';
import { getTeams, addTeam, addMember, removeMember, editTeam, removeTeam, searchUsers, clearSearchResults } from '../../store/slices/teamSlice';
import { toast } from 'react-toastify';
import './Project.css';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Project = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('activeProjects');

  const debouncedSearchRef = useRef();

  // Фильтруем проекты по статусу
  const activeProjects = useMemo(() => 
    projects.filter(project => project.status !== 'archived'), 
    [projects]);

  const archivedProjects = useMemo(() => 
    projects.filter(project => project.status === 'archived'), 
    [projects]);

  const filteredTeams = useMemo(() => {
    return user?.role === 'manager' ? teams.filter((team) => team.created_by === user.id) : teams;
  }, [user, teams]);

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
    setAllSearchResults((prev) => [
      ...prev,
      ...searchResults.filter((user) => !prev.some((u) => u.id === user.id)),
    ]);
  }, [searchResults]);

  useEffect(() => {
    debouncedSearchRef.current = debounce((input) => {
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
    }, 300);
  }, [dispatch]);

  const resetProjectForm = useCallback(() => {
    setProjectName('');
    setProjectDescription('');
    setProjectTeamId('');
    setStatus('active');
    setDeadline('');
  }, []);

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
          creator_id: user.id,
          status,
          deadline,
        })
      ).unwrap();
      resetProjectForm();
      setModalType(null);
      // Закрываем модальное окно
      const modal = document.getElementById('projectModal');
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) modalInstance.hide();
      toast.success('Проект успешно создан');
    } catch (err) {
      toast.error(err || 'Ошибка создания проекта');
    }
  }, [projectName, projectDescription, projectTeamId, status, deadline, dispatch, resetProjectForm, user.id]);

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
      
      // Закрываем модальное окно
      const modal = document.getElementById('projectModal');
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) modalInstance.hide();
      
      toast.success('Проект успешно обновлён');
      
      // Обновляем данные проектов
      await dispatch(getProjects(user.id));
      
      // Если проект переведен в архив, переключаемся на вкладку архива
      if (status === 'archived') {
        setActiveTab('archive');
      }
    } catch (err) {
      toast.error(err || 'Ошибка редактирования проекта');
    }
  }, [selectedProjectId, projectName, projectDescription, projectTeamId, status, deadline, dispatch, resetProjectForm, user.id]);

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
      resetTeamForm();
      setModalType(null);
      // Закрываем модальное окно
      const modal = document.getElementById('teamModal');
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) modalInstance.hide();
      toast.success('Команда успешно создана');
    } catch (err) {
      toast.error(err.message || 'Ошибка создания команды');
    }
  }, [teamName, teamDescription, user.id, dispatch, resetTeamForm]);

  const handleEditTeam = useCallback(async () => {
    if (!teamName.trim()) {
      toast.error('Название команды обязательно');
      return;
    }

    try {
      await dispatch(
        editTeam({
          id: teamId,
          teamData: {
            name: teamName,
            description: teamDescription,
          },
        })
      ).unwrap();

      const currentMembers = teams.find((t) => t.id === teamId)?.members?.map((m) => m.id) || [];
      const membersToAdd = selectedUsers.filter((id) => !currentMembers.includes(id));
      const membersToRemove = currentMembers.filter((id) => !selectedUsers.includes(id));

      for (const userId of membersToAdd) {
        const user = allSearchResults.find((u) => u.id === userId);
        if (user) {
          await dispatch(addMember({ teamId, user })).unwrap();
        }
      }

      for (const userId of membersToRemove) {
        await dispatch(removeMember({ teamId, userId })).unwrap();
      }

      resetTeamForm();
      setModalType(null);
      // Закрываем модальное окно
      const modal = document.getElementById('teamModal');
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) modalInstance.hide();
      toast.success('Команда успешно обновлена');
    } catch (err) {
      toast.error(err.message || 'Ошибка редактирования команды');
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
      setUserEmails('');
    } catch (err) {
      toast.error(err || 'Ошибка поиска пользователей');
    }
  }, [userEmails, dispatch]);

  const handleEmailsInputChange = useCallback((e) => {
    const input = e.target.value;
    setUserEmails(input);
    debouncedSearchRef.current(input);
  }, []);

  const handleSelectUser = useCallback((userId) => {
    if (selectedUsers.includes(userId)) {
      toast.warn('Пользователь уже добавлен');
      return;
    }
    setSelectedUsers((prev) => [...prev, userId]);
    setUserEmails('');
  }, [selectedUsers]);

  const handleRemoveUser = useCallback((userId) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  }, []);

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

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedProjectId(null);
    setTeamId('');
    resetProjectForm();
    resetTeamForm();
  }, [resetProjectForm, resetTeamForm]);

  if (!user) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="project-container">
      <div className="main-content">
        <div className="breadcrumb">
          Домашняя / {activeTab === 'activeProjects' ? 'Проекты' : activeTab === 'teams' ? 'Команды' : 'Архив'}
        </div>
        
        <h1 className="project-title">
          {activeTab === 'activeProjects' ? 'Проекты' : activeTab === 'teams' ? 'Команды' : 'Архив'}
        </h1>
        
        <p className="project-subtitle">
          {activeTab === 'activeProjects' ? 'Управление активными проектами' : 
           activeTab === 'teams' ? 'Управление командами' : 'Архивные проекты'}
        </p>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'activeProjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('activeProjects')}
          >
            <FaPlus style={{marginRight: '8px'}} />
            Активные проекты
          </button>
          <button
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <FaUsers style={{marginRight: '8px'}} />
            Команды
          </button>
          <button
            className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <FaArchive style={{marginRight: '8px'}} />
            Архив
          </button>
        </div>

        {projectError && <div className="error-message">{projectError}</div>}
        {teamError && <div className="error-message">{teamError}</div>}

        <div className="action-buttons">
          {user.role !== 'employee' && (
            <>
              {activeTab === 'activeProjects' && (
                <button
                  className="action-btn purple"
                  data-bs-toggle="modal"
                  data-bs-target="#projectModal"
                  onClick={() => setModalType('create')}
                  disabled={projectLoading || teamLoading}
                >
                  <FaPlus /> Создать проект
                </button>
              )}
              {activeTab === 'teams' && (
                <button
                  className="action-btn purple"
                  data-bs-toggle="modal"
                  data-bs-target="#teamModal"
                  onClick={() => setModalType('createTeam')}
                  disabled={teamLoading}
                >
                  <FaUsers /> Создать команду
                </button>
              )}
            </>
          )}
        </div>

        {(projectLoading || teamLoading) && <div className="loading-message">Загрузка...</div>}

        {activeTab === 'teams' && (
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
        )}

        {activeTab === 'activeProjects' && (
          <div className="projects-section">
            <h2 className="section-title">Активные проекты</h2>
            {activeProjects.length > 0 ? (
              <div className="projects-grid">
                {activeProjects.map((project) => (
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
                      <span>Статус: Активный</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Нет активных проектов. {user.role !== 'employee' ? 'Создайте новый проект!' : ''}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="projects-section">
            <h2 className="section-title">Архивные проекты</h2>
            {archivedProjects.length > 0 ? (
              <div className="projects-grid">
                {archivedProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="archive-banner">
                      <FaArchive /> Архив
                    </div>
                    <div className="project-card-header">
                      <h3>{project.name}</h3>
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
                      <span>Статус: Архивный</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Нет архивных проектов</p>
              </div>
            )}
          </div>
        )}

        {/* Модальные окна создания/редактирования проекта */}
        <div className="modal fade" id="projectModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'create' ? 'Создать новый проект' : 'Редактировать проект'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Название проекта</label>
                  <input
                    type="text"
                    className="form-control"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={projectLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Описание проекта</label>
                  <input
                    type="text"
                    className="form-control"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    disabled={projectLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Статус проекта</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={projectLoading}
                  >
                    <option value="active">Активный</option>
                    <option value="archived">Архивный</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Дедлайн</label>
                  <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={projectLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Команда</label>
                  <select
                    className="form-select"
                    value={projectTeamId}
                    onChange={(e) => setProjectTeamId(e.target.value)}
                    disabled={projectLoading}
                  >
                    <option value="">Выберите команду</option>
                    {filteredTeams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal} disabled={projectLoading}>
                  Отмена
                </button>
                <button
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

        {/* Модальные окна создания/редактирования команды */}
        <div className="modal fade" id="teamModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'createTeam' ? 'Создать новую команду' : 'Редактировать команду'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Название команды</label>
                  <input
                    type="text"
                    className="form-control"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={teamLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Описание команды</label>
                  <input
                    type="text"
                    className="form-control"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    disabled={teamLoading}
                  />
                </div>
                {modalType === 'editTeam' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Поиск участников</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={userEmails}
                          onChange={handleEmailsInputChange}
                          placeholder="Email участника"
                          disabled={teamLoading}
                        />
                        <button
                          className="btn btn-outline-secondary"
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
                          {allSearchResults.map((user) => (
                            <li key={user.id} className="list-group-item">
                              {user.username} ({user.email})
                              <button
                                className="btn btn-sm btn-primary float-end"
                                onClick={() => handleSelectUser(user.id)}
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
                        <label className="form-label">Участники команды</label>
                        <ul className="list-group">
                          {selectedUsers.map((userId) => {
                            const user = allSearchResults.find(u => u.id === userId) || 
                                        teams.find(t => t.id === teamId)?.members?.find(m => m.id === userId);
                            return user ? (
                              <li key={user.id} className="list-group-item">
                                {user.username} ({user.email})
                                <button
                                  className="btn btn-sm btn-danger float-end"
                                  onClick={() => handleRemoveUser(user.id)}
                                >
                                  Удалить
                                </button>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal} disabled={teamLoading}>
                  Отмена
                </button>
                <button
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