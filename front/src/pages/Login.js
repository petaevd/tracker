import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

const Login = ({ onLogin = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Добавляем логирование отправляемых данных
      console.log('Отправка данных:', { email, password });
      
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 секунд таймаут
      });

      console.log('Полный ответ сервера:', response);
      
      // Проверяем структуру ответа
      if (!response.data) {
        throw new Error('Сервер вернул пустой ответ');
      }

      // Гибкая проверка ответа (разные варианты структуры)
      const authData = response.data;
      
      // Вариант 1: Прямые поля token и user
      // Вариант 2: Вложенные данные (auth.token, auth.user)
      const token = authData.token || authData.data?.token || authData.access_token;
      const user = authData.user || authData.data?.user;
      
      if (!token) {
        throw new Error('Токен не получен от сервера');
      }

      if (!user) {
        throw new Error('Данные пользователя не получены');
      }

      // Проверяем минимально необходимые поля пользователя
      if (!user.id || !user.email) {
        console.warn('Неполные данные пользователя:', user);
        throw new Error('Неполные данные пользователя');
      }

      // Сохраняем данные
      if (typeof onLogin === 'function') {
        onLogin(user, token);
      } else {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Перенаправляем на главную
      navigate('/');
      
    } catch (error) {
      console.error('Детали ошибки:', {
        error,
        response: error.response,
        request: error.request
      });
      
      let errorMsg = 'Ошибка при входе в систему';
      
      if (error.response) {
        // Обработка различных форматов ошибок от сервера
        errorMsg = error.response.data?.message 
                || error.response.data?.error
                || error.response.statusText
                || `Ошибка сервера (${error.response.status})`;
      } else if (error.request) {
        errorMsg = 'Сервер не отвечает. Проверьте подключение к интернету';
      } else {
        errorMsg = error.message || 'Неизвестная ошибка';
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2>Авторизация</h2>
        
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
            <p className="error-hint">
              Проверьте правильность email и пароля. Если проблема сохраняется, 
              <Link to="/contact"> обратитесь в поддержку</Link>.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Ваш email"
            />
          </div>
          
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Ваш пароль"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Выполняется вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/register">Создать аккаунт </Link>
          <Link to="/forgot-password">Забыли пароль?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;