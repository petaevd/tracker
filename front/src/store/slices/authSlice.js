import { createSlice } from '@reduxjs/toolkit'; // Импорт createSlice
import { getAvatarLetter } from '../../utils'; // Импорт функции getAvatarLetter

// Определение initialState
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState, // Использование initialState
  reducers: {
    login: (state, action) => {
      // Принимаем как прямой объект пользователя, так и структуру { user, token }
      const payload = action.payload;
      const user = payload.user || payload;
      const token = payload.token || payload.token;
      
      if (!user || !token) {
        console.error('Invalid auth payload:', payload);
        return state;
      }

      // Нормализуем данные пользователя
      const normalizedUser = {
        id: user.userId || user.id,
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'employee',
        ...user // сохраняем остальные поля
      };

      state.user = {
        ...normalizedUser,
        avatarLetter: getAvatarLetter(normalizedUser.username, normalizedUser.email), // Использование getAvatarLetter
      };
      state.token = token;
      state.isAuthenticated = true;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setAuthState: (state, action) => {
      const { user, token } = action.payload;
      state.user = {
        ...user,
        avatarLetter: getAvatarLetter(user.username, user.email), // Использование getAvatarLetter
      };
      state.token = token;
      state.isAuthenticated = true;
    },
  },
});

export const { login, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;