import axios from 'axios';

export const fetchTasks = () => {
  return async (dispatch) => {
    dispatch({ type: 'FETCH_TASKS_REQUEST' });
    try {
      const response = await axios.get('/api/tasks');
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_TASKS_FAILURE', payload: error.message });
    }
  };
};

export const fetchEvents = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get('/api/events');
      dispatch({ type: 'FETCH_EVENTS_SUCCESS', payload: response.data });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
};