import api from './api';

export const fetchTags = async () => {
  const response = await api.get('/tags');
  return response.data;
};

export const createTag = async (tagData) => {
  const response = await api.post('/tags', tagData);
  return response.data;
};

export const updateTag = async (tagId, tagData) => {
  const response = await api.put(`/tags/${tagId}`, tagData);
  return response.data;
};

export const deleteTag = async (tagId) => {
  const response = await api.delete(`/tags/${tagId}`);
  return response.data;
};

export const addTagsToTask = async (taskId, tagIds) => {
  const response = await api.post(`/tags/tasks/${taskId}`, { tag_ids: tagIds });
  return response.data;
};

export const removeTagFromTask = async (taskId, tagId) => {
  const response = await api.delete(`/tasks/${taskId}/tags/${tagId}`);
  return response.data;
};