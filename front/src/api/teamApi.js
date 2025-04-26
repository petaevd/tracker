import api from './api';

export const fetchTeams = async (userId = null) => {
  const response = await api.get('/teams', {
    params: userId ? { created_by: userId } : {},
  });
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await api.post('/teams', teamData);
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await api.put(`/teams/${teamId}`, teamData);
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await api.delete(`/teams/${teamId}`);
  return response.data;
};

export const addTeamMember = async (teamId, userId) => {
  const response = await api.post(`/teams/${teamId}/members`, { userId });
  return response.data;
};

export const removeTeamMember = async (teamId, userId) => {
  const response = await api.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};

export const searchUsersByEmail = async (email) => {
  const response = await api.get(`/users/search?email=${encodeURIComponent(email)}`);
  return response.data;
};