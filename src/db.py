import sqlite3
from handlers import *

"""
API for interfacing with the SQL database.
Error handling is the responsibility of the caller; no error handling
is encapsulated here.
"""
class DBInterface() :
    def __init__(self, path) :
        self.path = path
        self.conn = sqlite3.connect(self.path, check_same_thread=False)

        self.__create_db()
        self.conn.row_factory = sqlite3.Row

    def __create_db(self) -> None :
        with open('../db/schema.sql') as f:
            self.conn.executescript(f.read())
            self.__save_db()

    """
    Shorthand for fetching all items that match a query.
    """
    def __get_item(self, query) -> list :
        # Rust programmers should have no problem with the below line
        return self.conn.cursor().execute(query).fetchall()

    """
    Shorthand for executing a writeable query.
    """
    def __execute_query(self, query): 
        return self.conn.cursor().execute(query)
    
    """
    Shorthand for saving the database.
    """
    def __save_db(self) -> None : 
        self.conn.commit()

    ###################
    # User Methods
    ###################
    """
    Fetch a user by their id.
    - user_id: the id of the user to fetch.

    Returns: a singleton list of the user.
    """
    def get_user_one(self, user_id) -> list :
        query = f"SELECT * FROM users WHERE id = {user_id}"
        return self.__get_item(query)

    def user_register(self, username, password) -> None :
        query = f"INSERT INTO users (username, password) VALUES ('{username}', '{password}')"
        self.__execute_query(query)
        self.__save_db()

    def user_login(self, username, password) -> list :
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        return self.__get_item(query)

    ###################
    # Assignment Getters
    ###################

    """
    Fetch an assignment by its id.
    - user_id: the id of the user to get the assignment for.
    - assignment_id: the id of the assignment to fetch.

    Returns: a singleton list of the assignment.
    """
    def get_assignment_one(self, user_id, assignment_id) -> list :
        query = f"SELECT * FROM assignments \
            WHERE id = {assignment_id} \
            AND owner_id = {user_id} \
            " 
        return self.__get_item(query)

    """
    Fetch all assignments from the database.
    - user_id: the id of the user to get the assignments for.

    Returns: a list of all assignments.
    """
    def get_assignment_all(self, user_id) -> list : 
        query = f"SELECT * FROM assignments WHERE owner_id = {user_id}"
        return self.__get_item(query)
        
    """
    Fetch the most recently added assignment.
    - user_id: the id of the user to get the assignment for.

    Returns: a singleton list of the most recently added assignment.
    """
    def get_assignment_newest(self, user_id) -> list : 
        query = f" \
            SELECT * FROM assignments \
            WHERE id = (SELECT max(id) FROM assignments) \
            AND owner_id = {user_id} \
            \
        "
        return self.__get_item(query)

    """
    Fetch the assignments belonging to a class.
    - user_id: the id of the user to get the assignment for.
    - class_id: the id of the class to fetch assignments for.

    Returns: a list of assignments belonging to the class.
    """
    def get_assignment_for_class(self, user_id, class_id) -> list :
        query = f"SELECT * FROM assignments WHERE class_id = {class_id} \
            AND owner_id = {user_id} \
            "
        return self.__get_item(query)

    def get_assignment_date_range(self, user_id, start_date, end_date) -> list :
        query = f"SELECT * FROM assignments WHERE owner_id = {user_id} \
            AND date BETWEEN {start_date} AND {end_date}"
        return self.__get_item(query)

    ###################
    # Class Getters
    ###################

    """
    Fetch a class by its id.
    - user_id: the id of the user to fetch the class for.
    - class_id: the id of the class to fetch.

    Returns: a singleton list of the class.
    """
    def get_class_one(self, user_id, class_id) -> list : 
        query = f"SELECT * FROM classes \
            WHERE id = {class_id} \
            AND owner_id = {user_id} \
            "
        return self.__get_item(query)

    """
    Fetch all classes from the database.
    - user_id: the id of the user to fetch classes for.

    Returns: a list of all classes.
    """
    def get_class_all(self, user_id) -> list :
        query = f"SELECT * FROM classes where owner_id = {user_id}"
        return self.__get_item(query)

    """
    Fetch class for assignment by assignment id.
    - assignment_id: the id of the assignment whose class to fetch.

    Returns: a singleton list of the class containing the assignment.
    """
    def get_class_for_assignment(self, user_id, assignment_id) -> list :
        assignment = self.get_assignment_one(user_id, assignment_id)[0]
        query = f"SELECT * FROM classes WHERE (id, owner_id) = \
            ({assignment['class_id']}, {user_id}) \
            "
        return self.__get_item(query)

    ###################
    # Assignment Adders 
    ###################

    """
    Add a new assignment to the database.
    """
    def add_assignment(self, user_id, class_id, properties) -> None :
        properties['date'], properties['time'] = properties['date'].split('T')
        properties.update({'class_id': class_id})
        properties.update({'owner_id': user_id})
        query = f"INSERT INTO assignments {tuple(properties.keys())} \
            VALUES {tuple(properties.values())} \
            "
        self.__execute_query(query)
        self.__save_db()

    ###################
    # Class Adders 
    ###################

    """
    Add a new class to the database.
    """
    def add_class(self, user_id, properties) -> None : 
        properties.update({'owner_id': user_id})
        query = f"INSERT INTO classes {tuple(properties.keys())} \
            VALUES {tuple(properties.values())} \
            "
        self.__execute_query(query)
        self.__save_db()
        # query = f"INSERT INTO classes {tuple(kwargs.keys())} VALUES {tuple(kwargs.values())}"    
        # self.__execute_query(query)
        # self.__save_db()

    ###################
    # Assignment Modifiers
    ###################

    def modify_assignment_one(self, user_id, assignment_id, **kwargs) :
        if 'id' in kwargs.keys() and assignment_id != kwargs['id'] :
            raise ValueError("Cannot change assignment id.")
        # query = f"UPDATE assignments SET {tuple(kwargs.keys())} VALUES {tuple(kwargs.values())} WHERE id = {assignment_id} "
        query = f"UPDATE assignments {tuple(kwargs.keys())} \
            SET {tuple(kwargs.values())} \
            WHERE id = {assignment_id} \
            AND owner_id = {user_id} \
            "
        self.__execute_query(query)
        self.__save_db
    
    def modify_assignment_all(self, user_id, properties) -> None :
        # while True :
        for assignment in self.get_assignment_all(user_id) :
            query = f"UPDATE assignments SET "
            for property in properties.items() :
                property = list(property)
                if property[0] == 'time_remaining' :
                    date_str = f"{assignment['date']}T{assignment['time']}"
                    property[1] = f"'{calc_time_rem(date_str)}'"
                query += f"{property[0]} = {property[1]}, "
            query = f"{query[0:-2]} "
            query += f"WHERE id = {assignment['id']} AND owner_id = {user_id}"
            self.__execute_query(query)
        self.__save_db()

    ###################
    # Assignment Deleters
    ###################

    """
    Delete an assignment from the database.
    - assignment_id: the id of the assignment to delete.
    """
    def delete_assignment_one(self, user_id, assignment_id) -> None :
        query = f"DELETE FROM assignments WHERE id = {assignment_id} \
            AND owner_id = {user_id}"
        self.__execute_query(query)
        self.__save_db()

    """
    Delete all assignments from the database.
    """
    def delete_assignment_all(self, user_id) -> None :
        query = f"DELETE FROM assignments WHERE owner_id = {user_id}"
        self.__execute_query(query)
        self.__save_db()

    ###################
    # Class Deleters
    ###################
    
    """
    Delete a class from the database.
    ! Deleting a class deletes all its assignments !

    - class_id: the id of the class to delete.
    """
    def delete_class_one(self, user_id, class_id) -> None :
        query = f"DELETE FROM classes WHERE id = {class_id} \
            AND owner_id = {user_id}"
        self.__execute_query(query)
        self.__save_db()


    ###################
    #  Class Item Adders
    ###################
    
    def add_class_item(self, class_id, class_type, start_time, end_time, date, repeat_mode, repeat_days, repeat_end, prof_name, location, description):
        query = f"INSERT INTO class_items (class_id, class_type, start_time, end_time, date, repeat_mode, repeat_days, repeat_end, prof_name, location, description) VALUES ({class_id}, '{class_type}', '{start_time}', '{end_time}', '{date}', '{repeat_mode}', '{repeat_days}', '{repeat_end}', '{prof_name}', '{location}', '{description}')"
        self.__execute_query(query)
        self.__save_db()

    ###################
    #  Class Item Getters
    ###################
    
    def get_class_items(self, class_id):
        query = f"SELECT * FROM class_items WHERE class_id = {class_id}"
        return self.__get_item(query)

    def get_class_items_repeating(self, class_id):
        query = f"SELECT * FROM class_items WHERE class_id = {class_id} AND repeat_mode != 0"
        return self.__get_item(query)
    
    def get_class_items_between_dates(self, class_id, start_date, end_date):
        query = f"SELECT * FROM class_items WHERE class_id = {class_id} AND date BETWEEN '{start_date}' AND '{end_date}'"
        return self.__get_item(query)
    
    ###################
    #  Class Item Deleters
    ###################
    
    def delete_class_item_one(self, class_item_id):
        query = f"DELETE FROM class_items WHERE id = {class_item_id}"
        self.__execute_query(query)
        self.__save_db()

    def delete_class_item_all(self, class_id):
        query = f"DELETE FROM class_items WHERE class_id = {class_id}"
        self.__execute_query(query)
        self.__save_db()
        
    ###################
    #  Class Item Modifiers
    ###################
    
    def cut_repeating_class_item_at_date(self, class_item_id, date):
        query = f"UPDATE class_items SET repeat_end = '{date}' WHERE id = {class_item_id}"
        self.__execute_query(query)
        self.__save_db()
    
    """
    Nuke the database.
    """
    def delete_class_all(self, user_id) -> None :
        query = f"DELETE FROM classes WHERE owner_id = {user_id}"
        self.__execute_query(query)
        self.__save_db()

    ###################
    ##### Miscellaneous
    ###################
    """
    Execute a custom query
    """
    def execute_custom_query(self, query) -> None :
        self.__execute_query(query)
        self.__save_db()