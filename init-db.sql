-- Инициализация базы данных для Docker Compose
-- Этот файл будет выполнен при первом запуске PostgreSQL контейнера

-- Создание таблиц согласно Prisma схеме
CREATE TABLE IF NOT EXISTS "Role" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Task" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

-- Связующая таблица для many-to-many отношения User-Role
CREATE TABLE IF NOT EXISTS "_RoleToUser" (
    "A" INTEGER NOT NULL REFERENCES "Role"(id) ON DELETE CASCADE,
    "B" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

-- Вставка ролей
INSERT INTO "Role" (name) VALUES 
('admin'),
('user')
ON CONFLICT (name) DO NOTHING;

-- Вставка тестовых пользователей (пароль: password123)
INSERT INTO "User" (username, email, password) VALUES 
('admin', 'admin@example.com', '$2b$10$rOzJKZkJxKxKxKxKxKxKxKx'),
('user1', 'user1@example.com', '$2b$10$rOzJKZkJxKxKxKxKxKxKxKx')
ON CONFLICT (username) DO NOTHING;

-- Назначение ролей пользователям
INSERT INTO "_RoleToUser" ("A", "B") VALUES 
((SELECT id FROM "Role" WHERE name = 'admin'), (SELECT id FROM "User" WHERE username = 'admin')),
((SELECT id FROM "Role" WHERE name = 'user'), (SELECT id FROM "User" WHERE username = 'user1'))
ON CONFLICT DO NOTHING;

-- Вставка тестовых задач
INSERT INTO "Task" (title, description, "userId") VALUES 
('Setup Docker environment', 'Configure Docker for development', (SELECT id FROM "User" WHERE username = 'admin')),
('Learn NestJS', 'Study NestJS framework basics', (SELECT id FROM "User" WHERE username = 'admin')),
('Complete user tasks', 'Finish assigned user tasks', (SELECT id FROM "User" WHERE username = 'user1'));