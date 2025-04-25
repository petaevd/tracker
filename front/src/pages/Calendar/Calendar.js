import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, 
  FaCaretDown,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import './Calendar.css';

const Calendar = ({ events = [], user, setEvents }) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
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
  
  const daysInPrevMonth = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth(), 
    0
  ).getDate();
  
  const dates = [];
  
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    dates.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
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
  
  const totalCells = Math.ceil(dates.length / 7) * 7;
  for (let i = dates.length; i < totalCells; i++) {
    dates.push({
      day: i - dates.length + 1,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  const changeMonth = (monthIndex) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(), 
      monthIndex, 
      1
    ));
    setShowMonthDropdown(false);
  };

  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('ru-RU', options);
  };

  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const eventColors = [
    { name: 'Green', value: '#59b25c' },
    { name: 'white', value: '#E0C1FF' },
    { name: 'Blue', value: '#1b8df7' },
    { name: 'Purple', value: '#9A48EA' },
  ];

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    description: '',
    color: eventColors[0].value
  });

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

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
    setShowEventDetailsModal(false);
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      description: '',
      color: eventColors[0].value
    });
  };

  const openEventDetails = (event) => {
    setSelectedEvent({
      ...event,
      date: event.dateTime.split('T')[0],
      time: event.dateTime.split('T')[1].substring(0, 5)
    });
    setShowEventDetailsModal(true);
  };

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
      <div className="calendar-main-content">
        <div className="calendar-breadcrumb">Домашняя/Календарь</div>
        
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
        
        <div className="calendar-wrapper">
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
          
          <div className="calendar-container">
            <div className="calendar-grid">
              {days.map(day => (
                <div key={day} className="calendar-header-day">{day}</div>
              ))}
              
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