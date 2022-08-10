CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    a_name TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    notes TEXT,
    time_remaining TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT, /* two classes can have the same name between two users so we cant have it as primary key*/
    color TEXT NOT NULL,
    item_type TEXT NOT NULL,
    notes TEXT,
    owner_id INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    item_type TEXT NOT NULL,
    time_remaining DATE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL, /* hash password */ 
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
