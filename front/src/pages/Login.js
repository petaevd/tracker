import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { loginUser } from '../api/authApi';
import './auth.css';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';

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
      const mockResponse = { // Тестовые данные
        user: { id: 1, email: "test@test.com", username: "test", role: "user" },
        token: "fake-token"
      };
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
                       error.response?.data?.error ||
                       error.response?.statusText ||
                       error.message ||
                       'Неизвестная ошибка';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div>
        <ToastContainer />
      </div>
      <div className="auth-container">
        <h2>{t('login_auth')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('login_email_label')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <label>{t('login_password_label')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Password"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? `${t('login_go_button_loading')}` : `${t('login_go_button')}`}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register">{t('login_create_link')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;