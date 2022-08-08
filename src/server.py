from cgitb import html
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
        if int(time_remaining.split(':')[0]) : 
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

@app.route('/get-assignments', methods=['GET'])
def get_assignments() :
    query = ''
    if request.args.get('num_refresh') == '1' :
        query = "\
        SELECT assignments.id, assignments.a_name, assignments.sub \
        , assignments.item_type, assignments.date, assignments.time, \
        assignments.time_remaining, classes.color \
        FROM assignments, classes \
        WHERE classes.title = assignments.sub AND assignments.id=(SELECT max(id) FROM assignments) \
        "
    else :
        query = " \
        SELECT assignments.id, assignments.a_name, assignments.sub \
        , assignments.item_type, assignments.date, assignments.time, \
        assignments.time_remaining, classes.color \
        FROM assignments, classes \
        WHERE classes.title = assignments.sub \
        "
    
    conn = get_db_conn()
    assignments_list = conn.execute(query).fetchall()

    html_str = ''
    for a in assignments_list :
        html_str+=f'<div class="item slide" id="assignment_{a["id"]}">'
        html_str += f'<div class="display-container top">'
        html_str += f'<h3>{a["a_name"]}</h3>'
        html_str += "<div>"
        html_str += '<button class="item-btn" id="edit"></button>'
        html_str += f'<button type="button" data-id="{a["id"]}" data-name="{a["a_name"]}" class="item-btn" data-toggle="modal" data-target="#deleteModal" id="delete"></button>'
        html_str += "</div>"
        html_str += "</div>"
        html_str += '<div class="display-container">'
        html_str += '<h5 style="'
        html_str += f'color: {a["color"]}";'
        html_str += f'>{a["sub"]} </h5>'
        html_str += '<h5>&nbsp;|&nbsp;</h5>'
        html_str += f'<h5> {a["item_type"] }</h5>'
        html_str += '</div>'
        html_str += f'<span>Due in </span>'
        if int(a['time_remaining'].split(':')[0]) <= 2 :
            html_str += f'<span class="urgent">{a["time_remaining"]} </span>'
        else :
            html_str += f'<span>{a["time_remaining"]} </span>'
        html_str += f'at {a["date"] } {a["time"]}</span>'
        html_str += '</div>'

    return html_str


@app.route('/get-classes', methods=['GET'])
def get_classes() :
    conn = get_db_conn()
    class_list = conn.execute('SELECT title FROM classes').fetchall()
    conn.close()

    html_str = ''
    for cls in class_list :
        html_str += f"<option style=\"color: black;\" value=\"{cls['title']}\">{cls['title']}</option>\n"
    return html_str

# New assignment
@app.route('/new-assignment', methods=['POST'])
def new_assignment() :
    sub = request.form['sub']
    item_type = request.form['item_type']
    a_name = request.form['a_name']
    content = request.form['content']
    date = request.form['date']
    date, time = date.split('T')
    time_remaining = calc_time_rem(f"{date} {time}")

    if not(sub) or not(a_name) :
        return 'error'

    conn = get_db_conn()
    conn.execute('INSERT INTO assignments (sub, item_type, a_name, content, date, time, time_remaining) VALUES (?, ?, ?, ?, ?, ?, ?)', (sub, item_type, a_name, content, date, time, time_remaining))
    conn.commit()
    conn.close()
    
    return 'success'

# New class
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
    return render_template('index.html')

if __name__ == "__main__" :
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)