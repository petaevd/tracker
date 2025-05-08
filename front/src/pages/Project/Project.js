import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaArchive } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, editProject, removeProject } from '../../store/slices/projectSlice';
import { getTeams, addTeam, addMember, removeMember, editTeam, removeTeam, searchUsers, clearSearchResults } from '../../store/slices/teamSlice';
import { toast } from 'react-toastify';
import './Project.css';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min';
import { FaWhmcs, FaStar, FaRegStar, FaTimes, FaHeart } from "react-icons/fa";
import { fetchProjects } from '../../api/projectApi';
import { updateExistingEvent } from '../../store/slices/eventSlice';
import { fetchTeams } from '../../api/teamApi';

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

  // useState для форм
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [formProject, setFormProject] = useState({
    team_id: "",
    status: "",
    name: "",
    description: "",
    deadline: "",
  });
  const [formTeam, setFormTeam] = useState({
    name: "",
    description: "",
    created_by: "",
  });

  // Сброс форм
  const resetFormProject = () => {
    setFormProject({
      team_id: "",
      status: "",
      name: "",
      description: "",
      deadline: "",
    });
  };
  const resetFormTeam = () => {
    setFormTeam({
      name: "",
      description: "",
      created_by: "",
    });
  };

  // Хендлеры форм
  const handleCreateProject = async () => {
    try {
      await dispatch(addProject({ ...formProject, creator_id: user.id})).unwrap();
      setShowProjectModal(false);
      resetFormProject();
      toast.success('Проект создан');
    } catch (error) {
      console.error("Ошибка при создании проекта:", error);
      toast.error(error[0]?.msg || 'Ошибка создания проекта');
    }
  };
  const handleUpdateProject = async () => {
    console.log(formProject)
    try {
      await dispatch(editProject({ id: formProject.id, projectData: { ...formProject, creator_id: user.id } })).unwrap();
  
      setShowProjectModal(false);
      resetFormProject();
      toast.success('Проект обновлен');
    } catch (error) {
      console.error("Ошибка при обновлении проекта:", error);
      toast.error(error[0].msg || 'Ошибка редактирования проекта');
    }
  };
  const handleCreateTeam = async () => {
    try {
      await dispatch(addTeam({ ...formTeam, created_by: user.id})).unwrap();
      await dispatch(getTeams(user.id)).unwrap();
      setShowTeamModal(false);
      resetFormTeam();
      toast.success('Команда создана');
    } catch (error) {
      console.error("Ошибка при создании команды:", error);
      toast.error(error[0]?.msg || 'Ошибка создания команды');
    }
  };
  const handleUpdateTeam = async () => {
    console.log(formTeam)
    try {
      await dispatch(editTeam({ id: formTeam.id, teamData: formTeam })).unwrap();
      await dispatch(getTeams(user.id)).unwrap();
      setShowTeamModal(false);
      resetFormTeam();
      toast.success('Команда обновлен');
    } catch (error) {
      console.error("Ошибка при обновлении команды:", error);
      toast.error(error[0].msg || 'Ошибка редактирования команды');
    }
  };

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
                  onClick={() => setShowProjectModal(true)}
                  disabled={projectLoading || teamLoading}
                >
                  <FaPlus /> Создать проект
                </button>
              )}
              {activeTab === 'teams' && (
                <button
                  className="action-btn purple"
                  onClick={() => setShowTeamModal(true)}
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
                            onClick={() => {
                              setFormTeam(team);
                              setShowTeamModal(true);
                            }}
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
                      <h3 onClick=''>{project.name}</h3>
                      {user.role !== 'employee' && (
                        <div className="project-actions">
                          <button
                            className="project-action-btn"
                            onClick={() => {
                              setFormProject(project);
                              setShowProjectModal(true);
                            }}
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
                            onClick={() => {
                              setFormProject(project);
                              setShowProjectModal(true);
                            }}
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
{/* 
const [formProject, setFormProject] = useState({
    team_id: "",
    status: "",
    name: "",
    description: "",
    creator_id: user.id,
    deadline: "",
  }); */}

      {showProjectModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>{formProject.id ? 'Редактирование проекта' : 'Создание нового проекта'}</h3>
              <button
                className="close-modal"
                onClick={() => {
                  setShowProjectModal(false);
                  resetFormProject();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                className="form-control"
                value={formProject.name}
                onChange={(e) => setFormProject({ ...formProject, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                className="form-control"
                value={formProject.description}
                onChange={(e) => setFormProject({ ...formProject, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Проект</label>
              <select
                className="form-select"
                value={formProject.team_id}
                onChange={(e) => {
                  setFormProject({ ...formProject , team_id: e.target.value});
                  console.log(formProject);
                }}
              >
                <option value="">Выберите команду</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Статус</label>
              <select
                className="form-select"
                value={formProject.status}
                onChange={(e) => setFormProject({ ...formProject, status: e.target.value })}
              >
                <option value="">Выберите статус</option>
                <option value="active">Активный</option>
                <option value="archived">Архивный</option>
              </select>
            </div>

            <div className="form-group">
              <label>Дедлайн</label>
              <input
                type="date"
                className="form-control"
                value={formProject.deadline}
                onChange={(e) => setFormProject({ ...formProject, deadline: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button
                className="save-event-button"
                onClick={formProject.id ? handleUpdateProject : handleCreateProject}
                disabled={
                  !formProject.team_id ||
                  !formProject.status ||
                  !formProject.name ||
                  !formProject.deadline
                }
              >
                {formProject.id ? 'Сохранить изменения' : 'Создать проект'}
              </button>
            </div>
          </div>
        </div>
      )}

{/* const [formTeam, setFormTeam] = useState({
    name: "",
    description: "",
    created_by: "",
  }); */}
      {showTeamModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>{formTeam.id ? 'Редактирование команды' : 'Создание новой команды'}</h3>
              <button
                className="close-modal"
                onClick={() => {
                  setShowTeamModal(false);
                  resetFormTeam();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                className="form-control"
                value={formTeam.name}
                onChange={(e) => setFormTeam({ ...formTeam, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                className="form-control"
                value={formTeam.description}
                onChange={(e) => setFormTeam({ ...formTeam, description: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button
                className="save-event-button"
                onClick={formTeam.id ? handleUpdateTeam : handleCreateTeam}
                disabled={
                  !formTeam.name
                }
              >
                {formTeam.id ? 'Сохранить изменения' : 'Создать команду'}
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