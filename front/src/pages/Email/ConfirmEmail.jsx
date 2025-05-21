import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken } from '../../api/authApi';
import { toast, ToastContainer } from 'react-toastify';

const ConfirmEmail = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await verifyEmailToken(token);
        setStatus('success');
        toast.success('Email успешно подтверждён!');
        setTimeout(() => navigate('/'), 3000);
      } catch (error) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Ошибка подтверждения email');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div className="auth-bg">
      <div>
        <ToastContainer />
      </div>
      <div className='container'>
        {status === 'loading' && (
            <div className="loading-spinner">
            <p>Проверка токена...</p>
            </div>
        )}

        {status === 'success' && (
            <div className="success-message">
            <h2>✅ Подтверждение успешно!</h2>
            <p>Ваш email подтверждён. Перенаправляем на главную страницу...</p>
            </div>
        )}

        {status === 'error' && (
            <div className="error-message">
            <h2>❌ Ошибка подтверждения</h2>
            <p>Ссылка недействительна или истекла.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;