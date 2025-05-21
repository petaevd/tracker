import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaPalette } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthState, logout } from '../../store/slices/authSlice';
import { getUserById, updateUser, uploadAvatar, changePassword } from '../../api/userApi';
import { getAvatarLetter } from '../../utils';
import './Settings.css';
import useAssetUrl from '../../hooks/useAssetUrl';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';

const Settings = () => {
  const getAssetUrl = useAssetUrl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
  };
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================

  // ================ Темы ================
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  function changeTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    setTheme(themeName);
  }
  // ================ Темы ================

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
      toast.success('Профиль успешно обновлён!');
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
      toast.success('Пароль успешно изменён!');
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
      <div>
        <ToastContainer/>
      </div>
      <div className="main-content">
        <div className="breadcrumb">{t('settings_breadcrumb')}</div>
        <h1 className="">{t('settings_title')}</h1>
        <p className="dashboard-subtitle">{t('settings_subtitle')}</p>
  
        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading-message">{t('settings_loading')}</div>}
  
        <div className="settings-container">
          <div className="settings-sidebar">
            <button
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              {t('settings_tab_profile')}
            </button>
            <button
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              {t('settings_tab_security')}
            </button>
            <button
              className={`settings-tab ${activeTab === 'accessibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('accessibility')}
            >
              {t('settings_tab_accessibility')}
            </button>
            <button
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              {t('settings_tab_appearance')}
            </button>
            <button
              className={`settings-tab ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              {t('settings_tab_language')}
            </button>
          </div>
  
          <div className="settings-content">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">{t('profile_title')}</h2>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    {profileData.avatar ? (
                      <img
                        src={getAssetUrl(profileData.avatar)}
                        alt={t('profile_avatar_alt')}
                        className="avatar-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
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
                    {isLoading ? t('settings_loading') : t('profile_avatar_upload')}
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                      hidden
                    />
                  </label>
                  
                  <div className="upload-hint">
                    {t('profile_avatar_hint')}
                  </div>
                </div>
  
                <div className="form-group">
                  <label htmlFor="username">{t('profile_username')}</label>
                  <input
                    id="username"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="settings-input"
                    disabled={isLoading}
                    aria-required="true"
                  />
                </div>
  
                <div className="form-group">
                  <label htmlFor="email">{t('profile_email')}</label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="settings-input"
                    disabled={isLoading}
                    aria-required="true"
                  />
                </div>
  
                <button className="save-button" onClick={updateProfile} disabled={isLoading}>
                  {isLoading ? t('profile_saving') : t('profile_save_button')}
                </button>
              </div>
            )}
  
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">{t('security_title')}</h2>
                <div className="security-item">
                  <h3>{t('security_password_title')}</h3>
                  <div className="form-group">
                    <label htmlFor="currentPassword">{t('security_current_password')}</label>
                    <div className="password-input">
                      <input
                        id="currentPassword"
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="settings-input"
                        disabled={isLoading}
                        aria-required="true"
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
                    <label>{t('security_new_password')}</label>
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
                    <label>{t('security_confirm_password')}</label>
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
                    {isLoading ? t('security_changing') : t('security_change_button')}
                  </button>
                </div>
              </div>
            )}
  
            {activeTab === 'accessibility' && (
              <div className="settings-section">
                <h2 className="section-title">{t('accessibility_title')}</h2>
                <div className="accessibility-item">
                  <h3>{t('accessibility_contrast')}</h3>
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
                    <span>{settings.highContrast ? t('toggle_on') : t('toggle_off')}</span>
                  </div>
                  <p className="hint-text">{t('accessibility_contrast_hint')}</p>
                </div>
  
                <div className="accessibility-item">
                  <h3>{t('accessibility_font')}</h3>
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
                      <span>{t('accessibility_font_small')}</span>
                      <span>{t('accessibility_font_large')}</span>
                    </div>
                    <div className="slider-value">{settings.fontSize}px</div>
                  </div>
                  <p className="hint-text">{t('accessibility_font_hint')}</p>
                </div>
  
                <div className="accessibility-item">
                  <h3>{t('accessibility_voice')}</h3>
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
                      {settings.voiceAssistant ? t('toggle_on') : t('toggle_off')}
                      {!('speechSynthesis' in window) && ` (${t('accessibility_voice_unavailable')})`}
                    </span>
                  </div>
                  <p className="hint-text">
                    {!('speechSynthesis' in window)
                      ? t('accessibility_voice_unavailable')
                      : t('accessibility_voice_hint')}
                  </p>
                </div>
              </div>
            )}
  
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2 className="section-title">{t('appearance_title')}</h2>
                <div className="appearance-item">
                  <h3>{t('appearance_theme')}</h3>
                  <div className="theme-options">
                    <div
                      className={`theme-option ${theme == 'dark' ? 'active' : ''}`}
                      onClick={() => {changeTheme('dark')}}
                    >
                      <div className="theme-preview dark-theme">
                        <FaPalette />
                      </div>
                      <span>{t('appearance_theme_dark')}</span>
                    </div>
                    <div
                      className={`theme-option ${theme == 'light' ? 'active' : ''}`}
                      onClick={() => {changeTheme('light')}}
                    >
                      <div className="theme-preview light-theme">
                        <FaPalette />
                      </div>
                      <span>{t('appearance_theme_light')}</span>
                    </div>
                    <div
                      className={`theme-option ${theme == 'raspberry' ? 'active' : ''}`}
                      onClick={() => {changeTheme('raspberry')}}
                    >
                      <div className="theme-preview raspberry-theme">
                        <FaPalette />
                      </div>
                      <span>{t('appearance_theme_raspberry')}</span>
                    </div>
                    <div
                      className={`theme-option ${theme == 'forest' ? 'active' : ''}`}
                      onClick={() => {changeTheme('forest')}}
                    >
                      <div className="theme-preview forest-theme">
                        <FaPalette />
                      </div>
                      <span>{t('appearance_theme_forest')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            {activeTab === 'language' && (
              <div className="settings-section">
                <h2 className="section-title">{t('language_title')}</h2>
                <div className="form-group">
                  <label htmlFor="language-select">{t('language_select')}</label>
                  <select
                    id="language-select"
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    defaultValue={i18n.language}
                    className="settings-select"
                    disabled={isLoading}
                    aria-required="true"
                  >
                    <option value="ru">{t('language_russian')}</option>
                    <option value="en">{t('language_english')}</option>
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