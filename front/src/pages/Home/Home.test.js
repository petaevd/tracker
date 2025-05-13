// Home.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

jest.mock('../../store/slices/eventSlice', () => ({
  getEvents: jest.fn(() => ({ type: 'TEST_ACTION' }))
}));

jest.mock('../../store/slices/taskSlice', () => ({
  getTasks: jest.fn(() => ({ type: 'TEST_ACTION' })),
  addTask: jest.fn(() => ({ type: 'TEST_ACTION' })),
  updateExistingTask: jest.fn(() => ({ type: 'TEST_ACTION' }))
}));

jest.mock('../../store/slices/projectSlice', () => ({
  getProjects: jest.fn(() => ({ type: 'TEST_ACTION' }))
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru'
    }
  })
}));

jest.mock('gantt-task-react', () => ({
  Gantt: () => <div>Gantt Chart Mock</div>,
  ViewMode: { Day: 'Day' }
}));

describe('Home Component', () => {
  let store;

  beforeEach(() => {
    // Создаем тестовый store с фиксированными данными
    store = configureStore({
      reducer: {
        auth: () => ({
          user: { 
            id: 1, 
            name: 'Test User',
            // Добавляем все необходимые поля пользователя
            email: 'test@example.com',
            role: 'user'
          }
        }),
        events: () => ({ 
          eventsByUser: { 
            1: [] // Пустой массив событий для пользователя с id=1
          },
          loading: false,
          error: null
        }),
        tasks: () => ({
          tasks: [
            {
              id: 1,
              title: 'Test Task',
              description: 'Test Description',
              status: 'open',
              priority: 'low',
              project_id: 1,
              due_date: '2023-01-01',
              createdAt: '2023-01-01'
            }
          ],
          loading: false,
          error: null
        }),
        projects: () => ({
          projects: [
            { id: 1, name: 'Test Project' }
          ],
          loading: false,
          error: null
        })
      }
    });

    // Мокируем localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  it('should render without infinite loop', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.getByText('project_view_panel')).toBeInTheDocument();
  });

  it('should open task modal when button clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Добавить задачу'));
    });

    expect(screen.getByText('Создание новой задачи')).toBeInTheDocument();
  });

  it('should add task to favorites when star icon clicked', async () => {
    const localStorageMock = {
      getItem: jest.fn(() => '[]'),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  
    const testStore = configureStore({
      reducer: {
        auth: () => ({ user: { id: 1 } }),
        events: () => ({ eventsByUser: {
            1: []
          }, loading: true, error: null }),
        tasks: () => ({
          tasks: [{
            id: 1,
            title: 'Test Task',
            status: 'open',
            priority: 'medium',
            project_id: 1,
            due_date: '2023-01-01',
            createdAt: '2023-01-01'
          }],
          loading: false,
          error: null
        }),
        projects: () => ({ projects: [], loading: false, error: null })
      }
    });
  
    await act(async () => {
      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>
      );
    });
  
    const starIcon = screen.getByTitle('Добавить в избранное');
    expect(starIcon).toBeInTheDocument();
  
    await act(async () => {
      fireEvent.click(starIcon);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'favoriteTasks',
      expect.stringContaining('Test Task')
    );
  
    expect(screen.getByTitle('Убрать из избранного')).toBeInTheDocument();
  });
});