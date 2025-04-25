import React from 'react';
import { FaShareAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './TopBar.css';

const TopBar = ({ onLogout }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="top-bar">
      <div className="top-bar-actions">
        <button className="share-button">
          <FaShareAlt />
        </button>
        {user ? (
          <div className="user-controls">
            <div className="user-avatar">{user.avatarLetter || '?'}</div>
            <button onClick={onLogout} className="logout-button">
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            <FaUser />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;