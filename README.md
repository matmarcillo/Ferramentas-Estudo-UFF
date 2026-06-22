# Projeto de Game Analytics - Ferramentas-Estudo-UFF

## Descrição

Este projeto tem como objetivo criar um aplicativo gameificado para promover a avaliação de disciplinas na UFF. A ideia é simples: oferecer documentos e ferramentas de estudo pra os estudantes se eles avaliam as suas disciplinas.  
O objetivo é criar um sistema participativo e comunitario na UFF pra centralizar as ferramentas de estudo, antigamente dificeis de encontrar.  
Temos tirado inspiração de plataformas comunitárias [`Shwet`](https://shwet.assos.utc.fr/) e [`UVweb`](https://assos.utc.fr/uvweb/web/) da Universidade de Tecnologia de Compiègne (UTC) na França, onde os estudantes compartilham documentos e avaliam as disciplinas. Aqui queremos criar algo similar, mas combinando as duas.  

Uma versão inicial do projeto já está disponível, até o final de julho 2026 (porque a minha promoção de creditos clouds acaba depois), e a ideia é deixar alunos testarem, e se quiserem manter o projeto, é possivel dar um fork. Aproveitem!  
[AvaliUFF](http://129.212.196.187/)

## Features

- Publicação de documentos
- Avaliação de disciplinas
  - Sistema de pontos
- Consulta de documentos e de avaliações
- Modo administrador para gerenciar o conteúdo e os usuários
  - O credencial de administrador é `mateo@uff.br`, pode mudar em [`db/init.sql`](db/init.sql).

## Arquitetura

O projeto é dividido em três camadas principais:

1. **Frontend**: Responsável pela interface do usuário, onde os estudantes podem interagir com o aplicativo, avaliar disciplinas e acessar os documentos disponíveis.
2. **Backend**: Gerencia a lógica de negócios, processa as avaliações, gerencia os documentos e interage com o banco de dados.
3. **Banco de Dados**: Armazena as informações dos usuários, avaliações, documentos e outras informações relevantes para o funcionamento do aplicativo.

## BDD

O banco que vamos utilizar vai ser um SQL basico, mas vai ser tipo DW num esquema estrela (tranquilo, é bem simples). Basicamente significa que as tabelas não necessariamente vão ser normalizadas perfeitamente, o que é ótimo pra gente porque a gente não tem que se preocupar com joins complexos e pode focar mais na lógica do aplicativo, e nas analises dos dados.  
Ideia é ter tudas as informações relevantes a so um join de distancia, o que facilita as consultas.
**Esquema completo**: [`esquema_bd`](docs/esquemas/db.puml)

## Backend

O backend vai ser desenvolvido em Python, baseado em um API RESTful. Ele vai ser responsável por processar as avaliações, gerenciar os documentos e interagir com o banco de dados.  
Vamos usar um framework web leve, como Flask ou FastAPI, pra facilitar o desenvolvimento e a manutenção do backend. Ele vai expor endpoints para as funcionalidades principais do aplicativo, como avaliação de disciplinas, publicação de documentos e consulta de informações.
No momento, a autenticação é "falsa". Login so é feito com o email, e não tem senha. Fizemos pra virar mas simples o uso como é uma demo, mas pode ser facilmente implementado.

## Frontend

A ideia é criar uma interface web simples e intuitiva, onde os estudantes possam facilmente avaliar suas disciplinas, acessar os documentos disponíveis e consultar as avaliações.

## Tecnologias

- **Frontend**: alguma framework web (React, Vue, Angular, etc.)
- **Backend**: Python
- **Banco de Dados**: SQL
- **Outras**: Docker (pra implantar)

## Requirements

- Python 3.10 ou superior
- Docker Desktop

## Lançamento

### Entorno de produção

```bash
docker compose up --build
```

### Entorno de test

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
pip install -r requirements.txt

docker compose up db -d

python API/main.py

cd frontend && npm install
npm run dev
```

## Next Steps

- **Implementar autenticação real com senha**
  - Implementar autenticação google no dominio da UFF
- adicionar sistema de confianza, e moderação de documentos
- adicionar sistema de feedback
