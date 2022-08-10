import sqlite3

conn = sqlite3.connect('db.db')

with open('db/schema.sql') as f:
    conn.executescript(f.read())

conn.close()