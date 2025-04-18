//
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, 
  FaShareAlt, 
  FaUser, 
  FaCaretDown,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Calendar.css';

const Calendar = ({ events = [], user, setEvents, onLogout  }) => {
  const getAvatarLetter = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?'; // Fallback символ
  };
  const navigate = useNavigate();
  // Цвета для событий
  const eventColors = [
    { name: 'Green', value: '#59b25c' },
    { name: 'white', value: '#E0C1FF' },
    { name: 'Blue', value: '#1b8df7' },
    { name: 'Purple', value: '#9A48EA' },
  ];

  // Состояние поиска
  const [searchQuery, setSearchQuery] = useState('');

  // Обработчик нажатия Command+F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('calendar-date-search-input').focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Текущая дата
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  
  // Названия месяцев
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  
  // Дни недели
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  // Получаем первый день месяца
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth(), 
    1
  ).getDay();
  
  // Получаем количество дней в месяце
  const daysInMonth = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth() + 1, 
    0
  ).getDate();
  
  // Получаем количество дней в предыдущем месяце
  const daysInPrevMonth = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth(), 
    0
  ).getDate();
  
  // Создаем массив дат для отображения
  const dates = [];
  
  // Добавляем дни предыдущего месяца
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    dates.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Добавляем дни текущего месяца
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push({
      day: i,
      isCurrentMonth: true,
      isToday: i === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear()
    });
  }
  
  // Добавляем дни следующего месяца
  const totalCells = Math.ceil(dates.length / 7) * 7;
  for (let i = dates.length; i < totalCells; i++) {
    dates.push({
      day: i - dates.length + 1,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Переключение месяцев
  const changeMonth = (monthIndex) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(), 
      monthIndex, 
      1
    ));
    setShowMonthDropdown(false);
  };

  // Форматирование даты: "March 29, Friday"
  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('ru-RU', options);
  };

  // Состояния для модальных окон
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Новое событие
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    description: '',
    color: eventColors[0].value
  });

  // Фильтрация событий по поисковому запросу
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return events.filter(event => {
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.dateTime.toLowerCase().includes(query)
      );
    });
  }, [events, searchQuery]);

  // Обработчик добавления события
  const handleAddEvent = () => {
    if (newEvent.title.trim() === '') return;
    
    const eventToAdd = {
      ...newEvent,
      id: Date.now(),
      dateTime: `${newEvent.date}T${newEvent.time}`,
      color: newEvent.color 
    };
    
    setEvents([...events, eventToAdd]);
    setShowEventModal(false);
    resetNewEvent();
  };

  // Обработчик обновления события
  const handleUpdateEvent = () => {
    if (!selectedEvent || selectedEvent.title.trim() === '') return;
    
    setEvents(events.map(event => 
      event.id === selectedEvent.id ? {
        ...selectedEvent,
        dateTime: `${selectedEvent.date}T${selectedEvent.time}`
      } : event
    ));
    setShowEventDetailsModal(false);
  };

  // Обработчик удаления события
  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
    setShowEventDetailsModal(false);
  };

  // Сброс формы нового события
  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      description: '',
      color: eventColors[0].value
    });
  };

  // Открытие события для просмотра/редактирования
  const openEventDetails = (event) => {
    setSelectedEvent({
      ...event,
      date: event.dateTime.split('T')[0],
      time: event.dateTime.split('T')[1].substring(0, 5)
    });
    setShowEventDetailsModal(true);
  };

  // Проверка, есть ли события для конкретного дня
  const getEventsForDay = (day) => {
    if (!day.isCurrentMonth) return null;
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.dateTime);
      return eventDate.getDate() === day.day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
    
    return dayEvents.map(event => {
      const isHighlighted = filteredEvents.some(e => e.id === event.id);
      
      return (
        <div 
          key={event.id} 
          className={`calendar-event ${isHighlighted ? 'highlighted-event' : ''}`}
          style={{
            backgroundColor: `${event.color}20`,
            color: event.color,
            border: `1px solid ${event.color}80`,
            boxShadow: isHighlighted ? `0 0 15px 5px ${event.color}` : 'none'
          }}
          onClick={() => openEventDetails(event)}
        >
          {event.title} {event.time}
        </div>
      );
    });
  };

  return (
    <div className="calendar-page">
      {/* Верхняя панель с поиском */}
      <div className="top-bar">
  <div className="search-container">
    <div className="search-wrapper">
      <FaSearch className="search-icon" />
      <input
        id="search-input"
        type="text"
        placeholder="Поиск"
        className="search-input"
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
        <div className="user-avatar">
          {getAvatarLetter()}
        </div>
        <button 
          className="logout-btn"
          onClick={onLogout}
          title="Выйти"
        >
          <FaSignOutAlt />
        </button>
      </div>
    ) : (
      <button 
        className="login-btn"
        onClick={() => navigate('/login')}
      >
        <FaUser />
      </button>
    )}
  </div>
