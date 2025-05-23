import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'settings_title': 'Настройки',
      'settings_tab_profile': 'Профиль',
      'settings_tab_security': 'Безопасность',
      'settings_tab_accessibility': 'Доступность',
      'settings_tab_appearance': 'Внешний вид',
      'settings_tab_language': 'Язык',
      'profile_title': 'Профиль пользователя',
      'profile_username': 'Имя пользователя',
      'profile_email': 'Email',
      'profile_save_button': 'Сохранить',
      'security_title': 'Безопасность',
      'security_current_password': 'Текущий пароль',
    }[key] || key),
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru'
    }
  })
}));

jest.mock('../../api/userApi', () => ({
  getUserById: jest.fn().mockResolvedValue({
    username: 'testuser',
    email: 'test@example.com'
  }),
  updateUser: jest.fn(),
  uploadAvatar: jest.fn(),
  changePassword: jest.fn()
}));

describe('Settings Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  };

  const mockStore = configureStore({
    reducer: {
      auth: () => ({
        user: mockUser,
        token: 'test-token'
      })
    }
  });

  beforeEach(() => {
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'language') return 'ru';
      if (key === 'theme') return 'light';
      return null;
    });
    Storage.prototype.setItem = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Тест 1: Проверка базового рендеринга
  it('should render correctly with profile tab by default', async () => {
    await act(async () => {
      render(
        <Provider store={mockStore}>
          <MemoryRouter>
            <Settings />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Профиль пользователя')).toBeInTheDocument();
    expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  // Тест 2: Проверка переключения вкладок
  it('should switch between tabs correctly', async () => {
    await act(async () => {
      render(
        <Provider store={mockStore}>
          <MemoryRouter>
            <Settings />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.getByText('Профиль пользователя')).toBeInTheDocument();

    const securityTab = screen.getByText('Безопасность');
    await act(async () => {
      fireEvent.click(securityTab);
    });

    expect(screen.getByText('Текущий пароль')).toBeInTheDocument();
    expect(screen.queryByText('Профиль пользователя')).not.toBeInTheDocument();

    const profileTab = screen.getByText('Профиль');
    await act(async () => {
      fireEvent.click(profileTab);
    });

    expect(screen.getByText('Профиль пользователя')).toBeInTheDocument();
  });
});