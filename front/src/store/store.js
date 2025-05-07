import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import projectReducer from './slices/projectSlice';
import teamReducer from './slices/teamSlice';
import taskReducer from './slices/taskSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    projects: projectReducer,
    teams: teamReducer,
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});