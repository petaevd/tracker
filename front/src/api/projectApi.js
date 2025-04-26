import api from './api';

export const fetchProjects = async (userId = null) => {
  const response = await api.get('/projects', {
    params: userId ? { created_by: userId } : {},
  });
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data.project;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/projects/${projectId}`, projectData);
  return response.data.project;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};