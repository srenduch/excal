from datetime import datetime
from os import urandom
from flask import Flask, render_template, request, url_for, flash, redirect
import threading

from db import *
from handlers import *

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.config['SECRET_KEY'] = urandom(12)

db = DBInterface('../db/db.sqlite3')

# threading.Thread(target=db.update_assignment_all_time_remaining, daemon=True).start()

# Jinja-scope globals
@app.context_processor
def jinja_globals() :
    assignments = db.get_assignment_all()
    classes = db.get_class_all()

    db.update_assignment_all_time_remaining()

    return {
        'assignments': assignments,
        'classes': classes,
        # 'tests': tests,
    }

# Assignments page
@app.route('/assignments/')
def assignment_page() :
    return render_template('index.html', subdir='assignments/')

# Classes page
@app.route('/classes/')
def cls_page() :
    return render_template('index.html', subdir='classes/')

# Individual class items
@app.route('/classes/<int:class_id>')
def cls(class_id) :
    cls = db.get_class_one(class_id)
    return render_template('item.html', cls=cls)

@app.route('/get-assignments', methods=['GET'])
def get_assignments() :
    assignments_list = []
    if request.args.get('num_refresh') == '1' :
        assignments_list = db.get_assignment_newest()
    else :
        assignments_list = db.get_assignment_all()
        
    html_str = ''
    for a in assignments_list :
        color = db.get_class_for_assignment(a['id'])[0]['color']
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
        html_str += f'color: {color}";'
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
    class_list = db.get_class_all()

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

    if not(sub):
        return 'error sub'

    if not(a_name):
        return 'error a_name'

    db.add_assignment(
        sub=sub,
        item_type=item_type,
        a_name=a_name,
        content=content,
        date=date,
        time=time,
        time_remaining=time_remaining,
    )
    
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

    db.add_class(
        title=title,
        item_type=item_type,
        color=color,
        notes=notes,
    )
    
    return 'success'

# Delete
@app.route('/delete', methods=['POST'])
def delete() :
    item_type = request.form['type']
    item_id = request.form['id']
    
    if item_type == "assignment" :
        db.delete_assignment_one(item_id)
    
    return "success"

# Homepage
@app.route('/')
def index() :
    return render_template('index.html')

# if __name__ == "__main__" :
    # app.jinja_env.auto_reload = True
    # app.config['TEMPLATES_AUTO_RELOAD'] = True
    # app.run(debug=True)
    # app.run()