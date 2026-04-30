# Projeto de Game Analytics - Ferramentas-Estudo-UFF

## Descrição

Este projeto tem como objetivo criar um aplicativo gameificado para promover a avaliação de disciplinas na UFF. A ideia é simples: oferecer documentos e ferramentas de estudo pra os estudantes se eles avaliam as suas disciplinas.  
O objetivo é criar um sistema participativo e comunitario na UFF pra centralizar as ferramentas de estudo, antigamente dificeis de encontrar.  
Temos tirado inspiração de plataformas comunitárias [`Shwet`](https://shwet.assos.utc.fr/) e [`UVweb`](https://assos.utc.fr/uvweb/web/) da Universidade de Tecnologia de Compiègne (UTC) na França, onde os estudantes compartilham documentos e avaliam as disciplinas. Aqui queremos criar algo similar, mas combinando as duas.  

## Features

- Publicação de documentos
- Avaliação de disciplinas
  - Sistema de pontos
- Consulta de documentos e de avaliações

## Arquitetura

O projeto é dividido em três camadas principais:

1. **Frontend**: Responsável pela interface do usuário, onde os estudantes podem interagir com o aplicativo, avaliar disciplinas e acessar os documentos disponíveis.
2. **Backend**: Gerencia a lógica de negócios, processa as avaliações, gerencia os documentos e interage com o banco de dados.
3. **Banco de Dados**: Armazena as informações dos usuários, avaliações, documentos e outras informações relevantes para o funcionamento do aplicativo.

## BDD

O banco que vamos utilizar vai ser um SQL basico, mas vai ser tipo DW num esquema estrela (tranquilo, é bem simples). Basicamente significa que as tabelas não necessariamente vão ser normalizadas perfeitamente, o que é ótimo pra gente porque a gente não tem que se preocupar com joins complexos e pode focar mais na lógica do aplicativo, e nas analises dos dados.  
Ideia é ter tudas as informações relevantes a so um join de distancia, o que facilita as consultas.
**Esquema completo**: [`esquema_bd`](./esquemas/db.puml)

## Backend

O backend vai ser desenvolvido em Python, baseado em um API RESTful. Ele vai ser responsável por processar as avaliações, gerenciar os documentos e interagir com o banco de dados.  
Vamos usar um framework web leve, como Flask ou FastAPI, pra facilitar o desenvolvimento e a manutenção do backend. Ele vai expor endpoints para as funcionalidades principais do aplicativo, como avaliação de disciplinas, publicação de documentos e consulta de informações.

## Frontend

Eu (Mateo) não conheço nada de Frontend. Mas a ideia é criar uma interface web simples e intuitiva, onde os estudantes possam facilmente avaliar suas disciplinas, acessar os documentos disponíveis e consultar as avaliações.

## Tecnologias

- **Frontend**: alguma framework web (React, Vue, Angular, etc.)
- **Backend**: Python
- **Banco de Dados**: SQL
- **Outras**: Docker (pra implantar)
