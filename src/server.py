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

@app.route('/get-classes', methods=['GET'])
def get_classes() :
    conn = get_db_conn()
    class_list = conn.execute('SELECT classes.title FROM classes').fetchall()
    conn.close()

    html_str = ''
    for cls in class_list :
        html_str += f"<option style=\"color: black;\" value=\"{cls['title']}\">{cls['title']}</option>\n"
    return html_str

# New
@app.route('/new-class', methods=['POST'])
def new_class() :
    title = request.form['title']
    item_type = request.form['item_type']
    color = request.form['color']
    notes = request.form['notes']

    if not title :
        return 'title_error'

    conn = get_db_conn()
    conn.execute('INSERT INTO classes (title, color, item_type, notes) \
                        VALUES (?, ?, ?, ?)', \
                        (title, color, item_type, notes))
    conn.commit()
    conn.close()
    
    return 'success'

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

# Homepage
@app.route('/')
def index() :
    conn = get_db_conn()
    query = "\
        SELECT classes.title, assignments.a_name, classes.color, \
            assignments.time_remaining, assignments.item_type, \
            assignments.date, assignments.time, assignments.id\n \
        FROM classes, assignments\n\
        WHERE classes.title = assignments.sub\n\
        "
    items = conn.execute(query).fetchall()
    conn.close()

    return render_template('index.html', items=items)

if __name__ == "__main__" :
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)