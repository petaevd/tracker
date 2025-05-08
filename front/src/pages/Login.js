import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { loginUser } from '../api/authApi';
import './auth.css';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
  
    try {
      const response = await loginUser({ email, password });
      dispatch(login({
        userId: response.user.id,
        token: response.token,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
      }));
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      navigate('/');
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
                       error.response?.statusText ||
                       error.message ||
                       'Неизвестная ошибка';
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
              Проверьте правильность email и пароля
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
          <Link to="/register">Создать аккаунт</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;