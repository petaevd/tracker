import React, { useState, useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUser, FaSignOutAlt, FaEye, FaEyeSlash, FaPalette } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    darkMode: true,
    highContrast: false,
    language: 'ru',
    fontSize: 16,
    voiceAssistant: false,
    accentColor: '#9A48EA',
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Москва (UTC+3)'
  });
  
  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    saveSettings(updatedSettings);
  };

  const getAvatarLetter = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?'; // Fallback символ
  };

  const toggleVoiceAssistant = (e) => {
  const isEnabled = e.target.checked;
  handleSettingChange('voiceAssistant', isEnabled);

  if (isEnabled && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('Голосовой помощник включён');
    speechSynthesis.speak(utterance);
  }
};


  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const navigate = useNavigate();

  // Загрузка профиля при монтировании
  useEffect(() => {
      if (!user) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        navigate('/login');
        return;
      }
  
      const loadProfile = async () => {
        try {
          const response = await axios.get(`/api/users/${user.id}/profile`);
          setProfileData({
            name: response.data.username,
            email: response.data.email,
            avatar: response.data.avatar_url
          });
        } catch (error) {
          console.error('Ошибка загрузки профиля:', error);
        }
      };
      
      loadProfile();
      loadSettings();
    }, [user, navigate]);

  // Загрузка настроек
  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  // Сохранение настроек
  const saveSettings = async (newSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  // Обработка смены аватара
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Проверка размера файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('avatar', file);
  
      const response = await axios.put(`/api/users/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Добавляем токен авторизации
        }
      });
  
      setProfileData(prev => ({
        ...prev,
        avatar: response.data.avatarUrl
      }));
      alert('Аватар успешно обновлен!');
    } catch (error) {
      console.error('Ошибка обновления аватара:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Ошибка при обновлении аватара');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  
    const loadProfile = async () => {
      try {
        const response = await axios.get(`/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setProfileData({
          name: response.data.username,
          email: response.data.email,
          avatar: response.data.avatarUrl || null
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          onLogout(); // Разлогиниваем пользователя при 401 ошибке
        }
      }
    };
    
    loadProfile();
    loadSettings();
  }, [user, navigate, onLogout]);
  
  // Обновление профиля
  const updateProfile = async () => {
    try {
      const response = await axios.put(`/api/users/${user.id}/profile`, {
        username: profileData.name
      });
      
      setProfileData(prev => ({
        ...prev,
        name: response.data.username
      }));
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      alert('Ошибка при обновлении профиля');
    }
  };

  // Смена пароля
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }
    
    try {
      await axios.post('/api/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      alert('Пароль успешно изменен!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      alert('Ошибка при смене пароля');
    }
  };

  return (
    <div className="dashboard-container" >
      {/* Верхняя панель с поиском */}
      <div className="top-bar">
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input id="search-input" type="text" placeholder="Поиск" className="search-input"/>
            <div className="shortcut-box">
              <span className="shortcut-key">⌘</span>
              <span className="shortcut-key">F</span>
            </div>
          </div>
        </div>
        <div className="top-bar-actions">
          <button className="share-button"><FaShareAlt /></button>
          {user ? (
            <div className="user-controls">
        <div className="user-avatar">
          {getAvatarLetter()}
        </div>
              <button 
                className="logout-btn"
                onClick={onLogout}
                title="Выйти"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button 
              className="login-btn"
              onClick={() => navigate('/login')}
            >
              <FaUser />
            </button>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="main-content">
        <div className="breadcrumb">Домашняя/Настройки</div>
        <h1 className="dashboard-title">Настройки</h1>
        <p className="dashboard-subtitle">Управление настройками вашего аккаунта</p>
        
        <div className="settings-container">
          {/* Боковая панель навигации */}
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
          
          {/* Контент настроек */}
          <div className="settings-content">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">Настройки профиля</h2>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="avatar-image"/>
                    ) : (
                      <div className="avatar-placeholder">{getAvatarLetter()}</div>
                    )}
                  </div>
                  <label className="upload-button">
                    Изменить фото
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden/>
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Имя пользователя</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="settings-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="settings-input"
                    disabled // Email обычно меняется через отдельный процесс
                  />
                </div>
                
                <button className="save-button" onClick={updateProfile}>
                  Сохранить изменения
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
                        type={showPassword.current ? "text" : "password"} 
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="settings-input"
                      />
                      <button 
                        className="password-toggle"
                        onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                      >
                        {showPassword.current ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Новый пароль</label>
                    <div className="password-input">
                      <input 
                        type={showPassword.new ? "text" : "password"} 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="settings-input"
                      />
                      <button 
                        className="password-toggle"
                        onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                      >
                        {showPassword.new ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Подтвердите новый пароль</label>
                    <div className="password-input">
                      <input 
                        type={showPassword.confirm ? "text" : "password"} 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="settings-input"
                      />
                      <button 
                        className="password-toggle"
                        onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                      >
                        {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>
                  
                  <button className="save-button" onClick={changePassword}>
                    Изменить пароль
                  </button>
                </div>
                
                <div className="security-item">
                  <h3>Двухфакторная аутентификация</h3>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="2fa-toggle" 
                      className="toggle-input"
                      checked={settings.twoFactorAuth || false}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                    <label htmlFor="2fa-toggle" className="toggle-label"></label>
                    <span>{settings.twoFactorAuth ? 'Включено' : 'Выключено'}</span>
                  </div>
                  <p className="hint-text">Добавьте дополнительный уровень безопасности к вашему аккаунту</p>
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
                    />
                    <div className="slider-labels">
                      <span>Мелкий</span>
                      <span>Крупный</span>
                    </div>
                    <div className="slider-value">{settings.fontSize}px</div>
                  </div>
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
                      disabled={!('speechSynthesis' in window)}
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
                      : 'Включите для голосового сопровождения действий'}
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
                
                <div className="appearance-item">
                  <h3>Акцентный цвет</h3>
                  <div className="color-picker">
                    {['#9A48EA', '#FF5252', '#4CAF50', '#2196F3', '#FFC107'].map(color => (
                      <div 
                        key={color} 
                        className={`color-option ${settings.accentColor === color ? 'active' : ''}`}
                        style={{backgroundColor: color}}
                        onClick={() => handleSettingChange('accentColor', color)}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={settings.accentColor}
                      onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                      className="color-custom"
                    />
                  </div>
                </div>
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
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Формат даты</label>
                  <select 
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    className="settings-select"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Часовой пояс</label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="settings-select"
                  >
                    <option value="Москва (UTC+3)">Москва (UTC+3)</option>
                    <option value="Киев (UTC+2)">Киев (UTC+2)</option>
                    <option value="Лондон (UTC+1)">Лондон (UTC+1)</option>
                    <option value="Нью-Йорк (UTC-4)">Нью-Йорк (UTC-4)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;