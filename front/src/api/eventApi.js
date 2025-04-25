import api from './api';

export const fetchEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data.event;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/events/${eventId}`, eventData);
  return response.data.event;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};