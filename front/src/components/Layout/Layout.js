
import { useNavigate } from 'react-router-dom';
import Navbar from '../NavBar/Navbar';
import TopBar from '../TopBar/TopBar';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="content-wrapper">
        <TopBar onLogout={handleLogout} />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;