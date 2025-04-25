import React, { useEffect, useState } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects, addUser } from '../../store/slices/projectSlice';
import { fetchTasks } from '../../api/taskApi';
import { fetchUsers } from '../../api/userApi';
import { toast } from 'react-toastify';
import api from '../../api/api';
import './Dashboard.css';
import { logout } from '../../store/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, loading, error } = useSelector((state) => state.projects);
  const user = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskFilter, setTaskFilter] = useState({ status: 'all', priority: 'all', tag: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!projects.length) {
      dispatch(getProjects());
    }
  }, [dispatch, projects.length, user, navigate]);

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const response = await fetchTasks();
        const projectTasks = response.filter((task) => task.project_id === parseInt(projectId));
        setTasks(projectTasks);
      } catch (err) {
        toast.error('Ошибка загрузки задач');
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const project = projects.find((p) => p.id === projectId);
        if (project?.team_id) {
          const response = await api.get(`/teams/${project.team_id}/members`);
          setTeamMembers(response.data);
        }
      } catch (err) {
        toast.error('Ошибка загрузки участников');
      }
    };

    const fetchUsersData = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response);
      } catch (err) {
        toast.error('Ошибка загрузки пользователей');
      }
    };

    if (projectId) {
      fetchTasksData();
      fetchTeamMembers();
      if (user?.role !== 'employee') {
        fetchUsersData();
      }
    }
  }, [projectId, projects, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input').focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getAvatarLetter = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error('Выберите пользователя');
      return;
    }

    try {
      const project = projects.find((p) => p.id === projectId);
      await dispatch(
        addUser({ teamId: project.team_id, userId: selectedUserId })
      ).unwrap();
      setSelectedUserId('');
      setShowAddUserModal(false);
      toast.success('Пользователь добавлен');
      const response = await api.get(`/teams/${project.team_id}/members`);
      setTeamMembers(response.data);
    } catch (err) {
      toast.error(err || 'Ошибка добавления пользователя');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const project = projects.find((p) => p.id === projectId);

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = taskFilter.status === 'all' || task.status?.name === taskFilter.status;
    const matchesPriority = taskFilter.priority === 'all' || task.priority === taskFilter.priority;
    const matchesTag = taskFilter.tag === 'all' || task.tags?.some((t) => t.name === taskFilter.tag);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesTag && matchesSearch;
  });

  if (!user) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              id="search-input"
              type="text"
              placeholder="Поиск задач"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="shortcut-box">
              <span className="shortcut-key">⌘</span>
              <span className="shortcut-key">F</span>
            </div>
          </div>
        </div>
        <div className="top-bar-actions">
          <button className="share-button"><FaShareAlt /></button>
          {user ? (
            <div className="user-controls">
              <div className="user-avatar">{getAvatarLetter()}</div>
              <button className="logout-btn" onClick={handleLogout} title="Выйти">
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              <FaUser />
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="breadcrumb">Домашняя / Проект / {project?.name || 'Панель управления'}</div>
        <h1 className="dashboard-title">{project?.name || 'Панель управления проектом'}</h1>
        <p className="dashboard-subtitle">
          {project ? `Управляйте проектом "${project.name}"` : 'Внимательно изучите показатели и управляйте своим проектом'}
        </p>

        {loading && <div className="loading-message">Загрузка...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !project && !error && (
          <div className="error-message">Проект не найден</div>
        )}

        {project && (
          <div className="project-details">
            <div className="dashboard-card">
              <h3 className="card-title">Информация о проекте</h3>
              <p><strong>Описание:</strong> {project.description || 'Нет описания'}</p>
              <p><strong>Команда:</strong> {project.team?.name || 'Не указана'}</p>
              <p><strong>Дедлайн:</strong> {project.deadline || 'Не указан'}</p>
              <p><strong>Статус:</strong> {project.status === 'active' ? 'Активен' : 'Архивирован'}</p>
              <p><strong>Участников:</strong> {teamMembers.length || 1}</p>
            </div>
            <div className="dashboard-card">
              <h3 className="card-title">
                Задачи
                {user.role !== 'employee' && (
                  <button
                    className="action-btn purple"
                    onClick={() => setShowAddUserModal(true)}
                    style={{ marginLeft: '10px' }}
                  >
                    <FaPlus /> Добавить пользователя
                  </button>
                )}
              </h3>
              <div className="task-filter">
                <select
                  value={taskFilter.status}
                  onChange={(e) => setTaskFilter({ ...taskFilter, status: e.target.value })}
                >
                  <option value="all">Все статусы</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select
                  value={taskFilter.priority}
                  onChange={(e) => setTaskFilter({ ...taskFilter, priority: e.target.value })}
                >
                  <option value="all">Все приоритеты</option>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
                <select
                  value={taskFilter.tag}
                  onChange={(e) => setTaskFilter({ ...taskFilter, tag: e.target.value })}
                >
                  <option value="all">Все теги</option>
                  {[...new Set(tasks.flatMap((task) => task.tags?.map((t) => t.name) || []))].map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              {filteredTasks.length > 0 ? (
                <ul>
                  {filteredTasks.map((task) => (
                    <li key={task.id}>
                      {task.title} - {task.status?.name || 'Не указан'} - {task.priority}
                      {task.tags?.length > 0 && (
                        <span> (Теги: {task.tags.map((t) => t.name).join(', ')})</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Задачи отсутствуют</p>
              )}
            </div>
            <div className="dashboard-card">
              <h3 className="card-title">Участники</h3>
              {teamMembers.length > 0 ? (
                <ul>
                  {teamMembers.map((member) => (
                    <li key={member.id}>{member.username}</li>
                  ))}
                </ul>
              ) : (
                <p>Участники отсутствуют</p>
              )}
            </div>
          </div>
        )}

        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Добавить пользователя в проект</h3>
              <select
                className="modal-input"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loading}
              >
                <option value="" disabled>Выберите пользователя</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowAddUserModal(false)}
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

export default Dashboard;