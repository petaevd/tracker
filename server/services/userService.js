import User from '../models/User.js';

const changePassword = async (id, { currentPassword, newPassword }, requestingUser) => {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }

  if (requestingUser.id !== parseInt(id) && requestingUser.role !== 'admin') {
    const err = new Error('Доступ запрещён');
    err.status = 403;
    throw err;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    const err = new Error('Неверный текущий пароль');
    err.status = 400;
    throw err;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await user.update({ password_hash: newHash });
};

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }
  return user;
};

const getUserTeams = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: Team, as: 'teams', attributes: ['id', 'name', 'description'] },
    ],
  });
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }
  return user.teams;
};

const updateProfile = async (id, { username, email }) => {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }

  const conflicts = {};
  if (username) {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser && existingUser.id !== parseInt(id)) {
      conflicts.username = 'Пользователь с таким именем уже существует';
    }
  }

  if (email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== parseInt(id)) {
      conflicts.email = 'Пользователь с таким email уже существует';
    }
  }

  if (Object.keys(conflicts).length > 0) {
    const err = new Error('Конфликт данных');
    err.status = 409;
    err.conflicts = conflicts;
    throw err;
  }

  const updates = { username, email };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await user.update(updates);
  return user;
};

const updateAvatar = async (id, avatarUrl) => {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }

  await user.update({ avatar_url: avatarUrl });
  return user;
};

export default { getUserById, getUserTeams, updateProfile, updateAvatar, changePassword };