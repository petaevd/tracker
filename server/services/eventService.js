import Event from '../models/Event.js';
import User from '../models/User.js';

const getAllEvents = async (userId) => {
  try {
    const where = userId ? { user_id: userId } : {};
    const events = await Event.findAll({
      where,
      order: [['event_date', 'ASC'], ['event_time', 'ASC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
    });
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};
const createEvent = async ({ userId, title, description, eventDate, eventTime, color }) => {
  // Валидация
  if (!Number.isInteger(userId)) {
    throw new Error('User ID must be an integer');
  }

  if (!title || !eventDate) {
    throw new Error('Title and date are required');
  }

  // Проверка формата времени
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(eventTime)) {
    throw new Error('Time must be in HH:MM format');
  }

  // Создание события
  return await Event.create({
    user_id: userId,
    title,
    description,
    event_date: eventDate,
    event_time: eventTime,
    color
  });
};

const updateEvent = async (id, { title, description, eventDate, eventTime, color }) => {
  const event = await Event.findByPk(id);
  if (!event) {
    const err = new Error('Событие не найдено');
    err.status = 404;
    throw err;
  }

  const updates = { title, description, event_date: eventDate, event_time: eventTime, color };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await event.update(updates);
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) {
    const err = new Error('Событие не найдено');
    err.status = 404;
    throw err;
  }

  await event.destroy();
};

export default { getAllEvents, createEvent, updateEvent, deleteEvent };