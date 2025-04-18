const initialState = {
    tasks: [],
    events: [],
    loading: false,
    error: null
  };
  
  export default function taskReducer(state = initialState, action) {
    switch (action.type) {
      case 'FETCH_TASKS_REQUEST':
        return { ...state, loading: true };
      case 'FETCH_TASKS_SUCCESS':
        return { ...state, loading: false, tasks: action.payload };
      case 'FETCH_TASKS_FAILURE':
        return { ...state, loading: false, error: action.payload };
      case 'FETCH_EVENTS_SUCCESS':
        return { ...state, events: action.payload };
      default:
        return state;
    }
  }