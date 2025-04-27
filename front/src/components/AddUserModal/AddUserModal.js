import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../../store/slices/projectSlice';
import { fetchUsers } from '../../api/userApi';
import { toast } from 'react-toastify';
import api from '../../api/api';
import './AddUserModal.css';

const AddUserModal = ({ users, setUsers, project, setTeamMembers, setShowAddUserModal }) => {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response);
      } catch (err) {
        toast.error('Ошибка загрузки пользователей');
      }
    };

    fetchUsersData();
  }, [setUsers]);

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error('Выберите пользователя');
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        addUser({ teamId: project.team_id, userId: selectedUserId })
      ).unwrap();
      setSelectedUserId('');
      setShowAddUserModal(false);
      toast.success('Пользователь добавлен');
      const response = await api.get(`/teams/${project.team_id}/members`);
      setTeamMembers(response.data);
    } catch (err) {
      toast.error(err || 'Ошибка добавления пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Добавить пользователя в проект</h3>
        <select
          className="modal-input"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>Выберите пользователя</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button
            className="modal-btn cancel"
            onClick={() => setShowAddUserModal(false)}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            className="modal-btn confirm"
            onClick={handleAddUser}
            disabled={loading}
          >
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;