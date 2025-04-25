import api from './api';

export const fetchTeams = async () => {
  const response = await api.get('/teams');
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