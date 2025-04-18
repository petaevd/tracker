import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom');

test('renders without crashing', () => {
  render(<App />);
  expect(screen.getByTestId('app-container')).toBeInTheDocument();
});