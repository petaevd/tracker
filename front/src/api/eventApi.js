import api from './api';

export const fetchEvents = async (userId) => {
  try {
    const response = await api.get(`/events`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    // Приводим данные к единому формату перед отправкой
    const payload = {
      userId: eventData.userId,
      title: eventData.title,
      description: eventData.description,
      eventDate: eventData.eventDate || eventData.event_date,
      eventTime: formatTimeForAPI(eventData.eventTime || eventData.event_time),
      color: eventData.color
    };

    console.log('Sending to API:', payload);
    const response = await api.post('/events', payload);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

function formatTimeForAPI(time) {
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

export const updateEvent = async (eventId, eventData) => {
  try {
    const formattedData = {
      title: eventData.title,
      description: eventData.description,
      eventDate: eventData.eventDate,
      eventTime: eventData.eventTime,
      color: eventData.color
    };

    const response = await api.put(`/events/${eventId}`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};