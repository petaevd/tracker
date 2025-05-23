import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { registerUser, loginUser } from '../api/authApi';
import './auth.css';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';


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
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

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
      toast.success(t('register_success'), { autoClose: 5000 })
      setTimeout(() => {
        setErrorMessage('')
      }, 5000);
      navigate('/');
    } catch (error) {
      console.error('Ошибка регистрации:', error);

      if (error.response) {
        if (error.response.data.errors) {
          const validationErrors = error.response.data.errors
            .map((err) => err.msg)
            .join(', ');
          toast.error(`${t('register_error_validation')} ${validationErrors}`)
        } else if (error.response.data.error === 'Пользователь уже существует') {
          const conflicts = error.response.data.conflicts;
          let conflictMsg = `${t('register_error_user_exists')} `;
          if (conflicts.username) conflictMsg += t('register_error_username_conflict');
          if (conflicts.email) conflictMsg += `, ${t('register_error_email_conflict')}`;
          toast.error(conflictMsg)
        } else {
          toast.error(error.response.data.error || t('register_error_general'))
        }
      } else {
        toast.error(t('register_error_connection'))
      }
    }
  };

  return (
    <div className="auth-bg">
      <div>
        <ToastContainer />
      </div>
      <div className="auth-container">
        <h2>{t('register_title')}</h2>
        {/* {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>} */}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('register_username_label')}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              placeholder={t('username_placeholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('register_email_label')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('email_placeholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('register_password_label')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder={t('password_placeholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('register_role_label')}</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="employee">{t('register_role_employee')}</option>
              <option value="manager">{t('register_role_manager')}</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            {t('register_submit_button')}
          </button>
        </form>

        <p className="auth-link">
          {t('register_login_text')} <Link to="/login">{t('register_login_link')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;