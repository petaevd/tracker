import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaPalette } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthState, logout } from '../../store/slices/authSlice';
import { getUserById, updateUser, uploadAvatar, changePassword } from '../../api/userApi';
import { getAvatarLetter } from '../../utils';
import './Settings.css';
import useAssetUrl from '../../hooks/useAssetUrl';

const Settings = () => {
  const getAssetUrl = useAssetUrl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    darkMode: true,
    highContrast: false,
    language: 'ru',
    fontSize: 16,
    voiceAssistant: false,
    accentColor: '#9A48EA',
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Москва (UTC+3)',
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const applyAccessibilitySettings = (settings) => {
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getUserById(user.id);
        setProfileData({
          name: response.username,
          email: response.email,
          avatar: response.avatar_url || null,
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setError('Не удалось загрузить профиль');
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          applyAccessibilitySettings(parsedSettings);
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    };

    loadProfile();
    loadSettings();
  }, [user, navigate, dispatch]);

  const saveSettings = async (newSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      applyAccessibilitySettings(newSettings);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      setError('Не удалось сохранить настройки');
    }
  };

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    saveSettings(updatedSettings);
  };

  const toggleVoiceAssistant = (e) => {
    const isEnabled = e.target.checked;
    handleSettingChange('voiceAssistant', isEnabled);

    if (isEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance('Голосовой помощник включён');
      utterance.lang = 'ru-RU';
      
      utterance.onend = () => {
        if (settings.voiceAssistant) {
          console.log('Голосовой помощник готов к работе');
        }
      };
      
      speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateProfile = async () => {
    if (profileData.name.length < 3) {
      setError('Имя пользователя должно быть не короче 3 символов');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(profileData.name)) {
      setError('Имя пользователя может содержать только буквы, цифры, подчеркивания и дефисы');
      return;
    }
    if (!validateEmail(profileData.email)) {
      setError('Некорректный формат email');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await updateUser(user.id, {
        username: profileData.name,
        email: profileData.email,
      });
      
      // Исправлено: используем данные из response для обновления состояния
      const updatedUser = {
        ...user,
        username: profileData.name,
        email: profileData.email
      };
      
      dispatch(setAuthState({ 
        user: updatedUser, 
        token: token // Используем токен из Redux store
      }));
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Профиль успешно обновлён!');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      if (error.response?.data?.conflicts?.username) {
        setError('Пользователь с таким именем уже существует');
      } else if (error.response?.data?.conflicts?.email) {
        setError('Пользователь с таким email уже существует');
      } else {
        setError(error.response?.data?.message || 'Ошибка при обновлении профиля');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Максимальные размеры
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.7); // 0.7 - качество сжатия
        };
      };
    });
  };
  
  // Обновленная handleAvatarChange с сжатием
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setIsLoading(true);
    setError('');
  
    try {
      const response = await uploadAvatar(user.id, file);
      
      console.log('Avatar upload response:', response); // Добавьте логирование
      
      if (!response.avatar_url) {
        throw new Error('Не удалось получить URL аватара');
      }
  
      const updatedUser = {
        ...user,
        avatar_url: response.avatar_url
      };
  
      dispatch(setAuthState({
        user: updatedUser,
        token
      }));
  
      setProfileData(prev => ({
        ...prev,
        avatar: response.avatar_url
      }));
  
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Не удалось обновить аватар');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      setError('Новый пароль должен быть не короче 6 символов');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert('Пароль успешно изменён!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      setError(error.response?.data?.message || 'Ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Настройки</div>
        <h1 className="dashboard-title">Настройки</h1>
        <p className="dashboard-subtitle">Управление настройками вашего аккаунта</p>

        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading-message">Загрузка...</div>}

        <div className="settings-container">
          <div className="settings-sidebar">
            <button
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Профиль
            </button>
            <button
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Безопасность
            </button>
            <button
              className={`settings-tab ${activeTab === 'accessibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('accessibility')}
            >
              Доступность
            </button>
            <button
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              Внешний вид
            </button>
            <button
              className={`settings-tab ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              Язык и регион
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">Настройки профиля</h2>
               <div className="avatar-upload">
               <div className="avatar-preview">
                {profileData.avatar ? (
                  <img
                    src={getAssetUrl(profileData.avatar)}
                    alt="Ваш аватар"
                    className="avatar-image"
                    onError={(e) => {
                      e.target.onerror = null; // Предотвращаем бесконечный цикл
                      e.target.src = ''; // Удаляем нерабочий URL
                      setProfileData(prev => ({
                        ...prev,
                        avatar: prev.avatar || null
                      }));
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getAvatarLetter(user?.username, user?.email)}
                  </div>
                )}
              </div>
                <label className={`upload-button ${isLoading ? 'uploading' : ''}`}>
                  {isLoading ? 'Загрузка...' : 'Выбрать файл'}
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                    hidden
                  />
                </label>
                
                <div className="upload-hint">
                  Максимальный размер: 2MB (JPEG, PNG, WebP)
                </div>
              </div>

                <div className="form-group">
                  <label>Имя пользователя</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="settings-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="settings-input"
                    disabled={isLoading}
                  />
                </div>

                <button className="save-button" onClick={updateProfile} disabled={isLoading}>
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">Безопасность</h2>
                <div className="security-item">
                  <h3>Смена пароля</h3>
                  <div className="form-group">
                    <label>Текущий пароль</label>
                    <div className="password-input">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="settings-input"
                        disabled={isLoading}
                      />
                      <button
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword({ ...showPassword, current: !showPassword.current })
                        }
                        disabled={isLoading}
                      >
                        {showPassword.current ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Новый пароль</label>
                    <div className="password-input">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="settings-input"
                        disabled={isLoading}
                      />
                      <button
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword({ ...showPassword, new: !showPassword.new })
                        }
                        disabled={isLoading}
                      >
                        {showPassword.new ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Подтвердите новый пароль</label>
                    <div className="password-input">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="settings-input"
                        disabled={isLoading}
                      />
                      <button
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                        }
                        disabled={isLoading}
                      >
                        {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <button className="save-button" onClick={handleChangePassword} disabled={isLoading}>
                    {isLoading ? 'Изменение...' : 'Изменить пароль'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="settings-section">
                <h2 className="section-title">Доступность</h2>
                <div className="accessibility-item">
                  <h3>Режим высокой контрастности</h3>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="contrast-toggle"
                      className="toggle-input"
                      checked={settings.highContrast}
                      onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                      disabled={isLoading}
                    />
                    <label htmlFor="contrast-toggle" className="toggle-label"></label>
                    <span>{settings.highContrast ? 'Включено' : 'Выключено'}</span>
                  </div>
                  <p className="hint-text">Улучшает видимость для пользователей с нарушением зрения</p>
                </div>

                <div className="accessibility-item">
                  <h3>Размер текста</h3>
                  <div className="range-slider">
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                      className="slider-input"
                      disabled={isLoading}
                    />
                    <div className="slider-labels">
                      <span>Мелкий</span>
                      <span>Крупный</span>
                    </div>
                    <div className="slider-value">{settings.fontSize}px</div>
                  </div>
                  <p className="hint-text">Изменяет размер текста на всём сайте</p>
                </div>

                <div className="accessibility-item">
                  <h3>Озвучивание интерфейса</h3>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="voice-toggle"
                      className="toggle-input"
                      checked={settings.voiceAssistant}
                      onChange={toggleVoiceAssistant}
                      disabled={!('speechSynthesis' in window) || isLoading}
                    />
                    <label htmlFor="voice-toggle" className="toggle-label"></label>
                    <span>
                      {settings.voiceAssistant ? 'Включено' : 'Выключено'}
                      {!('speechSynthesis' in window) && ' (недоступно)'}
                    </span>
                  </div>
                  <p className="hint-text">
                    {!('speechSynthesis' in window)
                      ? 'Ваш браузер не поддерживает речевой синтез'
                      : 'Озвучивает основные действия и элементы интерфейса'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2 className="section-title">Внешний вид</h2>
                <div className="appearance-item">
                  <h3>Цветовая тема</h3>
                  <div className="theme-options">
                    <div
                      className={`theme-option ${settings.darkMode ? 'active' : ''}`}
                      onClick={() => handleSettingChange('darkMode', true)}
                    >
                      <div className="theme-preview dark-theme">
                        <FaPalette />
                      </div>
                      <span>Тёмная</span>
                    </div>
                    <div
                      className={`theme-option ${!settings.darkMode ? 'active' : ''}`}
                      onClick={() => handleSettingChange('darkMode', false)}
                    >
                      <div className="theme-preview light-theme">
                        <FaPalette />
                      </div>
                      <span>Светлая</span>
                    </div>
                  </div>
                </div>
                {/* <div className="appearance-item">
                  <h3>Акцентный цвет</h3>
                  <div className="color-picker">
                    {['#9A48EA', '#FF5252', '#4CAF50', '#2196F3', '#FFC107'].map((color) => (
                      <div
                        key={color}
                        className={`color-option ${settings.accentColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleSettingChange('accentColor', color)}
                      />
                    ))}
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                      className="color-custom"
                      disabled={isLoading}
                    />
                  </div>
                </div> */}
              </div>
            )}

            {activeTab === 'language' && (
              <div className="settings-section">
                <h2 className="section-title">Язык и регион</h2>
                <div className="form-group">
                  <label>Язык интерфейса</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="settings-select"
                    disabled={isLoading}
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
                {/* <div className="form-group">
                  <label>Формат даты</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    className="settings-select"
                    disabled={isLoading}
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div> */}
                {/* <div className="form-group">
                  <label>Часовой пояс</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="settings-select"
                    disabled={isLoading}
                  >
                    <option value="Москва (UTC+3)">Москва (UTC+3)</option>
                    <option value="Киев (UTC+2)">Киев (UTC+2)</option>
                    <option value="Лондон (UTC+1)">Лондон (UTC+1)</option>
                    <option value="Нью-Йорк (UTC-4)">Нью-Йорк (UTC-4)</option>
                  </select>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;