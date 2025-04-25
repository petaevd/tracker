import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import projectReducer from './slices/projectSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    projects: projectReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});