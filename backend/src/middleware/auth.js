const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Токен доступа не предоставлен'
            });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Находим пользователя
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Добавляем пользователя в объект запроса
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Недействительный токен'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Токен истек'
            });
        } else {
            console.error('Ошибка middleware авторизации:', error);
            return res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
};

// Функция создания JWT токена
const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Middleware для проверки данных регистрации
const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    // Проверка наличия всех полей
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Все поля обязательны для заполнения'
        });
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Некорректный формат email'
        });
    }

    // Проверка длины пароля
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Пароль должен содержать минимум 6 символов'
        });
    }

    // Проверка длины имени
    if (name.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Имя должно содержать минимум 2 символа'
        });
    }

    next();
};

// Middleware для проверки данных входа
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email и пароль обязательны'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Некорректный формат email'
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    generateToken,
    validateRegistration,
    validateLogin
};
