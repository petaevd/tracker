import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Абсолютный путь к папке с аватарами
const AVATARS_DIR = path.join(__dirname, '../public/avatars');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Гарантированно создаем папку, если её нет
      if (!existsSync(AVATARS_DIR)) {
        await fs.mkdir(AVATARS_DIR, { recursive: true });
        console.log(`Директория создана: ${AVATARS_DIR}`);
      }
      cb(null, AVATARS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения (JPEG/JPG/PNG) разрешены'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

export default upload;