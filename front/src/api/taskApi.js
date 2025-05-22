import api from './api';

export const fetchTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const createAssignee = async (taskId, assigneeId) => {
  const response = await api.post(`/tasks/${taskId}/assignee`, { assigneeId });
  return response.data;
};

export const deleteAssignee = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}/assignee`);
  return response.data;
};

export const fetchAssignee = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/assignee`);
  return response.data;
};