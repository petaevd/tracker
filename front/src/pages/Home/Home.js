import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import { FaWhmcs, FaStar, FaRegStar, FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../../store/slices/eventSlice';
import { getTasks, updateExistingTask, addTask } from '../../store/slices/taskSlice';
import { getProjects } from '../../store/slices/projectSlice';
import { toast, ToastContainer } from 'react-toastify';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import './Home.css';
import './gant.css';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { eventsByUser = {}, loading, error } = useSelector((state) => state.events);
  const user = useSelector((state) => state.auth.user);

  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================
  // ================ Задачи ================
  const { tasks = [], loadingTask, errorTask } = useSelector((state) => state.tasks);
  const { projects = [], loadingProjects, errorProjects } = useSelector(state => state.projects)
  const [filterTask, setFilterTask] = useState('all');

  const filterTasks = (tasks) => {
    const now = new Date();
  
    switch (filterTask) {
      case 'overdue':
        return tasks.filter(task => task.due_date && new Date(task.due_date) < now);
      
      case 'upcoming':
        const today = new Date();
        const weekLater = new Date();
        weekLater.setDate(today.getDate() + 7);
        return tasks.filter(
          task =>
            task.due_date &&
            new Date(task.due_date) >= today &&
            new Date(task.due_date) <= weekLater
        );
  
      case 'open':
        return tasks.filter(task => task.status && task.status.toLowerCase() === 'open');
  
      case 'closed':
        return tasks.filter(task => task.status && task.status.toLowerCase() === 'closed');
  
      case 'in_test':
        return tasks.filter(task => task.status && task.status.toLowerCase() === 'in_test');
  
      case 'in_development':
        return tasks.filter(task => task.status && task.status.toLowerCase() === 'in_development');

      case 'high-priority':
        return tasks.filter(task => task.priority && task.priority.toLowerCase() === 'high');

      case 'medium-priority':
        return tasks.filter(task => task.priority && task.priority.toLowerCase() === 'medium');

      case 'low-priority':
        return tasks.filter(task => task.priority && task.priority.toLowerCase() === 'low');
  
      default:
        return tasks;
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filterTasks(tasks).slice(indexOfFirstTask, indexOfLastTask);

  const totalPages = Math.ceil(filterTasks(tasks).length / tasksPerPage);

  const renderPagination = () => {
    const pages = [];
    const maxPages = 5;
  
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
  
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
  
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      
      pages.push(totalPages);
    }
  
    return pages;
  };

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch])

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTask]);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);


  const priorityMap = {
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая',
  };
  // Для круговой диаграммы
  const completedCount = tasks.filter(task => task?.status === 'closed').length;
  const inProgressCount = tasks.filter(task =>
    ['in_test', 'in_development'].includes(task?.status)
  ).length;
  const notStartedCount = tasks.filter(task => task?.status === 'open').length;


  const total = completedCount + inProgressCount + notStartedCount;
  const completedPercent = (completedCount / total) * 100;
  const inProgressPercent = (inProgressCount / total) * 100;
  const notStartedPercent = (notStartedCount / total) * 100;
  const CIRCLE_LENGTH = 2 * Math.PI * 45;

  const completedLength = (completedPercent / 100) * CIRCLE_LENGTH;
  const inProgressLength = (inProgressPercent / 100) * CIRCLE_LENGTH;
  const notStartedLength = (notStartedPercent / 100) * CIRCLE_LENGTH;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const [showTaskModal, setShowTaskModal] = useState(false);

  const [formTask, setFormTask] = useState({
    id: "",
    title: "",
    description: "",
    due_date: "",
    priority: "low",
    project_id: "",
    tags: "",
  });

  const resetFormTask = () => {
    setFormTask({
      id: "",
      title: "",
      description: "",
      due_date: "",
      priority: "low",
      project_id: "",
    tags: "",
    });
  };

  const normalizeTags = (tagString) => {
    if (typeof tagString !== 'string') return [];
    const array = Array.from(
      new Set(
        tagString
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      )
    );
    return array
  };
  
  const handleCreateTask = async () => {
    const normalizedTags = normalizeTags(formTask.tags);
    try {
      await dispatch(addTask({ ...formTask, tags: normalizedTags.length === 0 ? null : normalizedTags.join(', '), creator_id: user.id, status: "open" })).unwrap();
      setShowTaskModal(false);
      resetFormTask();
      toast.success('Задача создана');
    } catch (error) {
      console.error("Ошибка при создании задачи:", error);
      toast.error(error[0].msg || 'Ошибка создания задачи');
    }
  };

  const handleTaskStatusChange = async (taskId, currentStatus, projectId) => {
    const newStatus = currentStatus === 'closed' ? 'open' : 'closed';
    try {
      await dispatch(updateExistingTask({ 
        taskId: taskId, 
        taskData: { status: newStatus, project_id: projectId } 
      })).unwrap();
    } catch (error) {
      console.error("Ошибка при обновлении задачи:", error);
      toast.error(error[0].msg || 'Ошибка редактирования задачи');
    }
  };

  const handleUpdateTask = async () => {
    const normalizedTags = normalizeTags(formTask.tags);
  
    try {
      await dispatch(updateExistingTask({
        taskId: formTask.id,
        taskData: {
          ...formTask,
          tags: normalizedTags.length === 0 ? null : normalizedTags.join(', ')
        }
      })).unwrap();
  
      setShowTaskModal(false);
      resetFormTask();
      toast.success('Задача обновлена');
    } catch (error) {
      console.error("Ошибка при обновлении задачи:", error);
      toast.error(error[0].msg || 'Ошибка редактирования задачи');
    }
  };

  const FAVORITES_KEY = 'favoriteTasks';

  const getFavoriteTasks = () => {
    const data = localStorage.getItem(FAVORITES_KEY);
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const setFavoriteTasks = (favorites) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  };

  const toggleFavoriteTask = (task) => {
    let favorites = getFavoriteTasks();
    const exists = favorites.some(t => t.id === task.id);
  
    if (exists) {
      favorites = favorites.filter(t => t.id !== task.id);
      toast.success('Задача удалена из избранного');
    } else {
      favorites.push(task);
      toast.success('Задача добавлена в избранное');
    }
  
    setFavoriteTasks(favorites);
    return favorites;
  };

  const [favoriteTasks, setFavoriteTasksState] = useState(getFavoriteTasks());

  const handleToggleFavorite = (task) => {
    const updated = toggleFavoriteTask(task);
    setFavoriteTasksState(updated);
  };

  const ganttTaskColorMapping = {
    'high': '#FF5733',
    'medium': '#FFFF00',
    'low': '#33FF57',
  }

  const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  };
  
  const ganttTasks = tasks
    .filter(task => {
      const valid = task &&
        task.id &&
        task.title &&
        isValidDate(task.createdAt) &&
        isValidDate(task.due_date);
      
      if (!valid) {
        console.warn('❌ Invalid task skipped:', task);
      }
      return valid;
    })
    .map(task => ({
      id: task.id.toString(),
      name: task.title,
      start: new Date(task.createdAt),
      end: new Date(task.due_date),
      type: 'task',
      className: `task-${task.priority}`,
      progress: 100,
      isDisabled: false,
    }));
  


  // ================ Задачи ================

  // Получаем события только для текущего пользователя
  const userId = user?.id;

  const events = useMemo(() => {
    return userId ? eventsByUser[userId] || [] : [];
  }, [userId, eventsByUser]);
  
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (isMounted.current && userId && !eventsByUser[userId] && !loading) {
      dispatch(getEvents(userId));
    }
  }, [dispatch, userId, eventsByUser, loading]);

  // Состояния календаря
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Состояния для задач
  // const [tasks, setTasks] = useState([
  //   { id: 1, text: 'Have an in-depth look at the metrics of the Playground project', completed: false },
  //   { id: 2, text: 'Review Calendar Prototype and get an approval', completed: false },
  //   { id: 3, text: 'Call with the PM', completed: false },
  //   { id: 4, text: 'Share component access with Rohan', completed: false },
  // ]);

  // const [view, setView] = useState(ViewMode.Day);
  // Данные для диаграммы прогресса
  const projectProgressData = {
    completed: 40,
    inProgress: 40,
    notStarted: 0,
  };

  // Константы календаря

  const getTranslatedMonths = () => [
    t('calendar_january'),
    t('calendar_february'),
    t('calendar_march'),
    t('calendar_april'),
    t('calendar_may'),
    t('calendar_june'),
    t('calendar_july'),
    t('calendar_august'),
    t('calendar_september'),
    t('calendar_october'),
    t('calendar_november'),
    t('calendar_december')
  ];
  
  const getTranslatedDays = () => [
    t('calendar_monday'),
    t('calendar_tuesday'),
    t('calendar_wednesday'),
    t('calendar_thursday'),
    t('calendar_friday'),
    t('calendar_saturday'),
    t('calendar_sunday')
  ];
  const monthNames = getTranslatedMonths();
  const days = getTranslatedDays();

