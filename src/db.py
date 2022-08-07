import sqlite3

# Initialize database
def get_db_conn() :
    conn = sqlite3.connect('db.db')
    conn.row_factory = sqlite3.Row
    return conn
