import express from 'express';
import cors from './config/cors.js';
import sequelize from './config/db.js';
import { configDotenv } from 'dotenv';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import setupAssociations from './config/associations.js';

configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors);
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
console.log('Serving static files from:', path.join(__dirname, 'public/avatars'));
app.use('/api', router);
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Настраиваем связи после инициализации моделей
    setupAssociations();

    await sequelize.sync({ force: false });
    console.log('Database synced successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();