from re import T
import sqlite3
from datetime import datetime
from math import floor
from handlers import *
from time import sleep

"""
API for interfacing with the SQL database.
Error handling is the responsibility of the caller; no error handling
is encapsulated here.
"""
class DBInterface() :
    def __init__(self, path) :
        self.path = path
        self.conn = sqlite3.connect(self.path, check_same_thread=False)
        # if len(self.get_class_all()) == 0 :

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
    # Assignment Getters
    ###################

    """
    Fetch an assignment by its id.
    - assignment_id: the id of the assignment to fetch.

    Returns: a singleton list of the assignment.
    """
    def get_assignment_one(self, assignment_id) -> list :
        query = f"SELECT * FROM assignments WHERE id = {assignment_id}"
        return self.__get_item(query)

    """
    Fetch all assignments from the database.

    Returns: a list of all assignments.
    """
    def get_assignment_all(self) -> list : 
        query = f"SELECT * FROM assignments"
        return self.__get_item(query)
        
    """
    Fetch the most recently added assignment.

    Returns: a singleton list of the most recently added assignment.
    """
    def get_assignment_newest(self) -> list : 
        query = " \
            SELECT * FROM assignments \
            WHERE id = (SELECT max(id) FROM assignments) \
            \
        "
        return self.__get_item(query)

    """
    Fetch the assignments belonging to a class.
    - class_id: the id of the class to fetch assignments for.

    Returns: a list of assignments belonging to the class.
    """
    def get_assignment_for_class(self, class_id) -> list :
        query = f"SELECT * FROM assignments WHERE owner_class_id = {class_id}"
        return self.__get_item(query)

    ###################
    # Class Getters
    ###################

    """
    Fetch a class by its id.
    - class_id: the id of the class to fetch.

    Returns: a singleton list of the class.
    """
    def get_class_one(self, class_id) -> list : 
        query = f"SELECT * FROM classes WHERE id = {class_id}"
        return self.__get_item(query)

    """
    Fetch all classes from the database.

    Returns: a list of all classes.
    """
    def get_class_all(self) -> list :
        query = f"SELECT * FROM classes"
        return self.__get_item(query)

    """
    Fetch class for assignment by assignment id.
    - assignment_id: the id of the assignment whose class to fetch.

    Returns: a singleton list of the class containing the assignment.
    """
    def get_class_for_assignment(self, assignment_id) -> list :
        query = f"SELECT * FROM classes WHERE classes.id = {assignment_id}"
        return self.__get_item(query)

    ###################
    # Assignment Adders 
    ###################

    """
    Add a new assignment to the database.
    """
    def add_assignment(self, **kwargs) -> None :
        query = f"INSERT INTO assignments {tuple(kwargs.keys())} VALUES {tuple(kwargs.values())}"
        self.__execute_query(query)
        self.__save_db()

    ###################
    # Class Adders 
    ###################

    """
    Add a new class to the database.
    """
    def add_class(self, **kwargs) -> None : 
        query = f"INSERT INTO classes {tuple(kwargs.keys())} VALUES {tuple(kwargs.values())}"    
        self.__execute_query(query)
        self.__save_db()

    ###################
    # Assignment Modifiers
    ###################

    def modify_assignment_properties(self, assignment_id, **kwargs) :
        if 'id' in kwargs.keys() and assignment_id != kwargs['id'] :
            raise ValueError("Cannot change assignment id.")
        query = f"UPDATE assignments SET {tuple(kwargs.keys())} VALUES {tuple(kwargs.values())}\
            WHERE id = {assignment_id} \
            "
        query = f"UPDATE assignments {tuple(kwargs.keys())} SET {tuple(kwargs.values())} WHERE id = {assignment_id}"
        self.__execute_query(query)
    
    def update_assignment_all_time_remaining(self) -> None :
        # while True :
        for assignment in self.get_assignment_all() :
            time_remaining = calc_time_rem(f"{assignment['date']} {assignment['time']}")
            if int(time_remaining.split(':')[0]) : 
                self.delete_assignment_one(assignment['id'])
            else :
                # print(time_remaining)
                # print(time_remaining, assignment['id'])

                # query = f"UPDATE assignments SET time_remaining = ? WHERE id = ?", (time_remaining, assignment['id'])

                query = f"UPDATE assignments SET time_remaining = '{time_remaining}' WHERE id = {assignment['id']}"
                
                print(query)
                # print(self.get_assignment_one(assignment['id'])[0]['time_remaining'])
                self.__execute_query(query)
            
        self.__save_db()

    ###################
    # Assignment Deleters
    ###################

    """
    Delete an assignment from the database.
    - assignment_id: the id of the assignment to delete.
    """
    def delete_assignment_one(self, assignment_id) -> None :
        query = f"DELETE FROM assignments WHERE id = {assignment_id}"
        self.__execute_query(query)
        self.__save_db()

    """
    Delete all assignments from the database.
    """
    def delete_assignment_all(self) -> None :
        query = f"DELETE FROM assignments"
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
    def delete_class_one(self, class_id) -> None :
        query = f"DELETE FROM classes WHERE id = {class_id}"
        self.__execute_query(query)
        self.__save_db()

    """
    Nuke the database.
    """
    def delete_class_all(self) -> None :
        query = f"DELETE FROM classes"
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