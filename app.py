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
@app.route('/assignments/')
def assignment_page() :
    conn = get_db_conn()
    assignments = conn.execute("SELECT * FROM assignments").fetchall()
    conn.close()
    return render_template('index.html', subdir='assignments/', assignments=assignments, classes=None, tests=None)

# Classes page
@app.route('/classes/')
def cls_page() :
    conn = get_db_conn()
    classes = conn.execute("SELECT * FROM classes").fetchall()
    conn.close()
    return render_template('index.html', subdir='classes/', assignments=None, classes=classes, tests=None)

# Tests page
@app.route('/tests/')
def test_page() :
    conn = get_db_conn()
    tests = conn.execute("SELECT * FROM tests").fetchall()
    conn.close()
    return render_template('index.html', subdir='tests/', assignments=None, classes=None, tests=tests)

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
    return render_template('item.html', assignment=assignment, cls=None, test=None)

# Individual class items
@app.route('/classes/<int:class_id>')
def cls(class_id) :
    conn = get_db_conn()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_id,)).fetchone()
    conn.close()
    if not cls :
        abort(404)
    return render_template('item.html', cls=cls)

# Individual test items
@app.route('/tests/<int:test_id>')
def test(test_id) :
    conn = get_db_conn()
    test = conn.execute('SELECT * FROM tests WHERE id = ?', (test_id,)).fetchone()
    conn.close()
    if not test :
        abort(404)
    return render_template('item.html', test=test)

# New
@app.route('/new/', methods=['GET', 'POST'])
def new() :
    if request.method == 'POST' :
        item_type = request.form['item_type']
        title = request.form['title']
        color = request.form['color']
        content = request.form['content']
        date = request.form['date'] 
        time = request.form['time']
        notes = request.form['notes']
        time_remaining = datetime.strptime(f"{request.form['date']} {request.form['time']}" , '%Y-%m-%d %H:%M') - datetime.now()
        time_remaining = (datetime.min + time_remaining)
        time_remaining = f"{time_remaining.day:02d}:{time_remaining.hour:02d}:{time_remaining.minute:02d}:{time_remaining.second:02d}"

        if not title :
            flash('Could not create item, title is empty', 'danger')
        else :
            conn = get_db_conn()
            conn.execute("INSERT INTO assignments (item_type, title, color, content, date, time, notes, time_remaining) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (item_type, title, color, content, date, time, notes, time_remaining))
            conn.commit()
            conn.close()
            flash(f'Item with title \'{title}\' created', 'success')
            
            return redirect(url_for('new'))

    today = datetime.now().strftime('%Y-%m-%d')
    return render_template('modify.html', today=today)

# Homepage
@app.route('/')
def index() :
    conn = get_db_conn()
    assignments = conn.execute("SELECT * FROM assignments").fetchall()
    classes = conn.execute("SELECT * FROM classes").fetchall()
    tests = conn.execute("SELECT * FROM tests").fetchall()

    for assignment in assignments :
        time_remaining = datetime.strptime(f"{assignment['date']} {assignment['time']}" , '%Y-%m-%d %H:%M') - datetime.now()
        time_remaining = (datetime.min + time_remaining)
        time_remaining = f"{time_remaining.day:02d}:{time_remaining.hour:02d}:{time_remaining.minute:02d}:{time_remaining.second:02d}"
        print(time_remaining)
        conn.execute("UPDATE assignments SET time_remaining = ? WHERE id = ?", (time_remaining, assignment['id']))
    conn.commit()
    conn.close()

    return render_template('index.html', assignments=assignments, classes=None, tests=None)

if __name__ == "__main__" :
    app.run(debug=True, host ='0.0.0.0')