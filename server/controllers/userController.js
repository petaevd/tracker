import userService from '../services/userService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getUserTeams = async (req, res, next) => {
  try {
    const teams = await userService.getUserTeams(req.params.id);
    res.json(teams);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.params.id, req.body);
    res.json({ message: 'Профиль успешно обновлён', user });
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Файл аватара не загружен');
      err.status = 400;
      throw err;
    }

    const avatarUrl = `/avatars/${req.file.filename}`;
    const user = await userService.updateAvatar(req.params.id, avatarUrl);

    // Удаляем старый аватар, если он существует
    if (user.avatar_url && user.avatar_url !== avatarUrl) {
      const oldAvatarPath = path.join(__dirname, '../public', user.avatar_url);
      await fs.unlink(oldAvatarPath).catch(() => {}); // Игнорируем ошибку, если файл не существует
    }

    res.json({ message: 'Аватар успешно загружен', avatar_url: `${process.env.API_BASE_URL || 'http://localhost:8080'}${avatarUrl}` });
  } catch (err) {
    if (req.file) {
      const filePath = path.join(__dirname, '../public/avatars', req.file.filename);
      await fs.unlink(filePath).catch(() => {});
    }
    next(err);
  }
};

const deleteAvatar = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user.avatar_url) {
      const err = new Error('У пользователя нет аватара');
      err.status = 400;
      throw err;
    }

    const avatarPath = path.join(__dirname, '../public', user.avatar_url);
    await fs.unlink(avatarPath).catch(() => {});
    await userService.updateAvatar(req.params.id, null);

    res.json({ message: 'Аватар успешно удалён' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.params.id, req.body, req.user);
    res.json({ message: 'Пароль успешно изменён' });
  } catch (err) {
    next(err);
  }
};

export default { getAllUsers, getUserById, getUserTeams, updateProfile, uploadAvatar, deleteAvatar, changePassword };