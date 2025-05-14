import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaArchive } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addProject, editProject, removeProject } from '../../store/slices/projectSlice';
import { getTeams, addTeam, editTeam, removeTeam, searchUsers, clearSearchResults } from '../../store/slices/teamSlice';
import { toast } from 'react-toastify';
import './Project.css';
import {  FaTimes, } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import SearchField from '../../components/Members/SearchField';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Project = () => {

  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading: projectLoading, error: projectError } = useSelector((state) => state.projects);
  const { teams, searchResults, loading: teamLoading, error: teamError } = useSelector((state) => state.teams);
  const user = useSelector((state) => state.auth.user);

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
          {t('project_breadcrumb_home')} / {activeTab === 'activeProjects' 
            ? t('project_breadcrumb_projects') 
            : activeTab === 'teams' 
              ? t('project_breadcrumb_teams') 
              : t('project_breadcrumb_archive')}
        </div>
        
        <h1 className="project-title">
          {activeTab === 'activeProjects' 
            ? t('project_title_projects') 
            : activeTab === 'teams' 
              ? t('project_title_teams') 
              : t('project_title_archive')}
        </h1>
        
        <p className="project-subtitle">
          {activeTab === 'activeProjects' 
            ? t('project_subtitle_projects') 
            : activeTab === 'teams' 
              ? t('project_subtitle_teams') 
              : t('project_subtitle_archive')}
        </p>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'activeProjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('activeProjects')}
          >
            <FaPlus style={{marginRight: '8px'}} />
            {t('project_tab_active')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <FaUsers style={{marginRight: '8px'}} />
            {t('project_tab_teams')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <FaArchive style={{marginRight: '8px'}} />
            {t('project_tab_archive')}
          </button>
        </div>

        <div className="action-buttons">
          {user.role !== 'employee' && (
            <>
              {activeTab === 'activeProjects' && (
                <button
                  className="action-btn purple"
                  onClick={() => setShowProjectModal(true)}
                  disabled={projectLoading || teamLoading}
                >
                  <FaPlus /> {t('project_button_create_project')}
                </button>
              )}
              {activeTab === 'teams' && (
                <button
                  className="action-btn purple"
                  onClick={() => setShowTeamModal(true)}
                  disabled={teamLoading}
                >
                  <FaUsers /> {t('project_button_create_team')}
                </button>
              )}
            </>
          )}
        </div>

        {(projectLoading || teamLoading) && <div className="loading-message">{t('project_loading')}</div>}

        {activeTab === 'teams' && (
          <div className="teams-section">
            <h2 className="section-title">{t('project_section_teams')}</h2>
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
                            title={t('project_button_edit')}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="team-action-btn"
                            onClick={() => handleDeleteTeam(team.id)}
                            title={t('project_button_delete')}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    <p>{team.description || t('project_no_description')}</p>
                    <div className="team-meta">
                      <span>{t('project_creator')}: {team.creator?.username || t('project_no_creator')}</span>
                      <span>{t('project_members_count')}: {team.members?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('project_empty_teams')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activeProjects' && (
          <div className="projects-section">
            <h2 className="section-title">{t('project_section_active')}</h2>
            {activeProjects.length > 0 ? (
              <div className="projects-grid">
                {activeProjects.map((project) => (
                  <div key={project.id} className="project-card">
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
                            title={t('project_button_edit')}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="project-action-btn"
                            onClick={() => handleDeleteProject(project.id)}
                            title={t('project_button_delete')}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    <p>{project.description || t('project_no_description')}</p>
                    <div className="project-meta">
                      <span>{t('project_form_team')}: {project.team?.name || t('project_no_team')}</span>
                      <span>{t('project_form_status')}: {t('project_status_active')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('project_empty_projects')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="projects-section">
            <h2 className="section-title">{t('project_section_archive')}</h2>
            {archivedProjects.length > 0 ? (
              <div className="projects-grid">
                {archivedProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="archive-banner">
                      <FaArchive /> {t('project_archive_banner')}
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
                            title={t('project_button_edit')}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="project-action-btn"
                            onClick={() => handleDeleteProject(project.id)}
                            title={t('project_button_delete')}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    <p>{project.description || t('project_no_description')}</p>
                    <div className="project-meta">
                      <span>{t('project_form_team')}: {project.team?.name || t('project_no_team')}</span>
                      <span>{t('project_form_status')}: {t('project_status_archived')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('project_empty_archive')}</p>
              </div>
            )}
          </div>
        )}

        {showProjectModal && (
          <div className="event-modal-overlay">
            <div className="event-modal">
              <div className="event-modal-header">
                <h3>{formProject.id ? t('project_modal_edit_project') : t('project_modal_new_project')}</h3>
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
                <label>{t('project_form_name')}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formProject.name}
                  onChange={(e) => setFormProject({ ...formProject, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('project_form_description')}</label>
                <textarea
                  className="form-control"
                  value={formProject.description}
                  onChange={(e) => setFormProject({ ...formProject, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('project_form_team')}</label>
                <select
                  className="form-select"
                  value={formProject.team_id}
                  onChange={(e) => {
                    setFormProject({ ...formProject, team_id: e.target.value});
                  }}
                >
                  <option value="">{t('project_form_select_team')}</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('project_form_status')}</label>
                <select
                  className="form-select"
                  value={formProject.status}
                  onChange={(e) => setFormProject({ ...formProject, status: e.target.value })}
                >
                  <option value="">{t('project_form_select_status')}</option>
                  <option value="active">{t('project_status_active')}</option>
                  <option value="archived">{t('project_status_archived')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('project_form_deadline')}</label>
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
                  {formProject.id ? t('project_button_save') : t('project_button_create_project')}
                </button>
              </div>
            </div>
          </div>
        )}

        {showTeamModal && (
          <div className="event-modal-overlay">
            <div className="event-modal">
              <div className="event-modal-header">
                <h3>{formTeam.id ? t('project_modal_edit_team') : t('project_modal_new_team')}</h3>
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
                <label>{t('project_form_name')}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formTeam.name}
                  onChange={(e) => setFormTeam({ ...formTeam, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('project_form_description')}</label>
                <textarea
                  className="form-control"
                  value={formTeam.description}
                  onChange={(e) => setFormTeam({ ...formTeam, description: e.target.value })}
                />
              </div>

              <SearchField teamID={formTeam.id}></SearchField>

              <div className="form-actions">
                <button
                  className="save-event-button"
                  onClick={formTeam.id ? handleUpdateTeam : handleCreateTeam}
                  disabled={!formTeam.name}
                >
                  {formTeam.id ? t('project_button_save') : t('project_button_create_team')}
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