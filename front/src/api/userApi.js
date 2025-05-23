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
  formData.append('avatar', file); // 'avatar' должно совпадать с multer.single('avatar')
  
  try {
    const config = {
      headers: { 
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    };

    const response = await api.post(`/users/${userId}/avatar`, formData, config);
    
    if (!response.data?.avatar_url) {
      throw new Error('Сервер не вернул URL аватара');
    }
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

export const changePassword = async (userId, passwordData) => {
  const response = await api.post(`/users/${userId}/change-password`, passwordData);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};