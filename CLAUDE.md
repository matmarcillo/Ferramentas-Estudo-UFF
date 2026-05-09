# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## High-Level Code Architecture and Structure

This project aims to create a gamified application for evaluating academic disciplines at UFF, encouraging students to provide evaluations in exchange for study tools and documents.

The architecture is structured into three main layers:

1.  **Frontend**: (Planned, not yet implemented) This layer will provide the user interface for students to interact with the application, submit evaluations, and access study documents. A web framework like React, Vue, or Angular is intended for this.
2.  **Backend**: Implemented using **FastAPI** in Python, this layer handles the core business logic, processes evaluations, manages documents, and interacts with the database. The main application entry point is `API/api_test.py`.
3.  **Database**: A **PostgreSQL** database stores all relevant information, including users, evaluations, and documents. The database schema adopts a simplified data warehouse-like star schema approach to facilitate analytical queries. The initial database setup is handled by `db/init.sql`, and the complete database schema can be viewed in `docs/esquemas/db.puml`.

## Common Development Commands

### 1. Database Operations

*   **Start the PostgreSQL database service**:
    ```bash
    docker-compose up -d db
    ```
    This command starts the PostgreSQL container defined in `docker-compose.yml` and initializes the database using `db/init.sql` if it's the first run.

### 2. Backend (Python/FastAPI)

*   **Install Python dependencies**:
    ```bash
    pip install -r API/requirements.txt
    ```
    This installs `fastapi` and `psycopg2`, among other potential dependencies.

*   **Run the Backend API**:
    ```bash
    uvicorn API.api_test:app --host 0.0.0.0 --port 8000 --reload
    ```
    This command starts the FastAPI application, making it accessible at `http://localhost:8000`. The `--reload` flag enables auto-reloading on code changes.

*   **Run Backend Tests**:
    No explicit test files or test runner commands were found for the backend. The file `API/api_test.py` contains the application logic, not unit or integration tests.

### 3. Frontend

*   The frontend part of the application is not yet implemented. Specific commands for building, linting, or running tests will be added here once the frontend framework and structure are established.