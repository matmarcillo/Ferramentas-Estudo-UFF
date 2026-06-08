import psycopg2
import os

def get_db(): # don't really need env variables here, since the db is from a docker container we can hardcode the connection parameters, but this allows for more flexibility if ever needed
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "mydb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password")
    )
