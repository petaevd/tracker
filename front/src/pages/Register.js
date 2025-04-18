import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

const Register = ({ onLogin = () => {} }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      // 1. Регистрация
      const registerResponse = await axios.post('http://localhost:3000/api/users', formData);
      
      if (registerResponse.data.success) {
        setSuccessMessage('Регистрация прошла успешно!');
        
        // 2. Автоматический вход
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.data.token) {
          if (typeof onLogin === 'function') {
            onLogin(loginResponse.data.user, loginResponse.data.token);
          }
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      
      if (error.response) {
        if (error.response.data.errors) {
          const validationErrors = error.response.data.errors
            .map(err => err.msg)
            .join(', ');
          setErrorMessage(`Ошибки: ${validationErrors}`);
        } 
        else if (error.response.data.error === "Пользователь уже существует") {
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
            <select 
              name="role"
              value={formData.role} 
              onChange={handleChange}
            >
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