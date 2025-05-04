import React, { useState, useEffect, useMemo } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { FaWhmcs } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../../store/slices/eventSlice';
import { getTasks, removeTask, updateTask, createTask } from '../../store/slices/taskSlice';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { eventsByUser = {}, loading, error } = useSelector((state) => state.events);
  const user = useSelector((state) => state.auth.user);

  // ================ Задачи ================
  const { tasks, loadingTask, errorTask } = useSelector((state) => state.tasks);
  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch])
  const priorityMap = {
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая',
  };
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
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
  const [newTaskText, setNewTaskText] = useState('');

  // Данные для диаграммы прогресса
  const projectProgressData = {
    completed: 35,
    inProgress: 45,
    notStarted: 20,
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
              <button className="manage-btn">Управлять</button>
            </div>
            
            <div className="circular-progress-wrapper">
              <div className="circular-progress">
                <svg viewBox="0 0 100 100">
                  {/* Фоновый круг */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#2a2a2a" 
                    strokeWidth="8"
                  />
                  {/* Не начатые задачи */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#1b8df7" 
                    strokeWidth="8"
                    strokeDasharray={`${20 * 2.83} 283`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Задачи в работе */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#9A48EA" 
                    strokeWidth="8"
                    strokeDasharray={`${45 * 2.83} 283`}
                    strokeDashoffset={`${-20 * 2.83}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Выполненные задачи */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#59b25c" 
                    strokeWidth="8"
                    strokeDasharray={`${35 * 2.83} 283`}
                    strokeDashoffset={`${-65 * 2.83}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="progress-percent">80%</div>
              </div>
              
              <div className="progress-stats-row">
                <div className="stat-item">
                  <div className="stat-color" style={{backgroundColor: '#59b25c'}}></div>
                  <div>
                    <div className="stat-value">32</div>
                    <div className="stat-label">Выполнено</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-color" style={{backgroundColor: '#9A48EA'}}></div>
                  <div>
                    <div className="stat-value">12</div>
                    <div className="stat-label">В работе</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-color" style={{backgroundColor: '#1b8df7'}}></div>
                  <div>
                    <div className="stat-value">16</div>
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
                <h3 className="card-title">Задачи на сегодня</h3>
                <span className="tasks-count">{tasks.length}</span>
              </div>
            </div>
            
            <div className="add-task-container">
              <button className="add-task-btn">
                <FiPlus className="plus-icon" />
                <span className="add-task-text">Добавить задачу</span>
              </button>
            </div>
            
            <div className="tasks-list">
              {currentTasks.map(task => (
                <div key={task.id} className='task-item'>
                    <div className="task-main">
                      <div className="task-text">{task.title}</div>
                      <span className={`difficulty-badge ${task.priority}`}>{priorityMap[task.priority]}</span>
                      <span className='text-muted ms-2'>
                        дедлайн {new Date(task.due_date).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  <div className="task-icons">
                    <FaWhmcs className="tasks-icon" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination mt-auto justify-content-center">
              {renderPagination().map((page, index) =>
                page === '...' ? (
                  <span key={index} className="dots">...</span>
                ) : (
                  <button
                    key={index}
                    className={page === currentPage ? 'active' : ''}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
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