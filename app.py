import sqlite3
from datetime import datetime
from time import sleep
from os import urandom
from flask import Flask, render_template, request, url_for, flash, redirect
from werkzeug.exceptions import abort

app = Flask(__name__)
app.config['SECRET_KEY'] = urandom(12)

# Initialize database
def get_db_conn() :
    conn = sqlite3.connect('db.db')
    conn.row_factory = sqlite3.Row
    return conn

# Assignments page
@app.route('/assignments')
def assignment_page() :
    conn = get_db_conn()
    assignments = conn.execute("SELECT * FROM assignments").fetchall()
    conn.close()
    return render_template('index.html', assignments=assignments)

# Individual assignment items
@app.route('/assignments/<int:assign_id>', methods=['GET', 'POST'])
def assignment(assign_id) :
    conn = get_db_conn()
    assignment = conn.execute('SELECT * FROM assignments WHERE id = ?', (assign_id,)).fetchone()
    if assignment :
        conn.execute("UPDATE assignments SET time_remaining = ? WHERE id = ?", (str(abs(datetime.now() - datetime.strptime(assignment['created'], '%Y-%m-%d %H:%M:%S'))), assign_id))
        conn.commit()
        conn.close()
    else :
        abort(404)
    return render_template('assignment_item.html', assignment=assignment)

# Individual class items
@app.route('/classes/<int:class_id>')
def cls(class_id) :
    conn = get_db_conn()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_id,)).fetchone()
    conn.close()
    if not cls :
        abort(404)
    return render_template('class_item.html', cls=cls)

# Individual test items
@app.route('/tests/<int:test_id>')
def test(test_id) :
    conn = get_db_conn()
    test = conn.execute('SELECT * FROM tests WHERE id = ?', (test_id,)).fetchone()
    conn.close()
    if not test :
        abort(404)
    return render_template('test_item.html', test=test)

# Homepage
@app.route('/')
def index() :
    conn = get_db_conn()
    assignments = conn.execute("SELECT * FROM assignments").fetchall()
    classes = conn.execute("SELECT * FROM classes").fetchall()
    tests = conn.execute("SELECT * FROM tests").fetchall()

    conn.executemany("UPDATE assignments SET time_remaining = ?", [(str(abs(datetime.now() - datetime.strptime(assignment['created'], '%Y-%m-%d %H:%M:%S'))), ) for assignment in assignments])
    conn.executemany("UPDATE assignments SET time_remaining = ?", [(str(abs(datetime.now() - datetime.strptime(cls['created'], '%Y-%m-%d %H:%M:%S'))), ) for cls in classes])
    conn.executemany("UPDATE assignments SET time_remaining = ?", [(str(abs(datetime.now() - datetime.strptime(test['created'], '%Y-%m-%d %H:%M:%S'))), ) for test in tests])
    conn.commit()
    conn.close()

    return render_template('index.html', assignments=assignments, classes=classes, tests=tests)

if __name__ == "__main__" :
    app.run(host ='0.0.0.0')