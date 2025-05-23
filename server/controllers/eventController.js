import eventService from '../services/eventService.js';

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents(req.user.id); // Use authenticated user
    res.json(events);
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    // Форматируем данные
    const eventData = {
      userId: Number(req.user.id),
      title: req.body.title,
      description: req.body.description || null,
      eventDate: formatISODate(req.body.event_date || req.body.eventDate),
      eventTime: formatTime(req.body.event_time || req.body.eventTime),
      color: req.body.color || '#9A48EA'
    };

    console.log('Creating event with:', eventData);
    const event = await eventService.createEvent(eventData);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// Вспомогательные функции
function formatISODate(dateString) {
  if (!dateString) return new Date().toISOString();
  const date = new Date(dateString);
  return date.toISOString();
}

function formatTime(timeString) {
  if (!timeString) return '10:00';
  // Приводим к формату HH:MM
  const [hours, minutes] = timeString.split(':');
  return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
}

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({ message: 'Событие успешно обновлено', event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(204).json({ message: 'Событие успешно удалено' });
  } catch (err) {
    next(err);
  }
};

export default { getAllEvents, createEvent, updateEvent, deleteEvent };