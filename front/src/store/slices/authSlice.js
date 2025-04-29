import { createSlice } from '@reduxjs/toolkit';
import { getAvatarLetter } from '../../utils';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token } = action.payload;
      state.user = {
        ...user,
        avatarLetter: getAvatarLetter(user.username, user.email),
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
        avatarLetter: getAvatarLetter(user.username, user.email),
      };
      state.token = token;
      state.isAuthenticated = true;
    },
  },
});

export const { login, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;