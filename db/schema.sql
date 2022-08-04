CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sub TEXT NOT NULL,
    item_type TEXT NOT NULL,
    a_name TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    notes TEXT,
    time_remaining TEXT,
    FOREIGN KEY (sub) REFERENCES classes(title)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classes (
    title TEXT PRIMARY_KEY,
    color TEXT,
    item_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    item_type TEXT NOT NULL,
    time_remaining DATE
);

