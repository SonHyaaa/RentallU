const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    // Подключение к базе данных
    connect() {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(__dirname, '../../database.sqlite');
            
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Ошибка подключения к базе данных:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Подключение к SQLite базе данных успешно');
                    this.createTables();
                    resolve(this.db);
                }
            });
        });
    }

    // Создание таблиц
    createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createUsersTable, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы users:', err.message);
            } else {
                console.log('✅ Таблица users создана или уже существует');
            }
        });
    }

    // Получение экземпляра базы данных
    getDb() {
        return this.db;
    }

    // Закрытие соединения
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Ошибка закрытия базы данных:', err.message);
                } else {
                    console.log('🔒 Соединение с базой данных закрыто');
                }
            });
        }
    }
}

// Экспортируем единственный экземпляр
const database = new Database();
module.exports = database;
