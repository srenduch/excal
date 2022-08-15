CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password VARCHAR(64) NOT NULL, /* hash password */ 
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    a_name TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    notes TEXT,
    time_remaining TEXT,
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    color TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    item_type TEXT NOT NULL,
    time_remaining DATE,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);