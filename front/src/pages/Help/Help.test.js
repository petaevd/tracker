import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Help from './Help';
import { i18n } from 'i18next';
import { useTranslation } from 'react-i18next';
import authReducer from "../../store/slices/authSlice.js";

beforeAll(() => {
    global.IntersectionObserver = class {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
      }
  
      observe() {
        // симуляция появления в зоне видимости
        this.callback([{ isIntersecting: true }]);
      }
  
      unobserve() {}
      disconnect() {}
    };
  });

// Мокируем перевод
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn().mockReturnValue({
      t: (key) => key,
      i18n: { changeLanguage: jest.fn() },
    }),
  }));
  
// Мокируем редукс стор
const mockStore = configureStore({
reducer: {
    auth: authReducer,
},
preloadedState: {
    auth: {
    user: {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        role: 'employee',
        avatarLetter: 'T',
    },
    token: 'fake-token',
    isAuthenticated: true,
    },
},
});

describe('Help Component', () => {
  it('renders without crashing', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Help />
        </MemoryRouter>
      </Provider>
    );

    // Проверка заголовка
    expect(screen.getAllByText(/Помощь/i).length).toBeGreaterThan(0);


    // Проверка секций помощи
    expect(screen.getByText(/Управление проектами/i)).toBeInTheDocument();
    expect(screen.getByText(/Настройки аккаунта/i)).toBeInTheDocument();
    expect(screen.getByText(/Визуализация данных/i)).toBeInTheDocument();

    // Проверка вопросов
    expect(screen.getByText(/Как создать проект\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Как создать задачу\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Как изменить пароль\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Как обновить профиль\?/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Диаграмма Ганта/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Круговая диаграмма/i).length).toBeGreaterThan(0);

    // Проверка, что вопросы и ответы отображаются корректно
    expect(screen.getByText(/Перейдите во вкладку "Проекты"/i)).toBeInTheDocument();
    expect(screen.getByText(/На главном экране нажмите "Добавить задачу"/i)).toBeInTheDocument();
  });

  it('handles translation', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Help />
        </MemoryRouter>
      </Provider>
    );

    // Проверка перевода
    expect(screen.getByText('Помощь')).toBeInTheDocument();
    expect(screen.getByText('Управление проектами')).toBeInTheDocument();
    expect(screen.getByText('Настройки аккаунта')).toBeInTheDocument();
    expect(screen.getByText('Визуализация данных')).toBeInTheDocument();
  });
});
