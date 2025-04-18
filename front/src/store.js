import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';  // Правильный импорт
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)  // Передаем thunk как middleware
);

export default store;