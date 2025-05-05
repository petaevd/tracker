import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { FaWhmcs, FaStar, FaRegStar, FaTimes, FaHeart } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../../store/slices/eventSlice';
import { getTasks, removeTask, updateExistingTask, addTask } from '../../store/slices/taskSlice';
import { getProjects } from '../../store/slices/projectSlice';
import { toast, ToastContainer } from 'react-toastify';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import './Home.css';
import './gant.css';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { eventsByUser = {}, loading, error } = useSelector((state) => state.events);
  const user = useSelector((state) => state.auth.user);

  // ================ Задачи ================
  const { tasks, loadingTask, errorTask } = useSelector((state) => state.tasks);
  const { projects, loadingProjects, errorProjects } = useSelector(state => state.projects)
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
    console.log(array.join(', '))
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

  const handleTaskStatusChange = (taskId, currentStatus) => {
    console.log('Current status:', currentStatus);
    const newStatus = currentStatus === 'closed' ? 'open' : 'closed';
    console.log('New status:', newStatus);
    dispatch(updateExistingTask({ 
      taskId, 
      taskData: { status: newStatus } 
    }));
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

  const ganttTasks = tasks.map(task => ({
    id: task.id.toString(),
    name: task.title,
    start: new Date(task.createdAt),
    end: new Date(task.due_date),
    type: 'task',
    className: `task-${task.priority}`,
    progress: 0,
    isDisabled: false,
  }));

  // ================ Задачи ================

  // Получаем события только для текущего пользователя
  const events = useMemo(() => {
    return user?.id ? eventsByUser[user.id] || [] : [];
  }, [user?.id, eventsByUser]);

  useEffect(() => {
    if (user?.id) {
      dispatch(getEvents(user.id));
    }
  }, [dispatch, user]);

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

  const [view, setView] = useState(ViewMode.Day);
  // Данные для диаграммы прогресса
  const projectProgressData = {
    completed: 40,
    inProgress: 40,
    notStarted: 0,
  };

  // Константы календаря
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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
    
    <div className="home-container">
      <div>
        <ToastContainer />
      </div>
      <div className="main-content">
        <div className="breadcrumb">Домашняя</div>
        <h1 className="dashboard-title">Панель просмотра проекта</h1>
        
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Загрузка событий...</div>}
        
        {/* Первая строка карточек */}
        <div className="cards-row">
          {/* Плашка "Прогресс проекта" */}
          <div className="dashboard-card progress-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <div className="progress-header">
              <h3 className="card-title">Прогресс проекта</h3>
              {/* <button className="manage-btn">Управлять</button> */}
            </div>

            <div className="circular-progress-wrapper">
              <div className="circular-progress">
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
                <div className="progress-percent">{percent}%</div>
              </div>

              <div className="progress-stats-row">
                <div className="stat-item">
                  <div className="stat-color" style={{backgroundColor: '#59b25c'}}></div>
                  <div>
                    <div className="stat-value">{completedCount}</div>
                    <div className="stat-label">Выполнено</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-color" style={{backgroundColor: '#9A48EA'}}></div>
                  <div>
                    <div className="stat-value">{inProgressCount}</div>
                    <div className="stat-label">В работе</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-color" style={{backgroundColor: '#db163a'}}></div>
                  <div>
                    <div className="stat-value">{notStartedCount}</div>
                    <div className="stat-label">Не начато</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Плашка "Задания" */}
          <div className="dashboard-card tasks-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
  <div className="tasks-header">
    <div className="tasks-header-content">
      <h3 className="card-title">Задачи</h3>
      <span className="tasks-count">{tasks.length}</span>
    </div>
  </div>

            <select
              value={filterTask}
              onChange={(e) => setFilterTask(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все</option>
              <option value="overdue">Просроченные</option>
              <option value="upcoming">Ближайшие</option>
              <option value="open">Открытые</option>
              <option value="closed">Завершённые</option>
              <option value="in_test">В тестировании</option>
              <option value="in_development">В разработке</option>
              <option value="low-priority">Малый приоритет</option>
              <option value="medium-priority">Средний приоритет</option>
              <option value="high-priority">Высокий приоритет</option>
            </select>
            
            <div className="add-task-container">
              <button
                className="add-task-btn"
                onClick={() => {
                  resetFormTask();
                  setShowTaskModal(true);
                }}
              >
                <FiPlus className="plus-icon" />
                <span className="add-task-text">Добавить задачу</span>
              </button>
            </div>

  <div className="tasks-list">
    {filterTasks(tasks)
      .slice((currentPage - 1) * 2, currentPage * 2) // Показываем по 2 задачи
      .map(task => (
        <div key={task.id} className={`task-item ${task.status === 'closed' ? 'completed' : ''}`}>
          <div className="task-content">
          <input
              type="checkbox"
              checked={task.status === 'closed'}
              onChange={() => handleTaskStatusChange(task.id, task.status)}
              className="task-checkbox"
            />
            <div className="task-text-container">
              <div className="task-title">{task.title}</div>
              {task.description && (
                <div className="task-description">{task.description}</div>
              )}
            </div>
          </div>
          <div className="task-actions">
            {favoriteTasks.some(fav => fav.id === task.id) ? (
              <FaStar
                className="task-action-icon"
                onClick={() => handleToggleFavorite(task)}
                title="Убрать из избранного"
              />
            ) : (
              <FaRegStar
                className="task-action-icon"
                onClick={() => handleToggleFavorite(task)}
                title="Добавить в избранное"
              />
            )}
            <FaWhmcs
              className="task-action-icon"
              onClick={() => {
                setFormTask(task);
                setShowTaskModal(true);
              }}
              title="Редактировать задачу"
            />
          </div>
        </div>
      ))}
  </div>

  {filterTasks(tasks).length > 2 && (
  <div className="pagination">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="pagination-btn"
    >
      &lt;
    </button>
    <span>Страница {currentPage}</span>
    <button
      onClick={() => setCurrentPage(prev => prev + 1)}
      className="pagination-btn"
    >
      &gt;
    </button>
  </div>
)}
</div>
          {/* Плашка "Календарь" */}
          <div className="dashboard-card calendar-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <div className="calendar-header">
              <div className="calendar-title-container">
                <h3 className="card-title">Календарь</h3>
                <div className="month-selector">
                  <span 
                    className="current-month"
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  >
                    {monthNames[currentDate.getMonth()]}
                    <FaChevronDown className="dropdown-icon" />
                  </span>
                  {showMonthDropdown && (
                    <div className="month-dropdown-menu">
                      {monthNames.map((month, index) => (
                        <div 
                          key={month}
                          className={`month-dropdown-item ${currentDate.getMonth() === index ? 'selected' : ''}`}
                          onClick={() => changeMonth(index)}
                        >
                          {month}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="calendar-grid-mini">
              <div className="calendar-days-container">
                <div className="calendar-week-days">
                  {days.map(day => (
                    <div key={day} className="calendar-day-label">{day}</div>
                  ))}
                </div>
                <div className="calendar-days-grid">
                  {dates.map((date, index) => (
                    <div 
                      key={index} 
                      className="calendar-day-cell"
                      onMouseEnter={(e) => handleMouseEnter(date, e)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      {date.day ? (
                        <div 
                          className={`calendar-day-number ${date.isToday ? 'today' : ''}`}
                          style={{
                            backgroundColor: date.hasEvents ? date.events[0].color : 'rgba(255, 255, 255, 0.1)',
                            color: date.hasEvents ? '#fff' : 'inherit',
                          }}
                        >
                          {date.day}
                          {date.isToday && !date.hasEvents && (
                            <div className="today-dot"></div>
                          )}
                          {date.hasEvents && date.events.length > 1 && (
                            <div className="multiple-events-indicator">
                              +{date.events.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="calendar-empty-cell"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className='mb-5'>Диаграмма Ганта</h2>
          {ganttTasks.length === 0 ? (
            <p>Задачи загружаются...</p>
          ) : (
            <Gantt tasks={ganttTasks} viewMode={ViewMode.Day} listCellWidth='' />
          )}
        </div>

        {/* Вторая строка карточек
        <div className="cards-row">
          <div className="dashboard-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <h3 className="card-title">Прогресс заданий</h3>
          </div>
          <div className="dashboard-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <h3 className="card-title">Временная шкала выполнения задачи</h3>
          </div>
          <div className="dashboard-card" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
            <h3 className="card-title">Сегодняшняя встреча</h3>
          </div>
        </div> */}
      </div>

      {/* Модальное окно для создания задач */}
      {showTaskModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>{formTask.id ? 'Редактирование задачи' : 'Создание новой задачи'}</h3>
              <button
                className="close-modal"
                onClick={() => {
                  setShowTaskModal(false);
                  resetFormTask();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="event-form">
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  className="form-control"
                  value={formTask.title}
                  onChange={(e) => setFormTask({ ...formTask, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  className="form-control"
                  value={formTask.description}
                  onChange={(e) => setFormTask({ ...formTask, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Срок выполнения</label>
                <input
                  type="date"
                  className="form-control"
                  value={formTask.due_date}
                  onChange={(e) => setFormTask({ ...formTask, due_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Приоритет</label>
                <select
                  className="form-select"
                  value={formTask.priority}
                  onChange={(e) => setFormTask({ ...formTask, priority: e.target.value })}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>

              <div className="form-group">
                <label>Проект</label>
                <select
                  className="form-select"
                  value={formTask.project_id}
                  onChange={(e) => setFormTask({ ...formTask, project_id: e.target.value })}
                >
                  <option value="">Выберите проект</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Теги</label>
                <textarea
                  className="form-control"
                  value={formTask.tags}
                  onChange={(e) => setFormTask({ ...formTask, tags: e.target.value })}
                />
                <small className="form-text text-muted">
                  Введите теги через запятую, например: дизайн, фронтенд, срочно
                </small>
              </div>

              {formTask.id && (
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    className="form-select"
                    value={formTask.status}
                    onChange={(e) => setFormTask({ ...formTask, status: e.target.value })}
                  >
                    <option value="open">Открыта</option>
                    <option value="in_development">В разработке</option>
                    <option value="in_test">В тестировании</option>
                    <option value="closed">Закрыта</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
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
                  {formTask.id ? 'Сохранить изменения' : 'Создать задачу'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Тултип события */}
      {hoveredDate?.events?.[0] && (
        <div 
          className="event-tooltip" 
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px` 
          }}
        >
          <div className="event-tooltip-header">
            <div 
              className="event-color" 
              style={{ backgroundColor: hoveredDate.events[0].color }}
            ></div>
            <div className="event-title">{hoveredDate.events[0].title}</div>
          </div>
          <div className="event-time">
            <FiClock size={14} />
            {hoveredDate.events[0].event_time}
          </div>
          <div className="event-date">
            {new Date(hoveredDate.events[0].event_date).toLocaleDateString('ru-RU', {
              day: 'numeric', 
              month: 'long', 
              weekday: 'long'
            })}
          </div>
          {hoveredDate.events[0].description && (
            <div className="event-description">
              {hoveredDate.events[0].description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;