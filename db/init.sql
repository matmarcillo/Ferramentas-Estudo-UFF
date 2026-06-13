CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    exp  DECIMAL NOT NULL DEFAULT 0,
    user_role VARCHAR(50) NOT NULL
);

INSERT INTO usuarios (nome, email, exp, user_role) VALUES
('Mateo', 'mateo@uff.br', 0, 'admin'); -- on rajoute un admin à la création des tables

CREATE TABLE IF NOT EXISTS professor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    departamento VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS disciplina (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL UNIQUE,
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
    professor_id INTEGER REFERENCES professor (id), -- Now optional
    dificuldade SMALLINT NOT NULL CHECK (dificuldade BETWEEN 1 AND 5),
    utilidade SMALLINT NOT NULL CHECK (utilidade BETWEEN 1 AND 5),
    interesse SMALLINT NOT NULL CHECK (interesse BETWEEN 1 AND 5),
    carga_trabalho SMALLINT NOT NULL CHECK (carga_trabalho BETWEEN 1 AND 5),
    status_aprovacao VARCHAR(20) NOT NULL,
    comentario TEXT -- Added comentario
);

CREATE TABLE IF NOT EXISTS avaliacao_professor (
    id SERIAL PRIMARY KEY,
    estudante_id INTEGER NOT NULL REFERENCES usuarios (id),
    professor_id INTEGER NOT NULL REFERENCES professor (id),
    semestro_id INTEGER NOT NULL REFERENCES semestro (id),
    pedagogia SMALLINT NOT NULL CHECK (pedagogia BETWEEN 1 AND 5),
    organizacao SMALLINT NOT NULL CHECK (organizacao BETWEEN 1 AND 5),
    rigidez SMALLINT NOT NULL CHECK (rigidez BETWEEN 1 AND 5),
    comentario TEXT -- Added comentario
);

CREATE TABLE IF NOT EXISTS documento (
    id SERIAL PRIMARY KEY,
    disciplina_id INTEGER NOT NULL REFERENCES disciplina (id),
    tipo VARCHAR(50) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    semestro_id INTEGER NOT NULL REFERENCES semestro (id),
    publicador_id INTEGER NOT NULL REFERENCES usuarios(id),
    link TEXT NOT NULL,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS comentario (
    id SERIAL PRIMARY KEY,
    documento_id INTEGER NOT NULL REFERENCES documento (id),
    texto TEXT NOT NULL,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id),
    replies_to_id INTEGER REFERENCES comentario (id)
);

CREATE TABLE IF NOT EXISTS voto (
    id SERIAL PRIMARY KEY,
    documento_id INTEGER NOT NULL REFERENCES documento (id),
    valor SMALLINT NOT NULL CHECK (valor IN (1, 0, -1)),
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id),
    UNIQUE (usuario_id, documento_id)
);
