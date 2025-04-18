import React from 'react';
import { createRoot } from 'react-dom/client'; // Импортируем createRoot
import { Provider } from 'react-redux';
import store from './store';
import App from './App';

// 1. Создаем корневой элемент
const container = document.getElementById('root');
const root = createRoot(container);

// 2. Рендерим приложение с Redux Provider
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);