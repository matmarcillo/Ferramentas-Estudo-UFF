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

O banco que vamos utilizar vai ser um SQL basico, mas vai ser tipo DW num esquema estrela (tranquilo Caio, é bem simples). Basicamente significa que as tabelas não necessariamente vão ser normalizadas perfeitamente, o que é ótimo pra gente porque a gente não tem que se preocupar com joins complexos e pode focar mais na lógica do aplicativo, e nas analises dos dados.  
**Esquema completo**: [`esquema_bd`](./esquemas/db.puml)

## Tecnologias

- **Frontend**:  
- **Backend**: Python
- **Banco de Dados**: SQL
- **Outras**: Docker (pra implantar)
