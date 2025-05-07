import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Home from './Home';

// Создаем mock store
const mockStore = configureMockStore();

describe('Home Component', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      auth: { user: { id: 1 } },
      events: { events: [], loading: false, error: null }
    });
    
    render(
      <Provider store={store}>
        <Home />
      </Provider>
    );
  });

  it('displays correct title', () => {
    const store = mockStore({
      auth: { user: { id: 1 } },
      events: { events: [], loading: false, error: null }
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <Home />
      </Provider>
    );
    
    expect(getByText('Панель просмотра проекта')).toBeInTheDocument();
  });
});