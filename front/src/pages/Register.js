import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { registerUser, loginUser } from '../api/authApi';
import './auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await registerUser(formData);
      setSuccessMessage('Регистрация прошла успешно!');
  
      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password,
      });
  
      dispatch(login({
        userId: loginResponse.userId,
        token: loginResponse.token,
        email: formData.email,
        username: formData.username,
        role: formData.role,
      }));
      navigate('/');
    } catch (error) {
      console.error('Ошибка регистрации:', error);

      if (error.response) {
        if (error.response.data.errors) {
          const validationErrors = error.response.data.errors
            .map((err) => err.msg)
            .join(', ');
          setErrorMessage(`Ошибки: ${validationErrors}`);
        } else if (error.response.data.error === 'Пользователь уже существует') {
          const conflicts = error.response.data.conflicts;
          let conflictMsg = 'Пользователь с такими данными уже существует: ';
          if (conflicts.username) conflictMsg += 'имя пользователя, ';
          if (conflicts.email) conflictMsg += 'email';
          setErrorMessage(conflictMsg);
        } else {
          setErrorMessage(error.response.data.error || 'Ошибка регистрации');
        }
      } else {
        setErrorMessage('Не удалось подключиться к серверу');
      }
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2>Регистрация</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя (обязательно):</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль (минимум 6 символов):</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Роль:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="employee">Сотрудник</option>
              <option value="manager">Менеджер</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Зарегистрироваться
          </button>
        </form>

        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;