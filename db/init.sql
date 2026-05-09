CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    tier VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS professor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    departamento VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS disciplina (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    faculdade VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS semestro (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL CHECK (ano >= 2000),
    periodo VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS avaliacao_disciplina (
    id SERIAL PRIMARY KEY,
    estudante_id INTEGER NOT NULL REFERENCES usuarios (id),
    disciplina_id INTEGER NOT NULL REFERENCES disciplina (id),
    semestro_id INTEGER NOT NULL REFERENCES semestro (id),
    professor_id INTEGER NOT NULL REFERENCES professor (id),
    metrica_1 SMALLINT NOT NULL CHECK (metrica_1 BETWEEN 1 AND 5),
    metrica_2 SMALLINT NOT NULL CHECK (metrica_2 BETWEEN 1 AND 5),
    metrica_3 SMALLINT NOT NULL CHECK (metrica_3 BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS avaliacao_professor (
    id SERIAL PRIMARY KEY,
    estudante_id INTEGER NOT NULL REFERENCES usuarios (id),
    professor_id INTEGER NOT NULL REFERENCES professor (id),
    semestro_id INTEGER NOT NULL REFERENCES semestro (id),
    metrica_1 SMALLINT NOT NULL CHECK (metrica_1 BETWEEN 1 AND 5),
    metrica_2 SMALLINT NOT NULL CHECK (metrica_2 BETWEEN 1 AND 5),
    metrica_3 SMALLINT NOT NULL CHECK (metrica_3 BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS documento (
    id SERIAL PRIMARY KEY,
    disciplina_id INTEGER NOT NULL REFERENCES disciplina (id),
    tipo VARCHAR(50) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    semestro_id INTEGER NOT NULL REFERENCES semestro (id),
    link TEXT NOT NULL,
    nome VARCHAR(255) NOT NULL
);
