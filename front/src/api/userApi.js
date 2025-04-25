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