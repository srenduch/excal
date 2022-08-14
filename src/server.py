from datetime import datetime
from os import urandom
from flask import Flask, render_template, request, url_for, flash, redirect, jsonify

from db import *
from handlers import *

from hashlib import sha256


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
        #print(time_remaining.split(':')[0])
        if int(time_remaining.split(':')[0]) < 0: 
            conn.execute('DELETE FROM assignments WHERE assignment_id = ?', (assignment['assignment_id'],))
        else :
            conn.execute("UPDATE assignments SET time_remaining = ? WHERE assignment_id = ?", (time_remaining, assignment['assignment_id']))

    conn.commit()
    conn.close()

    return {
        'assignments': assignments,
        'classes': classes,
        'tests': tests,
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
@app.route('/classes/<path:class_title>')
def cls(class_title) :
    conn = get_db_conn()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_title,)).fetchone()
    conn.close()
    return render_template('item.html', cls=cls)

@app.route('/get-assignments', methods=['GET'])
def get_assignments() :
    user_id = request.args.get('user_id')
    query = ''
    if request.args.get('num_refresh') == '1' :
        query = "\
        SELECT assignments.*, classes.color, classes.title \
        FROM assignments \
        JOIN classes ON assignments.class_id = classes.id \
        JOIN (SELECT max(assignments.assignment_id) AS max_id FROM assignments )  \
        ON assignments.assignment_id = max_id \
        WHERE classes.owner_id = ? \
        "
    else :
        query = " \
        SELECT assignments.*, classes.color, classes.title \
        FROM assignments \
        JOIN classes ON assignments.class_id = classes.id \
        WHERE classes.owner_id = ? \
        "
    
    conn = get_db_conn()
    assignments_list = conn.execute(query, (user_id,)).fetchall()

    html_str = ''
    for a in assignments_list :
        html_str+=f'<div class="item slide" id="assignment_{a["assignment_id"]}">'
        html_str += f'<div class="display-container top">'
        html_str += f'<h3>{a["a_name"]}</h3>'
        html_str += "<div>"
        html_str += '<button class="item-btn" id="edit"></button>'
        html_str += f'<button type="button" data-id="{a["assignment_id"]}" data-name="{a["a_name"]}" class="item-btn" data-toggle="modal" data-target="#deleteModal" id="delete"></button>'
        html_str += "</div>"
        html_str += "</div>"
        html_str += '<div class="display-container">'
        html_str += '<h5 style="'
        html_str += f'color: {a["color"]}";'
        html_str += f'>{a["title"]} </h5>'
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
    user_id = request.args.get('user_id')
    class_list = conn.execute('SELECT title FROM classes WHERE owner_id = ?', (user_id,)).fetchall()
    conn.close()

    html_str = ''
    for cls in class_list :
        html_str += f"<option style=\"color: black;\" value=\"{cls['title']}\">{cls['title']}</option>\n"
    
    return html_str

# New assignment
@app.route('/new-assignment', methods=['POST'])
def new_assignment() :
    class_name = request.form['class']
    item_type = request.form['item_type']
    a_name = request.form['a_name']
    content = request.form['content']
    date = request.form['date']
    user_id = request.form['user_id']
    date, time = date.split('T')
    time_remaining = calc_time_rem(f"{date} {time}")

    if not(class_name):
        return 'error class'

    if not(a_name):
        return 'error a_name'
    
    if not (user_id):
        return 'error user_id'

    conn = get_db_conn()
    # Get class id from class name and user id
    class_id = conn.execute('SELECT id FROM classes WHERE title = ? AND owner_id = ?', (class_name, user_id)).fetchone()['id']  
    
    conn.execute('INSERT INTO assignments (class_id, item_type, a_name, content, date, time, time_remaining) VALUES (?, ?, ?, ?, ?, ?, ?)', (class_id, item_type, a_name, content, date, time, time_remaining))
    conn.commit()
    conn.close()
    
    return 'success'

# New class
@app.route('/new-class', methods=['POST'])
def new_class() :
    title = request.form['title'] # class title
    item_type = request.form['item_type'] # class type even though it's always type 'class' potat moment
    color = request.form['color'] # class color for display
    notes = request.form['notes'] # class notes
    user_id = request.form['user_id'] # id of the user who has the class

    if not title :
        return 'title_error'

    if not user_id:
        return 'user_id_error'

    conn = get_db_conn()
    # make sure class doesn't already exist for the user
    if conn.execute('SELECT * FROM classes WHERE title = ? AND owner_id = ?', (title, user_id)).fetchone() :
        return 'duplicate'
    

    conn.execute('INSERT INTO classes (title, color, item_type, notes, owner_id) \
                        VALUES (?, ?, ?, ?, ?)', \
                        (title, color, item_type, notes, user_id))
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
        conn.execute('DELETE FROM assignments WHERE assignment_id = ?', (item_id,))
        conn.commit()
        conn.close()
    
    return "success"

# Homepage
@app.route('/')
def index() :
    return render_template('index.html')

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
        
        conn = get_db_conn()
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        conn.commit()
        
        conn.close()
        #flash('User created successfully')
        return 'success'
    else:
        return render_template('register.html')

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
        
        conn = get_db_conn()
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()

        if not user :
            #flash('Invalid username or password', 'danger')
            return 'username_error'
        if user['password'] != password :
            #flash('Invalid username or password', 'danger')
            return 'password_error'
        
        #flash('You were successfully logged in', 'success')
        return 'success' + str(user['id'])
    else:
        return render_template('login.html')

@app.route('/logout')
def logout() :
    return render_template('logout.html')


@app.route('/get-assignments-between-dates')
def get_assignments_between_dates() :
    conn = get_db_conn()
    user_id = request.args.get('user_id')
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    # add quotes to start and end date
    start_date = f"'{start_date}'"
    end_date = f"'{end_date}'"
    
    
    # get assignments (and the corresponding class color) between start and end date 
    assignments = conn.execute(f'\
            SELECT assignments.*, color FROM assignments \
            JOIN classes ON assignments.class_id = classes.id \
            WHERE date BETWEEN {start_date} AND {end_date}').fetchall()
    
    
    assignments = [dict(row) for row in assignments]
    
    
    conn.close()
    
    return jsonify(assignments)


# if __name__ == "__main__" :
    # app.jinja_env.auto_reload = True
    # app.config['TEMPLATES_AUTO_RELOAD'] = True
    # app.run(debug=True)
    # app.run()