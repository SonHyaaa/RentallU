require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./src/config/database');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Маршруты
app.use('/api/auth', authRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'RentallU Backend API запущен!',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile (требует токен)',
                logout: 'POST /api/auth/logout (требует токен)',
                verify: 'GET /api/auth/verify (требует токен)'
            }
        }
    });
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Глобальная ошибка:', err);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// Подключение к базе данных и запуск сервера
const startServer = async () => {
    try {
        await database.connect();
        
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`📖 API документация: http://localhost:${PORT}`);
            console.log(`🔗 Регистрация: POST http://localhost:${PORT}/api/auth/register`);
            console.log(`🔗 Вход: POST http://localhost:${PORT}/api/auth/login`);
            console.log(`🔗 Профиль: GET http://localhost:${PORT}/api/auth/profile`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
};

// Обработка завершения процесса
process.on('SIGINT', () => {
    console.log('\n🛑 Получен сигнал SIGINT. Завершение работы...');
    database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Получен сигнал SIGTERM. Завершение работы...');
    database.close();
    process.exit(0);
});

// Запуск сервера
startServer();

