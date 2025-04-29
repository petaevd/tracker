import React, { useState, useEffect } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { getEvents } from '../../store/slices/eventSlice';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  const user = useSelector((state) => state.auth.user);

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
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Have an in-depth look at the metrics of the Playground project', completed: false },
    { id: 2, text: 'Review Calendar Prototype and get an approval', completed: false },
    { id: 3, text: 'Call with the PM', completed: false },
    { id: 4, text: 'Share component access with Rohan', completed: false },
  ]);
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

  const getEventsForDay = (day, month, year) => {
    if (!Array.isArray(events)) return [];
    
    return events.filter(event => {
      if (!event?.event_date) return false;
      
      try {
        const eventDate = new Date(event.event_date);
        if (isNaN(eventDate.getTime())) return false;
        
        return (
          eventDate.getDate() === day &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      } catch (e) {
        console.error('Ошибка обработки даты события:', e, event);
        return false;
      }
    }).map(event => ({
      ...event,
      dateTime: `${event.event_date}T${event.event_time || '00:00:00'}`,
      color: event.color || '#9A48EA',
      title: event.title || 'Без названия',
      description: event.description || ''
    }));
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

  // Обработчики для задач
  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: newTaskText,
        completed: false
      }]);
      setNewTaskText('');
    }
  };

  const handleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
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
          <div className="dashboard-card progress-card">
            <h3 className="card-title">Прогресс проекта</h3>
            <div className="progress-chart">
              <div className="progress-segment completed"
                style={{ width: `${projectProgressData.completed}%` }}>
                <div className="progress-label">{projectProgressData.completed}%</div>
              </div>
              <div className="progress-segment in-progress"
                style={{ width: `${projectProgressData.inProgress}%` }}>
                <div className="progress-label">{projectProgressData.inProgress}%</div>
              </div>
              <div className="progress-segment not-started"
                style={{ width: `${projectProgressData.notStarted}%` }}>
                <div className="progress-label">{projectProgressData.notStarted}%</div>
              </div>
            </div>
            <div className="progress-legend">
              <div className="legend-item">
                <div className="legend-color completed"></div>
                <span>Выполнено</span>
              </div>
              <div className="legend-item">
                <div className="legend-color in-progress"></div>
                <span>В работе</span>
              </div>
              <div className="legend-item">
                <div className="legend-color not-started"></div>
                <span>Не начато</span>
              </div>
            </div>
          </div>

          {/* Плашка "Задания" */}
          <div className="dashboard-card tasks-card">
            <div className="tasks-header">
              <h3 className="card-title">Задачи на сегодня</h3>
              <span className="tasks-count">{tasks.length}</span>
              <button className="manage-btn">управлять</button>
            </div>
            
            <div className="add-task-container">
              <button className="add-task-btn">
                <FiPlus className="plus-icon" />
                <span className="add-task-text">Добавить задачу</span>
              </button>
            </div>
            
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div 
                    className="task-checkbox"
                    onClick={() => handleTaskComplete(task.id)}
                  >
                    {task.completed && <FaCheck className="check-icon" />}
                  </div>
                  <div className="task-text">{task.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Плашка "Календарь" */}
          <div className="dashboard-card calendar-card">
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

        {/* Вторая строка карточек */}
        <div className="cards-row">
          <div className="dashboard-card">
            <h3 className="card-title">Прогресс заданий</h3>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Временная шкала выполнения задачи</h3>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Сегодняшняя встреча</h3>
          </div>
        </div>
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