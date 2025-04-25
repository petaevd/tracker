import { createSlice } from '@reduxjs/toolkit';

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
      const { userId, token, email, username, role } = action.payload;
      state.user = {
        id: userId,
        email,
        username,
        role,
        avatarLetter: username?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U',
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
    setUser: (state, action) => {
      state.user = {
        ...action.payload,
        avatarLetter: action.payload.username?.charAt(0).toUpperCase() || action.payload.email?.charAt(0).toUpperCase() || 'U',
      };
      state.isAuthenticated = true;
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;