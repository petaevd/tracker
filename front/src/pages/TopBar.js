import React from 'react';
import { 
  FaSearch, 
  FaShareAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from './AuthContext';
import './TopBar.css';

const TopBar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="top-bar">
      <div className="search-container">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            id="search-input"
            type="text"
            placeholder="Поиск"
            className="search-input"
          />
          <div className="shortcut-box">
            <span className="shortcut-key">⌘</span>
            <span className="shortcut-key">F</span>
          </div>
        </div>
      </div>
      <div className="top-bar-actions">
        <button className="share-button">
          <FaShareAlt />
        </button>
        {user && (
          <div className="user-menu">
            <div className="user-avatar">
              {user.avatarLetter || (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <button onClick={logout} className="logout-button">
              <FaSignOutAlt />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;