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
    t: (key) => ({
      'project_view_panel': 'Панель проектов',
      'tasks_card_title': 'Задачи',
      'tasks_add_button': 'Добавить задачу',
      'calendar_card_title': 'Календарь',
      'task_modal_title_create': 'Создание новой задачи',
      'task_label_title': 'Название',
      'task_label_description': 'Описание',
      'task_label_due_date': 'Срок выполнения',
      'task_label_priority': 'Приоритет',
      'task_label_project': 'Проект',
      'task_button_create': 'Создать',
    }[key] || key),
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

jest.mock('react-icons/fi', () => ({
  FiClock: () => <span>FiClock</span>,
  FiPlus: () => <span>FiPlus</span>
}));

jest.mock('react-icons/fa', () => ({
  FaChevronDown: () => <span>FaChevronDown</span>,
  FaWhmcs: () => <span>FaWhmcs</span>,
  FaStar: () => <span>FaStar</span>,
  FaRegStar: () => <span>FaRegStar</span>,
  FaTimes: () => <span>FaTimes</span>
}));

describe('Home Component', () => {
  let store;
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  };

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  beforeEach(() => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'favoriteTasks') return '[]';
      return null;
    });

    store = configureStore({
      reducer: {
        auth: () => ({
          user: { 
            id: 1, 
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          }
        }),
        events: () => ({ 
          eventsByUser: { 
            1: [{
              id: 1,
              title: 'Test Event',
              event_date: '2023-01-15',
              event_time: '12:00',
              color: '#ff0000',
              description: 'Test event description'
            }]
          },
          loading: false,
          error: null
        }),
        tasks: () => ({
          tasks: [{
            id: 1,
            title: 'Test Task',
            description: 'Test Description',
            status: 'open',
            priority: 'medium',
            project_id: 1,
            due_date: '2023-01-01',
            createdAt: '2023-01-01',
            tags: 'tag1, tag2'
          }],
          loading: false,
          error: null
        }),
        projects: () => ({
          projects: [{
            id: 1, 
            name: 'Test Project'
          }],
          loading: false,
          error: null
        })
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1. Тест базового рендеринга
  it('should render main components correctly', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.getByText('Панель проектов')).toBeInTheDocument();
    expect(screen.getByText('Задачи')).toBeInTheDocument();
    expect(screen.getByText('Календарь')).toBeInTheDocument();
    expect(screen.getByText('Gantt Chart Mock')).toBeInTheDocument();
  });

  // 2. Тест открытия модального окна задачи
  it('should open task creation modal when button clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>
      );
    });

    const addButton = screen.getByText('Добавить задачу');
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Создание новой задачи')).toBeInTheDocument();
  });
  
  // 3. Тест фильтрации задач
  it('should filter tasks when filter changed', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>
      );
    });

    const filterSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'open' } });
    });

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

});