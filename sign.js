// Конфигурация API
const API_BASE_URL = 'http://localhost:3000/api';

// Утилиты для работы с токенами
const TokenManager = {
    set: (token) => localStorage.setItem('token', token),
    get: () => localStorage.getItem('token'),
    remove: () => localStorage.removeItem('token'),
    exists: () => !!localStorage.getItem('token')
};

// Утилиты для работы с пользователем
const UserManager = {
    set: (user) => localStorage.setItem('user', JSON.stringify(user)),
    get: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    remove: () => localStorage.removeItem('user'),
    exists: () => !!localStorage.getItem('user')
};

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Функция для показа индикатора загрузки
function setLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Загрузка...';
    } else {
        button.disabled = false;
        // Восстанавливаем оригинальный текст кнопки
        if (button.classList.contains('sign_in_btn')) {
            button.innerHTML = 'Войти';
        } else if (button.classList.contains('sign_up_btn')) {
            button.innerHTML = 'Зарегистрироваться';
        }
    }
}

// Переключение между формами
function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.classList.toggle('d-none');
    registerForm.classList.toggle('d-none');
}

// Обработка регистрации
async function handleRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('.sign_up_btn');
    const name = form.querySelector('#floatingName').value.trim();
    const email = form.querySelector('#floatingEmail').value.trim();
    const password = form.querySelector('#floatingPassword1').value;
    const confirmPassword = form.querySelector('#floatingPassword2').value;
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    // Показываем загрузку
    setLoading(button, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Сохраняем токен и данные пользователя
            TokenManager.set(data.data.token);
            UserManager.set(data.data.user);
            
            showNotification('Регистрация прошла успешно! Добро пожаловать!', 'success');
            
            // Перенаправляем на главную страницу через 2 секунды
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showNotification(data.message || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    } finally {
        setLoading(button, false);
    }
}

// Обработка входа
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('.sign_in_btn');
    const email = form.querySelector('#floatingInput').value.trim();
    const password = form.querySelector('#floatingPassword').value;
    
    // Показываем загрузку
    setLoading(button, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Сохраняем токен и данные пользователя
            TokenManager.set(data.data.token);
            UserManager.set(data.data.user);
            
            showNotification(`Добро пожаловать, ${data.data.user.name}!`, 'success');
            
            // Перенаправляем на главную страницу через 1 секунду
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification(data.message || 'Ошибка входа', 'error');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    } finally {
        setLoading(button, false);
    }
}

// Функция выхода
async function handleLogout() {
    try {
        const token = TokenManager.get();
        if (token) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        }
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    } finally {
        // Очищаем локальные данные
        TokenManager.remove();
        UserManager.remove();
        showNotification('Вы вышли из системы', 'info');
        setTimeout(() => {
            window.location.href = 'sign.html';
        }, 1000);
    }
}

// Проверка авторизации при загрузке страницы
function checkAuthentication() {
    const token = TokenManager.get();
    const user = UserManager.get();
    
    // Если пользователь уже авторизован и находится на странице входа
    if (token && user && window.location.pathname.includes('sign.html')) {
        showNotification(`Вы уже авторизованы как ${user.name}`, 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    checkAuthentication();
    
    // Добавляем обработчики событий для форм
    const loginForm = document.querySelector('#login-form form');
    const registerForm = document.querySelector('#register-form form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});

// Экспортируем функции для использования в других файлах
window.AuthAPI = {
    handleLogout,
    TokenManager,
    UserManager,
    checkAuthentication
};
