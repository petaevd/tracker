import api from './api';

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}/profile`, userData);
  return response.data;
};

export const getUserTeams = async (userId) => {
  const response = await api.get(`/users/${userId}/teams`);
  return response.data;
};

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const changePassword = async (userId, passwordData) => {
  const response = await api.post(`/users/${userId}/change-password`, passwordData);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const searchUsersByEmail = async (email) => {
  const response = await api.get(`/users/search?email=${email}`);
  return response.data;
};