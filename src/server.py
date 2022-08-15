from ast import arguments
from os import urandom
from urllib import response
from flask import Flask, render_template, request, Response
from http import HTTPStatus as status
import json

from db import *
from handlers import *

from hashlib import sha256

db = DBInterface('../db/db.sqlite3')

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.config['SECRET_KEY'] = urandom(12)

# Jinja-scope globals
# @app.context_processor
def jinja_globals() :
    # Need to figure out a way to get the user's id here.
    user_id = 1
    db.modify_assignment_all(user_id, {
        'time_remaining': None
    })

    assignments = db.get_assignment_all()
    classes = db.get_class_all()

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
    user_id = request.args.get('user_id')
    assignments_list = []
    assignments_list = getattr(db, f"get_assignment_{request.args.get('selector')}")(user_id)
    
    html_str = ''
    for a in assignments_list :
        cls = db.get_class_for_assignment(user_id, a['id'])[0]
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
        html_str += '<h5>&nbsp;|&nbsp;</h5>'
        html_str += f'<h5>Assignment</h5>'
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
    user_id = request.args.get('user_id')
    class_list = getattr(db, f"get_class_{request.args.get('selector')}")(user_id)

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

    user_id = request.form.get('user_id')
    class_id = request.form.get('class_id')
    keys = tuple([arg.split('arguments[0]')[1][1:-1] for arg in list(request.form.keys())[2:]])
    values = tuple(list(request.form.values())[2:])
    properties = dict(zip(keys, values))
    
    # Custom assignment modifications
    properties['time_remaining'] = calc_time_rem(f"{properties['date']}")
    # cls = 
    db.add_assignment(user_id, class_id, properties)
    
    return Response(properties, status=status.OK)
    
# New class
@app.route('/new-class', methods=['POST'])
def new_class() :
    user_id = request.form.get('user_id')
    keys = tuple([arg.split('arguments[0]')[1][1:-1] for arg in list(request.form.keys())[1:]])
    values = tuple(list(request.form.values())[1:])
    properties = dict(zip(keys, values))
    db.add_class(user_id, properties)
    
    return Response(status=status.OK)

# Delete
@app.route('/delete-assignment', methods=['POST'])
def delete_assignment() :
    user_id = request.form.get('user_id')
    selector = request.form.get('selector')
    assignment_id = request.form.get('assignment_id')
    getattr(db, f"delete_assignment_{selector}")(user_id, assignment_id)
  
    return Response(status=status.OK)

# Homepage
@app.route('/')
def index() :
    return render_template('/index.html'), status.OK

@app.route('/register', methods=['POST', 'GET'])
def create_user() :
    if request.method == 'POST' :
        username = request.form['username']
        password = request.form['password']
        password = sha256(password.encode()).hexdigest() # inb4 MITM attacks 
        
        if not username :
            #flash('Username is required')
            return 'username_error'
        if not password :
            #flash('Password is required')
            return 'password_error'
        
        db.user_register(username, password)
        user = db.user_login(username, password)[0]
        #flash('User created successfully')
        return Response(response=json.dumps(user['id']), status=status.OK)
    else:
        return render_template('/register.html')

@app.route('/login', methods=['POST', 'GET'])
def login() :
    if request.method == 'POST' :
        username = request.form['username']
        password = request.form['password']
        password = sha256(password.encode()).hexdigest() # inb4 MITM attacks

        if not username :
            return 'username_error'
        if not password :
            return 'password_error'
        
        user = db.user_login(username, password)[0]

        if not user :
            #flash('Invalid username or password', 'danger')
            return 'username_error'
        if user['password'] != password :
            #flash('Invalid username or password', 'danger')
            return 'password_error'
        
        #flash('You were successfully logged in', 'success')
        return Response(response=json.dumps(user['id']), status=status.OK)
    else:
        return render_template('login.html')

@app.route('/logout')
def logout() :
    return render_template('logout.html')


@app.route('/get-assignments-between-dates')
def get_assignments_between_dates() :
    # conn = get_db_conn()
    user_id = request.args.get('user_id')
    start_date = f"'{request.args.get('start')}'"
    end_date = f"'{request.args.get('end')}'"

    assignments = db.get_assignment_date_range(user_id, start_date, end_date)
    assignments = [dict(zip(tuple(a.keys()), tuple(a))) for a in assignments]
    for i in range(len(assignments)) :
        cl = db.get_class_one(user_id=user_id, class_id=assignments[i]['class_id'])[0]
        assignments[i]['color'] = cl['color']
    return Response(json.dumps(assignments), status=status.OK)


# if __name__ == "__main__" :
    # app.jinja_env.auto_reload = True
    # app.config['TEMPLATES_AUTO_RELOAD'] = True
    # app.run(debug=True)
    # app.run()