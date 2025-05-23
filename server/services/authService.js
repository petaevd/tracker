import { Op } from 'sequelize';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, generateEmailToken } from '../utils/jwt.js';
import { sendEmail } from './emailService.js';

const register = async ({ username, email, password, role,  }) => {
  const existingUser = await User.findOne({
    where: { [Op.or]: [{ username }, { email }] },
  });
  if (existingUser) {
    const conflicts = {};
    if (existingUser.username === username) conflicts.username = true;
    if (existingUser.email === email) conflicts.email = true;
    const err = new Error('Пользователь уже существует');
    err.status = 409;
    err.conflicts = conflicts;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const user = await User.create({ username, email, password_hash, role });
  const token = generateToken({ userId: user.id, role: user.role });
  const emailToken = generateEmailToken(user.email);
  
  const confirmLink = `${process.env.FRONTEND_URL}/confirm-email?token=${emailToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Подтвердите ваш email',
    html: `Нажмите <a href="${confirmLink}">здесь</a> для подтверждения email`
  });

  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role, email_confirmed: false },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Неверный email или пароль');
    err.status = 401;
    throw err;
  }

  if (!user.email_confirmed) {
    const emailToken = generateEmailToken(user.email);
    const confirmLink = `${process.env.FRONTEND_URL}/confirm-email/${emailToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Подтвердите ваш email',
      html: `Нажмите <a href="${confirmLink}">здесь</a> для подтверждения email`
    });
    
    throw {
      message: 'Email не подтверждён. Новое письмо отправлено на вашу почту',
      status: 403,
      code: 'EMAIL_NOT_CONFIRMED'
    };
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    const err = new Error('Неверный email или пароль');
    err.status = 401;
    throw err;
  }

  const token = generateToken({ userId: user.id, role: user.role });
  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    token,
  };
};

export default { register, login };