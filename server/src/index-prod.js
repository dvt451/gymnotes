// server/src/index-prod.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Для ES модулей: получение __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
const envFile = `../.env.${env}`;
const envPath = path.join(__dirname, envFile);

console.log(`=== Загружаем окружение: ${env} ===`);
console.log(`Файл окружения: ${envPath}`);

// Загружаем .env файл
try {
	dotenv.config({ path: envPath });
	console.log(`✅ Загружен ${envFile}`);
} catch (err) {
	console.log(`⚠️ ${envFile} не найден, пробуем .env`);
	dotenv.config();
}

// Импорт маршрутов
import authRoutes from './routes/auth.js';
import trainingRoutes from './routes/trainings.js';
import dateRoutes from './routes/dates.js';
import exerciseRoutes from './routes/exercises.js';
import templateRoutes from './routes/templates.js';
import weightRoutes from './routes/weights.js';
import repRoutes from './routes/reps.js';
import nutritionRoutes from './routes/nutritions.js';
import exerciseLibraryRoutes from './routes/exerciseLibrary.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import { createCorsOptions } from './utils/cors.js';

const app = express();

// CORS настройка
app.use(cors(createCorsOptions()));

app.use(express.json({ limit: '25mb' }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Основные роутеры
app.use('/api/trainings', trainingRoutes); // Основные операции с тренировками
app.use('/api/nutritions', nutritionRoutes);
app.use('/api/exercise-library', exerciseLibraryRoutes);
app.use('/api/progress', progressRoutes);

// Роутеры для работы с датами, упражнениями, весами и повторениями
// Эти роутеры должны быть ПОДКЛЮЧЕНЫ ТОЛЬКО ОДИН РАЗ и в правильном порядке
app.use('/api/trainings/:fileId/dates', dateRoutes);
app.use('/api/trainings/:fileId/dates/:date/exercises', exerciseRoutes);
app.use('/api/trainings/:fileId/dates/:date/exercises/:exerciseId/weights', weightRoutes);
app.use('/api/trainings/:fileId/dates/:date/exercises/:exerciseId/weights/:weightId/sets', repRoutes);
app.use('/api/trainings/:fileId/templates', templateRoutes);

app.get('/api/test-weights', (req, res) => {
	res.json({
		message: 'Weights endpoint is accessible',
		status: 'OK',
		timestamp: new Date().toISOString()
	});
});

// Health check
app.get('/health', (req, res) => {
	res.json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: env,
		mongoConnected: mongoose.connection.readyState === 1
	});
});

// Root endpoint
app.get('/', (req, res) => {
	res.json({
		message: '🚀 GymNotes API Server is running!',
		version: '1.0.0',
		environment: env,
		endpoints: {
			auth: '/api/auth/*',
			trainings: '/api/trainings',
			dates: '/api/trainings/:fileId/dates',
			exercises: '/api/trainings/:fileId/dates/:date/exercises',
			weights: '/api/trainings/:fileId/dates/:date/exercises/:exerciseId/weights',
			sets: '/api/trainings/:fileId/dates/:date/exercises/:exerciseId/weights/:weightId/sets',
			templates: '/api/trainings/:fileId/templates',
			nutritions: '/api/nutritions',
			exercise_library: '/api/exercise-library',
			progress: '/api/progress',
			admin: '/api/admin',
			test_weights: '/api/test-weights',
			health: '/health'
		}
	});
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
		requestedUrl: req.originalUrl
	});
});

// Подключение к MongoDB
const connectDB = async () => {
	try {
		const connectionString = process.env.MONGO_URI;

		if (!connectionString) {
			console.error('❌ ОШИБКА: Не найден MongoDB connection string!');
			console.log('Пожалуйста добавьте в .env файл:');
			console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname');
			console.log('Trying local MongoDB fallback...');
			try {
				await mongoose.connect('mongodb://localhost:27017/gymnotes', {
					useNewUrlParser: true,
					useUnifiedTopology: true,
				});
				console.log('Local MongoDB connected');
				return true;
			} catch (localErr) {
				console.error('Local MongoDB is not available');
				return false;
			}
		}

		console.log(`🔗 Подключаемся к MongoDB Atlas...`);

		await mongoose.connect(connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 30000,
			socketTimeoutMS: 45000,
			retryWrites: true,
			w: 'majority',
		});

		console.log('✅ MongoDB Atlas подключена успешно!');
		console.log(`📁 База данных: ${mongoose.connection.name}`);
		console.log(`📍 Хост: ${mongoose.connection.host}`);

		return true;
	} catch (err) {
		console.error('❌ MongoDB connection error:', err.message);

		// Пробуем локальную базу как fallback
		console.log('🔄 Пробуем локальный MongoDB...');
		try {
			await mongoose.connect('mongodb://localhost:27017/gymnotes', {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			console.log('✅ Локальный MongoDB подключен!');
			return true;
		} catch (localErr) {
			console.error('❌ Локальный MongoDB также недоступен');
			return false;
		}
	}
};

// Запуск сервера
const startServer = async () => {
	const dbConnected = await connectDB();

	if (!dbConnected) {
		console.log('⚠️ Сервер запускается без подключения к БД');
	}

	const PORT = process.env.PORT || 5000;

	app.listen(PORT, () => {
		console.log(`\n🚀 Server running on port ${PORT}`);
		console.log(`📁 Окружение: ${env}`);
		console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
		console.log(`🔗 MongoDB: ${dbConnected ? 'Connected' : 'Not connected'}`);
		console.log(`\n✅ API доступно по адресу: http://localhost:${PORT}`);
	});
};

// Обработка ошибок
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: 'Internal server error',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined
	});
});

// Обработка незавершенных промисов
process.on('unhandledRejection', (err) => {
	console.error('Unhandled Rejection:', err);
});

// Запуск
startServer();
