import mysql.connector
from mysql.connector import Error

def create_connection():
    """ Create a database connection to a MySQL database """
    connection = None
    try:
        connection = mysql.connector.connect(
            host='34.47.168.249',        # Replace with your host
            user='root',             # MySQL username
            password='1234', # Replace with your MySQL password
            database='mon'    # Replace with your database name
        )
        if connection.is_connected():
            print("Connection successful!")
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

conn = create_connection()
