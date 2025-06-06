import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { getEvents } from '../../store/slices/eventSlice';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  
  // Загрузка событий при монтировании компонента
  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  // Состояния календаря
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Константы календаря
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Получение событий для дня
  const getEventsForDay = (day, month, year) => {
    if (!events?.length) return [];
    
    return events.filter(event => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    }).map(event => ({
      ...event,
      dateTime: `${event.event_date}T${event.event_time}`,
      color: event.color,
      title: event.title,
      description: event.description,
    }));
  };

  // Генерация данных календаря
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

    // Добавляем дни текущего месяца
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

    // Добавляем пустые ячейки для выравнивания
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < offset; i++) {
      dates.unshift({ day: null });
    }
    
    return dates;
  };

  // Смена месяца
  const changeMonth = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthDropdown(false);
  };

  // Обработчик наведения на день
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
      {/* Основной контент */}
      <div className="main-content">
        <div className="breadcrumb">Домашняя</div>
        <h1 className="dashboard-title">Панель просмотра проекта</h1>
        
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Загрузка событий...</div>}
        
        {/* Первая строка карточек */}
        <div className="cards-row">
          <div className="dashboard-card">
            <h3 className="card-title">Прогресс проекта</h3>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Задания</h3>
          </div>
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