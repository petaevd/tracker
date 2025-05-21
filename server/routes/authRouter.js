import { Router } from 'express';
import authController from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { authSchema } from '../utils/validators.js';
import User from '../models/User.js';
import { generateEmailToken } from '../utils/jwt.js';
import { sendEmail } from '../services/emailService.js';
import { verifyEmailToken } from '../utils/jwt.js';

const router = Router();

router.post('/register', validate(authSchema.register), authController.register);
router.post('/login', validate(authSchema.login), authController.login);
router.get('/confirm-email', async (req, res) => {
    try {
      const { token } = req.query;
      const { email } = verifyEmailToken(token);
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      await user.update({ email_confirmed: true });
      
      return res.status(200).json({ message: 'Email успешно подтвержден' });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Неверный или просроченный токен' });
    }
});
router.post('/resend-confirmation', async (req, res) => {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    if (user.email_confirmed) {
      return res.status(400).json({ message: 'Email уже подтвержден' });
    }
    
    const emailToken = generateEmailToken(user.email);
  
    const confirmLink = `${process.env.FRONTEND_URL}/confirm-email/${emailToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Подтвердите ваш email',
      html: `Нажмите <a href="${confirmLink}">здесь</a> для подтверждения email`
    });
    
    return res.json({ message: 'Письмо подтверждения отправлено' });
  });

export default router;