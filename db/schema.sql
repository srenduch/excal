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

CREATE TABLE IF NOT EXISTS class_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    start_time VARCHAR(5) NOT NULL, /* HH:MM fuck seconds*/
    end_time VARCHAR(5) NOT NULL,
    date DATE NOT NULL,
    repeat_mode TINYINT NOT NULL, /* 
        sets the repeat mode for the class item
        0 = no repeat
        1 = daily
        2 = weekly
        3 = monthly
        4 = custom number of days (set in repeatdays)
    */
    repeat_days INTEGER, /* 
        sets the number of days to repeat the class item
        if repeatmode is 4
    */

    repeat_end DATE, /* 
        sets the end date for the class item
        if repeatmode is not 0
    */

    prof_name TEXT NOT NULL,

    type TEXT NOT NULL,

    location TEXT NOT NULL,

    description TEXT NOT NULL,

    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS class_item_exclude (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_item_id INTEGER NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (class_item_id) REFERENCES class_item(id)
    ON DELETE CASCADE
)

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