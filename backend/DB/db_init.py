import os
import psycopg2

"""Builds the PostgreSQL schema if it does not already exist."""

TABLES = {
    "user": """
        CREATE TABLE IF NOT EXISTS user (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(120) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            tier VARCHAR(50) NOT NULL
        );
    """,
    "professor": """
        CREATE TABLE IF NOT EXISTS professor (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(120) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            departamento VARCHAR(120) NOT NULL
        );
    """,
    "disciplina": """
        CREATE TABLE IF NOT EXISTS disciplina (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(120) NOT NULL,
            codigo VARCHAR(50) NOT NULL UNIQUE,
            faculdade VARCHAR(120) NOT NULL
        );
    """,
    "semestro": """
        CREATE TABLE IF NOT EXISTS semestro (
            id SERIAL PRIMARY KEY,
            ano INTEGER NOT NULL CHECK (ano >= 2000),
            periodo VARCHAR(20) NOT NULL
        );
    """,
    "avaliacao_disciplina": """
        CREATE TABLE IF NOT EXISTS avaliacao_disciplina (
            id SERIAL PRIMARY KEY,
            estudante_id INTEGER NOT NULL REFERENCES "user" (id),
            disciplina_id INTEGER NOT NULL REFERENCES disciplina (id),
            semestro_id INTEGER NOT NULL REFERENCES semestro (id),
            professor_id INTEGER NOT NULL REFERENCES professor (id),
            metrica_1 SMALLINT NOT NULL CHECK (metrica_1 BETWEEN 1 AND 5),
            metrica_2 SMALLINT NOT NULL CHECK (metrica_2 BETWEEN 1 AND 5),
            metrica_3 SMALLINT NOT NULL CHECK (metrica_3 BETWEEN 1 AND 5)
        );
    """,
    "avaliacao_professor": """
        CREATE TABLE IF NOT EXISTS avaliacao_professor (
            id SERIAL PRIMARY KEY,
            estudante_id INTEGER NOT NULL REFERENCES "user" (id),
            professor_id INTEGER NOT NULL REFERENCES professor (id),
            semestro_id INTEGER NOT NULL REFERENCES semestro (id),
            metrica_1 SMALLINT NOT NULL CHECK (metrica_1 BETWEEN 1 AND 5),
            metrica_2 SMALLINT NOT NULL CHECK (metrica_2 BETWEEN 1 AND 5),
            metrica_3 SMALLINT NOT NULL CHECK (metrica_3 BETWEEN 1 AND 5)
        );
    """,
    "documento": """
        CREATE TABLE IF NOT EXISTS documento (
            id SERIAL PRIMARY KEY,
            disciplina_id INTEGER NOT NULL REFERENCES disciplina (id),
            tipo VARCHAR(50) NOT NULL,
            tier VARCHAR(50) NOT NULL,
            semestro_id INTEGER NOT NULL REFERENCES semestro (id),
            link TEXT NOT NULL,
            nome VARCHAR(255) NOT NULL
        );
    """,
}


CREATE_ORDER = [
    "user",
    "professor",
    "disciplina",
    "semestro",
    "avaliacao_disciplina",
    "avaliacao_professor",
    "documento",
]

conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),  # docker service name if running inside compose network
    port=int(os.getenv("DB_PORT", "5432")),
    database=os.getenv("DB_NAME", "mydb"),
    user=os.getenv("DB_USER", "myuser"),
    password=os.getenv("DB_PASSWORD", "mypassword"),
)


def build_schema() -> None:
    """Creates all tables in dependency order if they do not already exist."""
    cur = None
    try:
        cur = conn.cursor()

        for table_name in CREATE_ORDER:
            cur.execute(TABLES[table_name])

        conn.commit()
        print("Schema created successfully.")
    except Exception as exc:
        conn.rollback()
        print(f"Error while creating schema: {exc}")
        raise
    finally:
        if cur is not None:
            cur.close()
        conn.close()


if __name__ == "__main__":
    build_schema()
