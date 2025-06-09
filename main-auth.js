// Функции для работы с авторизацией на главной странице

// Обновление интерфейса в зависимости от статуса авторизации
function updateAuthInterface() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Находим кнопки авторизации
    const authButtons = document.querySelector('.d-flex');
    const signInBtn = authButtons?.querySelector('.btn-sign-in');
    const registerBtn = authButtons?.querySelector('.btn-warning:not(.btn-sign-in)');
    
    if (token && user) {
        // Пользователь авторизован - показываем меню пользователя
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle me-1"></i>${user.name}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="showProfile()">
                            <i class="bi bi-person me-2"></i>Профиль
                        </a></li>
                        <li><a class="dropdown-item" href="#">
                            <i class="bi bi-heart me-2"></i>Избранное
                        </a></li>
                        <li><a class="dropdown-item" href="#">
                            <i class="bi bi-plus-circle me-2"></i>Добавить товар
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="logout()">
                            <i class="bi bi-box-arrow-right me-2"></i>Выйти
                        </a></li>
                    </ul>
                </div>
            `;
        }
        
        // Обновляем приветствие в hero секции
        updateHeroSection(user.name);
        
    } else {
        // Пользователь не авторизован - показываем кнопки входа/регистрации
        if (authButtons) {
            authButtons.innerHTML = `
                <button type="button" class="btn btn-outline-warning me-2">
                    <a href="sign.html" class="text-decoration-none text-dark">Войти</a>
                </button>
                <button type="button" class="btn btn-warning">
                    <a href="sign.html" class="text-decoration-none text-dark">Регистрация</a>
                </button>
            `;
        }
    }
}

// Обновление hero секции для авторизованного пользователя
function updateHeroSection(userName) {
    const heroTitle = document.querySelector('.lending h1');
    const heroSubtitle = document.querySelector('.lending p');
    
    if (heroTitle && heroSubtitle) {
        heroTitle.textContent = `Добро пожаловать, ${userName}!`;
        heroSubtitle.textContent = 'Найдите идеальное снаряжение для ваших целей';
    }
}

// Показ профиля пользователя
function showProfile() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;
    
    // Создаем модальное окно профиля
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-person-circle me-2"></i>Профиль пользователя
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-sm-4"><strong>Имя:</strong></div>
                        <div class="col-sm-8">${user.name}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4"><strong>Email:</strong></div>
                        <div class="col-sm-8">${user.email}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4"><strong>Дата регистрации:</strong></div>
                        <div class="col-sm-8">${new Date(user.created_at).toLocaleDateString('ru-RU')}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    <button type="button" class="btn btn-primary">Редактировать профиль</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Удаляем модальное окно после закрытия
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// Функция выхода
async function logout() {
    try {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Отправляем запрос на logout
            await fetch('http://localhost:3000/api/auth/logout', {
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Показываем уведомление
        showNotification('Вы вышли из системы', 'info');
        
        // Обновляем интерфейс
        updateAuthInterface();
    }
}

// Функция для показа уведомлений (копия из sign.js)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Проверка токена при загрузке страницы
async function verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Обновляем данные пользователя
                localStorage.setItem('user', JSON.stringify(data.data.user));
                return true;
            }
        }
        
        // Токен недействителен
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
        
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        return false;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Проверяем токен
    await verifyToken();
    
    // Обновляем интерфейс
    updateAuthInterface();
});

// Экспортируем функции
window.MainAuth = {
    updateAuthInterface,
    showProfile,
    logout,
    verifyToken
};
