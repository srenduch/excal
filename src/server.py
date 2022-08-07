from datetime import datetime
from os import urandom
from flask import Flask, render_template, request, url_for, flash, redirect

from db import *
from handlers import *


app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.config['SECRET_KEY'] = urandom(12)

# Jinja-scope globals
@app.context_processor
def jinja_globals() :
    conn = get_db_conn()
    assignments = conn.execute('SELECT * FROM assignments').fetchall()
    classes = conn.execute('SELECT * FROM classes').fetchall()
    tests = conn.execute('SELECT * FROM tests').fetchall()

    for assignment in assignments :
        time_remaining = calc_time_rem(f"{assignment['date']} {assignment['time']}")
        if int(time_remaining.split(':')[0]) < 0 : 
            conn.execute('DELETE FROM assignments WHERE id = ?', (assignment['id'],))
        else :
            conn.execute("UPDATE assignments SET time_remaining = ? WHERE id = ?", (time_remaining, assignment['id']))

    conn.commit()
    conn.close()

    return {
        'assignments': assignments,
        'classes': classes,
        'tests': tests,
    }

@app.route('/background_process_test')
def background_process_test() : 
    pass

def get_class(cls_title) :
    conn = get_db_conn()
    sub = conn.execute('SELECT * FROM classes WHERE title = ?', (cls_title,)).fetchone()
    conn.close()
    return sub

# Assignments page
@app.route('/assignments/')
def assignment_page() :
    return render_template('index.html', subdir='assignments/')

# Classes page
@app.route('/classes/')
def cls_page() :
    return render_template('index.html', subdir='classes/')

# Individual class items
@app.route('/classes/<path:class_title>')
def cls(class_title) :
    conn = get_db_conn()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_title,)).fetchone()
    conn.close()
    return render_template('item.html', cls=cls)

# New
@app.route('/new/', methods=['GET', 'POST'])
def new() :
    if request.method == 'POST' :
        item_type = request.form['item_type']
        title = request.form['name']
        color = request.form['color']
        content = request.form['content']
        date = request.form['date'] 
        time = request.form['time']
        notes = request.form['notes']

        time_remaining = calc_time_rem(f"{request.form['date']} {request.form['time']}")

        try :
            cls = request.form['sub']
        except :
            cls = 'Unfiled'
            color = '#ffffff'
            conn = get_db_conn()
            conn.execute('INSERT INTO classes (title, color, item_type) \
                        VALUES (?, ?, ?)', \
                        ('Unfiled', color, 'Class'))
            flash(f"No classes detected: {cls} created")
            conn.commit()
            conn.close()

        if not (title) :
            flash('Could not create item, title is empty', 'danger')
        else :
            conn = get_db_conn()
            conn.execute("INSERT INTO assignments (sub, item_type, a_name, \
                        content, date, time, notes, time_remaining) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                        (cls, item_type, title, content, date, time, notes, time_remaining))
            conn.commit()
            conn.close()
            flash(f'Item {cls}.{title} created', 'success')
            
            return redirect(url_for('new'))

    today = datetime.now().strftime('%Y-%m-%d')
    return render_template('modify.html', today=today)

# Homepage
@app.route('/')
def index() :
    conn = get_db_conn()
    query = "\
        SELECT classes.title, assignments.a_name, classes.color, \
            assignments.time_remaining, assignments.item_type, \
            assignments.date, assignments.time\n \
        FROM classes, assignments\n\
        WHERE classes.title = assignments.sub\n\
        "
    items = conn.execute(query).fetchall()
    conn.close()

    return render_template('index.html', items=items)

# Delete
@app.route('/delete', methods=['POST'])
def delete() :
    item_type = request.form['type']
    item_id = request.form['id']
    
    if item_type == "assignment" :

        conn = get_db_conn()
        conn.execute('DELETE FROM assignments WHERE id = ?', (item_id,))
        conn.commit()
        conn.close()
    

    return "success"

if __name__ == "__main__" :
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)