</div>

      {/* Основной контент */}
      <div className="calendar-main-content">
        <div className="calendar-breadcrumb">Домашняя/Календарь</div>
        
        {/* Заголовок с поиском дат */}
        <div className="calendar-header-with-search">
          <h1 className="calendar-title">Календарь</h1>
          <div className="calendar-date-search">
            <FaSearch className="calendar-date-search-icon" />
            <input
              id="calendar-date-search-input"
              type="text"
              placeholder="Поиск дат, мероприятий, встреч и тд"
              className="calendar-date-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Обертка с ободкой */}
        <div className="calendar-wrapper">
          {/* Панель управления календарем */}
          <div className="calendar-header">
            <div className="calendar-date-info">
              <h2 className="calendar-month-year">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="calendar-current-date">
                {formatDate(currentDate)}
              </p>
            </div>
            
            <div className="calendar-actions">
              <div className="month-view-dropdown">
                <button 
                  className="calendar-view-button"
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                >
                  Выбрать месяц<FaCaretDown />
                </button>
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
              
              <button 
                className="calendar-add-button"
                onClick={() => setShowEventModal(true)}
              >
                <FaPlus /> Добавить событие
              </button>
            </div>
          </div>
          
          {/* Календарь */}
          <div className="calendar-container">
            <div className="calendar-grid">
              {/* Заголовки дней недели */}
              {days.map(day => (
                <div key={day} className="calendar-header-day">{day}</div>
              ))}
              
              {/* Ячейки календаря */}
              {dates.map((date, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${date.isCurrentMonth ? '' : 'other-month'} ${date.isToday ? 'today' : ''}`}
                >
                  <div className="calendar-day-number">{date.day}</div>
                  {date.isCurrentMonth && getEventsForDay(date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления события */}
      {showEventModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>Добавить новое событие</h3>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowEventModal(false);
                  resetNewEvent();
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
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Встреча с командой"
                />
              </div>
              
              <div className="form-group">
                <label>Дата</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Время</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Цвет события</label>
                <div className="color-picker">
                  {eventColors.map(color => (
                    <div 
                      key={color.value}
                      className={`color-option ${newEvent.color === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewEvent({...newEvent, color: color.value })}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Добавьте подробную информацию о мероприятии"
                />
              </div>
              
              <button 
                className="save-event-button"
                onClick={handleAddEvent}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра/редактирования события */}
      {showEventDetailsModal && selectedEvent && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>Детали события</h3>
              <button 
                className="close-modal"
                onClick={() => setShowEventDetailsModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="event-form">
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Дата</label>
                <input
                  type="date"
                  value={selectedEvent.date}
                  onChange={(e) => setSelectedEvent({...selectedEvent, date: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Время</label>
                <input
                  type="time"
                  value={selectedEvent.time}
                  onChange={(e) => setSelectedEvent({...selectedEvent, time: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Цвет события</label>
                <div className="color-picker">
                  {eventColors.map(color => (
                    <div 
                      key={color.value}
                      className={`color-option ${selectedEvent.color === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedEvent({...selectedEvent, color: color.value })}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                />
              </div>
              
              <div className="event-actions">
                <button 
                  className="delete-event-button"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}>
                  <FaTrash /> Удалить
                </button>
                <button 
                  className="update-event-button"
                  onClick={handleUpdateEvent}>
                  <FaEdit /> Редактировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;