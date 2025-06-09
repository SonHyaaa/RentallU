const bcrypt = require('bcryptjs');
const database = require('../config/database');

class User {
    constructor(id, name, email, password, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Создание нового пользователя
    static async create(name, email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                // Хешируем пароль
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                const db = database.getDb();
                const query = `
                    INSERT INTO users (name, email, password, created_at, updated_at)
                    VALUES (?, ?, ?, datetime('now'), datetime('now'))
                `;

                db.run(query, [name, email, hashedPassword], function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            reject(new Error('Пользователь с таким email уже существует'));
                        } else {
                            reject(err);
                        }
                    } else {
                        // Возвращаем созданного пользователя без пароля
                        User.findById(this.lastID).then(user => {
                            resolve(user);
                        }).catch(reject);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Поиск пользователя по email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const db = database.getDb();
            const query = 'SELECT * FROM users WHERE email = ?';

            db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    const user = new User(
                        row.id,
                        row.name,
                        row.email,
                        row.password,
                        row.created_at,
                        row.updated_at
                    );
                    resolve(user);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Поиск пользователя по ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const db = database.getDb();
            const query = 'SELECT * FROM users WHERE id = ?';

            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    const user = new User(
                        row.id,
                        row.name,
                        row.email,
                        row.password,
                        row.created_at,
                        row.updated_at
                    );
                    resolve(user);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Проверка пароля
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Возвращаем пользователя без пароля для ответа клиенту
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    // Получение всех пользователей (для админки в будущем)
    static async findAll() {
        return new Promise((resolve, reject) => {
            const db = database.getDb();
            const query = 'SELECT * FROM users ORDER BY created_at DESC';

            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const users = rows.map(row => new User(
                        row.id,
                        row.name,
                        row.email,
                        row.password,
                        row.created_at,
                        row.updated_at
                    ));
                    resolve(users);
                }
            });
        });
    }
}

module.exports = User;
