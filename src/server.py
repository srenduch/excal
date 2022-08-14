from os import urandom
from flask import Flask, render_template, request, Response
import threading
from http import HTTPStatus as status

from db import *
from handlers import *

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.config['SECRET_KEY'] = urandom(12)

db = DBInterface('../db/db.sqlite3')

# Jinja-scope globals
@app.context_processor
def jinja_globals() :
    assignments = db.get_assignment_all()
    classes = db.get_class_all()

    db.modify_assignment_all({
    'time_remaining': None
    })

    return {
        'assignments': assignments,
        'classes': classes,
        # 'tests': tests,
    }

# Assignments page
@app.route('/assignments/')
def assignment_page() :
    return render_template('index.html', subdir='assignments/'), status.OK

# Classes page
@app.route('/classes/')
def cls_page() :
    return render_template('index.html', subdir='classes/'), status.OK

# Individual class items
@app.route('/classes/<int:class_id>')
def cls(class_id) :
    cls = db.get_class_one(id=class_id)
    return render_template('item.html', cls=cls), status.OK

@app.route('/get-assignments', methods=['GET'])
def get_assignments() :
    assignments_list = []

    assignments_list = getattr(db, f"get_assignment_{request.args.get('selector')}")()
    
    html_str = ''
    for a in assignments_list :
        cls = db.get_class_for_assignment(a['id'])[0]
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
        html_str += f'color: {cls["color"]}";'
        html_str += f'>{cls["title"]} </h5>'
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
    class_list = getattr(db, f"get_class_{request.args.get('selector')}")()

    html_str = ''
    for cls in class_list :
        html_str += f"<option data-class-id={cls['id']} style=\"color: black;\" value=\"{cls['title']}\">{cls['title']}</option>\n"
    return html_str

# New assignment
@app.route('/new-assignment', methods=['POST'])
def new_assignment() :
    # if not(sub):
        # raise 

    # if not(a_name):
        # raise 

    keys = tuple([arg.split('arguments[0]')[1][1:-1] for arg in request.form.keys()])
    values = tuple(request.form.values())
    properties = dict(zip(keys, values))
    print(properties)
    
    # Custom assignment modifications
    properties['time_remaining'] = calc_time_rem(properties['date'])
    db.add_assignment(properties)
    
    return Response(properties, status=status.OK)
    
# New class
@app.route('/new-class', methods=['POST'])
def new_class() :
    keys = tuple([arg.split('arguments[0]')[1][1:-1] for arg in request.form.keys()])
    values = tuple(request.form.values())
    properties = dict(zip(keys, values))
    db.add_class(properties)
    
    return Response(status=status.OK)

# Delete
@app.route('/delete-assignment', methods=['POST'])
def delete_assignment(num_delete, assignment_id) :
    # item_id = request.form['id']
    getattr(db, f"delete_assignment{request.args.get('selector')}")(num_delete=num_delete, assignment_id=assignment_id)
    # db.delete_assignment_one(item_id)
  
    return Response(status=status.OK)

# Homepage
@app.route('/')
def index() :
    return render_template('index.html'), status.OK

# if __name__ == "__main__" :
    # app.jinja_env.auto_reload = True
    # app.config['TEMPLATES_AUTO_RELOAD'] = True
    # app.run(debug=True)
    # app.run()