// In Home.js, update the getEventsForDay function:
const getEventsForDay = (day, month, year) => {
  if (!Array.isArray(events)) return [];
  
  return events.filter(event => {
    if (!event?.event_date) return false;
    
    try {
      const eventDate = new Date(event.event_date);
      if (isNaN(eventDate.getTime())) return false;
      
      // Compare dates without time components
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    } catch (e) {
      console.error('Error processing event date:', e, event);
      return false;
    }
  });
};

  const generateCalendar = () => {
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(), 
      currentDate.getMonth(), 
      1
    ).getDay();
    
    const daysInMonth = new Date(
      currentDate.getFullYear(), 
      currentDate.getMonth() + 1, 
      0
    ).getDate();
    
    const today = new Date();
    const dates = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = getEventsForDay(
        i, 
        currentDate.getMonth(), 
        currentDate.getFullYear()
      );
      
      dates.push({
        day: i,
        isToday: i === today.getDate() && 
                 currentDate.getMonth() === today.getMonth() && 
                 currentDate.getFullYear() === today.getFullYear(),
        hasEvents: dayEvents.length > 0,
        events: dayEvents
      });
    }

    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < offset; i++) {
      dates.unshift({ day: null });
    }
    
    return dates;
  };

  const changeMonth = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthDropdown(false);
  };

  const handleMouseEnter = (date, event) => {
    if (date.hasEvents) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredDate(date);
      setTooltipPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 120
      });
    }
  };

  const dates = generateCalendar();

  return (
    <nav className="home-container">
      <nav>
        <ToastContainer />
      </nav>
      <nav className="main-content">
        <nav className="breadcrumb">{t('breadcrump_home')}</nav>
        <h1 className="dashboard-title">{t('project_view_panel')}</h1>
        
        {error && <nav className="error-message">{error}</nav>}
        {loading && <nav className="loading-message">{t('loading_events')}</nav>}
        
        {/* First row of cards */}
        <nav className="cards-row">
          {/* Progress card */}
          <nav className="dashboard-card-v2 progress-card">
            <nav className="progress-header">
              <h3 className="">{t('progress_card_title')}</h3>
            </nav>
  
            <nav className="circular-progress-wrapper">
              <nav className="circular-progress">
                <svg viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="#db163a" 
                    strokeWidth="8"
                    strokeDasharray={`${notStartedLength} ${CIRCLE_LENGTH}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                    fill="none"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="#9A48EA" 
                    strokeWidth="8"
                    strokeDasharray={`${inProgressLength} ${CIRCLE_LENGTH}`}
                    strokeDashoffset={`-${notStartedLength}`}
                    transform="rotate(-90 50 50)"
                    fill="none"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="#59b25c" 
                    strokeWidth="8"
                    strokeDasharray={`${completedLength} ${CIRCLE_LENGTH}`}
                    strokeDashoffset={`-${notStartedLength + inProgressLength}`}
                    transform="rotate(-90 50 50)"
                    fill="none"
                  />
                </svg>
                <nav className="progress-percent">{percent}%</nav>
              </nav>
  
              <nav className="progress-stats-row">
                <nav className="stat-item">
                  <nav className="stat-color" style={{backgroundColor: '#59b25c'}}></nav>
                  <nav>
                    <nav className="stat-value">{completedCount}</nav>
                    <nav className="stat-label">{t('progress_completed')}</nav>
                  </nav>
                </nav>
                <nav className="stat-item">
                  <nav className="stat-color" style={{backgroundColor: '#9A48EA'}}></nav>
                  <nav>
                    <nav className="stat-value">{inProgressCount}</nav>
                    <nav className="stat-label">{t('progress_in_work')}</nav>
                  </nav>
                </nav>
                <nav className="stat-item">
                  <nav className="stat-color" style={{backgroundColor: '#db163a'}}></nav>
                  <nav>
                    <nav className="stat-value">{notStartedCount}</nav>
                    <nav className="stat-label">{t('progress_not_started')}</nav>
                  </nav>
                </nav>
              </nav>
            </nav>
          </nav>
          
          {/* Tasks card */}
          <nav className="dashboard-card-v2 tasks-card">
            
            {/* <nav className="tasks-header"> */}
              <nav className="tasks-header-content">
                <h3 className="">{t('tasks_card_title')}</h3>
                <span className="tasks-count">{tasks.length}</span>
              </nav>
            {/* </nav> */}
  
            <select
              value={filterTask}
              onChange={(e) => setFilterTask(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('tasks_filter_all')}</option>
              <option value="overdue">{t('tasks_filter_overdue')}</option>
              <option value="upcoming">{t('tasks_filter_upcoming')}</option>
              <option value="open">{t('tasks_filter_open')}</option>
              <option value="closed">{t('tasks_filter_closed')}</option>
              <option value="in_test">{t('tasks_filter_in_test')}</option>
              <option value="in_development">{t('tasks_filter_in_development')}</option>
              <option value="low-priority">{t('tasks_filter_low_priority')}</option>
              <option value="medium-priority">{t('tasks_filter_medium_priority')}</option>
              <option value="high-priority">{t('tasks_filter_high_priority')}</option>
            </select>
            
            <nav className="add-task-container">
              <button
                className="add-task-btn"
                onClick={() => {
                  resetFormTask();
                  setShowTaskModal(true);
                }}
              >
                <FiPlus className="plus-icon" />
                <span className="add-task-text">{t('tasks_add_button')}</span>
              </button>
            </nav>
  
            <nav className="tasks-list">
              {filterTasks(tasks)
                .slice((currentPage - 1) * 2, currentPage * 2)
                .map(task => task && (
                  <nav key={task.id} className={`task-item ${task.status === 'closed' ? 'completed' : ''}`}>
                    <nav className="task-content">
                      <input
                        type="checkbox"
                        checked={task.status === 'closed'}
                        onChange={() => handleTaskStatusChange(task.id, task.status, task.project_id)}
                        className="task-checkbox"
                        data-testid={`status-checkbox-${task.id}`}
                      />
                      <nav className="task-text-container">
                        <nav className="task-title">{task.title}</nav>
                        {task.description && (
                          <nav className="task-description">{task.description}</nav>
                        )}
                      </nav>
                    </nav>
                    <nav className="task-actions">
                      {favoriteTasks.some(fav => fav.id === task.id) ? (
                        <FaStar
                          className="task-action-icon"
                          onClick={() => handleToggleFavorite(task)}
                          title={t('task_remove_favorite')}
                        />
                      ) : (
                        <FaRegStar
                          className="task-action-icon"
                          onClick={() => handleToggleFavorite(task)}
                          title={t('task_add_favorite')}
                        />
                      )}
                      <FaWhmcs
                        className="task-action-icon"
                        onClick={() => {
                          setFormTask(task);
                          setShowTaskModal(true);
                        }}
                        title={t('task_edit')}
                      />
                    </nav>
                  </nav>
                ))}
            </nav>
  
            {filterTasks(tasks).length > 2 && (
              <nav className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  &lt;
                </button>
                <span>{t('tasks_page')} {currentPage}</span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="pagination-btn"
                >
                  &gt;
                </button>
              </nav>
            )}
          </nav>
          
          {/* Calendar card */}
          <nav className="dashboard-card-v2 calendar-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <nav className="calendar-header">
              <nav className="calendar-title-container ">
                <h3 className="">{t('calendar_card_title')}</h3>
                <nav className="month-selector">
                  <span 
                    className="current-month"
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  >
                    {monthNames[currentDate.getMonth()]}
                    <FaChevronDown className="dropdown-icon" />
                  </span>
                  {showMonthDropdown && (
                    <nav className="month-dropdown-menu">
                      {monthNames.map((month, index) => (
                        <nav 
                          key={index}
                          className={`month-dropdown-item ${currentDate.getMonth() === index ? 'selected' : ''}`}
                          onClick={() => changeMonth(index)}
                        >
                          {month}
                        </nav>
                      ))}
                    </nav>
                  )}
                </nav>
              </nav>
            </nav>
            
            <nav className="calendar-grid-mini">
              <nav className="calendar-days-container">
                <nav className="calendar-week-days">
                  {days.map((day, index) => (
                    <nav key={index} className="calendar-day-label">{day}</nav>
                  ))}
                </nav>
                <nav className="calendar-days-grid">
                  {dates.map((date, index) => (
                    <nav 
                      key={index} 
                      className="calendar-day-cell"
                      onMouseEnter={(e) => handleMouseEnter(date, e)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      {date.day ? (
                        <nav 
                          className={`calendar-day-number ${date.isToday ? 'today' : ''}`}
                          style={{
                            backgroundColor: date.hasEvents ? date.events[0].color : 'rgba(255, 255, 255, 0.1)',
                            color: date.hasEvents ? '#fff' : 'inherit',
                          }}
                        >
                          {date.day}
                          {date.isToday && !date.hasEvents && (
                            <nav className="today-dot"></nav>
                          )}
                          {date.hasEvents && date.events.length > 1 && (
                            <nav className="multiple-events-indicator">
                              +{date.events.length - 1}
                            </nav>
                          )}
                        </nav>
                      ) : (
                        <nav className="calendar-empty-cell"></nav>
                      )}
                    </nav>
                  ))}
                </nav>
              </nav>
            </nav>
          </nav>
        </nav>
  
        <nav>
          <h2 className='mb-5'>{t('gantt_chart_title')}</h2>
          {ganttTasks.length === 0 ? (
            <p>{t('gantt_loading')}</p>
          ) : (
            <Gantt tasks={ganttTasks} viewMode={ViewMode.Day} listCellWidth='' />
          )}
        </nav>
      </nav>
  
      {/* Task modal */}
      {showTaskModal && (
        <nav className="event-modal-overlay">
          <nav className="event-modal">
            <nav className="event-modal-header">
              <h3>{formTask.id ? t('task_modal_title_edit') : t('task_modal_title_create')}</h3>
              <button
                className="close-modal"
                onClick={() => {
                  setShowTaskModal(false);
                  resetFormTask();
                }}
              >
                <FaTimes />
              </button>
            </nav>
  
            <nav className="event-form">
              <nav className="form-group">
                <label htmlFor="task-title">{t('task_label_title')}</label>
                <input
                  id="task-title"
                  type="text"
                  className="form-control"
                  value={formTask.title}
                  onChange={(e) => setFormTask({ ...formTask, title: e.target.value })}
                />
              </nav>
  
              <nav className="form-group">
                <label>{t('task_label_description')}</label>
                <textarea
                  className="form-control"
                  value={formTask.description}
                  onChange={(e) => setFormTask({ ...formTask, description: e.target.value })}
                />
              </nav>
  
              <nav className="form-group">
                <label>{t('task_label_due_date')}</label>
                <input
                  type="date"
                  className="form-control"
                  value={formTask.due_date}
                  onChange={(e) => setFormTask({ ...formTask, due_date: e.target.value })}
                />
              </nav>
  
              <nav className="form-group">
                <label>{t('task_label_priority')}</label>
                <select
                  className="form-select"
                  value={formTask.priority}
                  onChange={(e) => setFormTask({ ...formTask, priority: e.target.value })}
                >
                  <option value="low">{t('task_priority_low')}</option>
                  <option value="medium">{t('task_priority_medium')}</option>
                  <option value="high">{t('task_priority_high')}</option>
                </select>
              </nav>
  
              <nav className="form-group">
                <label>{t('task_label_project')}</label>
                <select
                  className="form-select"
                  value={formTask.project_id}
                  onChange={(e) => setFormTask({ ...formTask, project_id: e.target.value })}
                >
                  <option value="">{t('task_select_project')}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </nav>
  
              <nav className="form-group">
                <label>{t('task_label_tags')}</label>
                <textarea
                  className="form-control"
                  value={formTask.tags}
                  onChange={(e) => setFormTask({ ...formTask, tags: e.target.value })}
                />
              </nav>
  
              {formTask.id && (
                <nav className="form-group">
                  <label>{t('task_label_status')}</label>
                  <select
                    className="form-select"
                    value={formTask.status}
                    onChange={(e) => setFormTask({ ...formTask, status: e.target.value })}
                  >
                    <option value="open">{t('task_status_open')}</option>
                    <option value="in_development">{t('task_status_in_development')}</option>
                    <option value="in_test">{t('task_status_in_test')}</option>
                    <option value="closed">{t('task_status_closed')}</option>
                  </select>
                </nav>
              )}
  
              <nav className="form-actions">
                <button
                  className="save-event-button"
                  onClick={formTask.id ? handleUpdateTask : handleCreateTask}
                  disabled={
                    !formTask.title.trim() ||
                    !formTask.project_id ||
                    !formTask.description ||
                    !formTask.due_date ||
                    !formTask.priority
                  }
                >
                  {formTask.id ? t('task_button_save') : t('task_button_create')}
                </button>
              </nav>
            </nav>
          </nav>
        </nav>
      )}
  
      {/* Event tooltip */}
      {hoveredDate?.events?.[0] && (
        <nav 
          className="event-tooltip" 
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px` 
          }}
        >
          <nav className="event-tooltip-header">
            <nav 
              className="event-color" 
              style={{ backgroundColor: hoveredDate.events[0].color }}
            ></nav>
            <nav className="event-title">{hoveredDate.events[0].title}</nav>
          </nav>
          <nav className="event-time">
            <FiClock size={14} />
            {hoveredDate.events[0].event_time}
          </nav>
          <nav className="event-date">
            {new Date(hoveredDate.events[0].event_date).toLocaleDateString('ru-RU', {
              day: 'numeric', 
              month: 'long', 
              weekday: 'long'
            })}
          </nav>
          {hoveredDate.events[0].description && (
            <nav className="event-description">
              {hoveredDate.events[0].description}
            </nav>
          )}
        </nav>
      )}
    </nav>
  );
};

export default Home;