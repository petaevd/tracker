import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials, {
    maxRedirects: 0
  });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyEmailToken = async (token) => {
  const response = await api.get(`/auth/confirm-email?token=${token}`);
  return response.data;
};

// export const resendConfirmationEmail = async (email) => {
//   const response = await api.post('/auth/resend-confirmation', { email });
//   return response.data;
// };