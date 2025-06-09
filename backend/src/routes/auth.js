const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
    authenticateToken, 
    generateToken, 
    validateRegistration, 
    validateLogin 
} = require('../middleware/auth');

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Проверяем, не существует ли уже пользователь с таким email
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email уже зарегистрирован'
            });
        }

        // Создаем нового пользователя
        const newUser = await User.create(name, email, password);

        // Генерируем JWT токен
        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            data: {
                user: newUser.toJSON(),
                token: token
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

// POST /api/auth/login - Вход в систему
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ищем пользователя по email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем пароль
        const isPasswordValid = await user.checkPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Генерируем JWT токен
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                user: user.toJSON(),
                token: token
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// GET /api/auth/profile - Получение профиля пользователя (защищенный маршрут)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Профиль пользователя',
            data: {
                user: req.user.toJSON()
            }
        });
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// POST /api/auth/logout - Выход из системы
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // В реальном приложении здесь можно добавить токен в черный список
        // Для простоты просто возвращаем успешный ответ
        res.json({
            success: true,
            message: 'Выход выполнен успешно'
        });
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// GET /api/auth/verify - Проверка токена
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Токен действителен',
            data: {
                user: req.user.toJSON()
            }
        });
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

module.exports = router;
