# Local PostgreSQL and pgAdmin Setup with Docker

This document outlines how to set up a local PostgreSQL database and a pgAdmin web interface using Docker and Docker Compose for development and testing purposes.

## Overview

The `docker-compose.yml` file in this project is configured to spin up two services:

1.  A **PostgreSQL 15** database instance.
2.  A **pgAdmin 4** instance, which is a web-based administration tool for PostgreSQL.

This setup is ideal for local development as it's isolated, reproducible, and doesn't require installing PostgreSQL or pgAdmin directly on your machine.

## Prerequisites

-   Docker
-   Docker Compose

## Services Explained

### `postgres`

-   **`image: postgres:15`**: Uses the official PostgreSQL version 15 image from Docker Hub.
-   **`container_name: local-postgres`**: Assigns a predictable name to the container.
-   **`restart: unless-stopped`**: Ensures the database container automatically restarts unless you manually stop it.
-   **`environment`**:
    -   `POSTGRES_USER: devuser`: Sets the database superuser username.
    -   `POSTGRES_PASSWORD: devpass`: Sets the password for the superuser.
    -   `POSTGRES_DB: devdb`: Creates an initial database with this name.
-   **`ports: - "5432:5432"`**: Maps port 5432 on your local machine to port 5432 inside the container, allowing you to connect to the database from your host machine (e.g., from your NestJS application).
-   **`volumes: - pgdata:/var/lib/postgresql/data`**: Creates a named volume `pgdata` to persist the database data even if the container is removed.

### `pgadmin`

-   **`image: dpage/pgadmin4`**: Uses the official pgAdmin 4 image.
-   **`container_name: pgadmin`**: Assigns a predictable name to the container.
-   **`restart: unless-stopped`**: Ensures the pgAdmin container restarts automatically.
-   **`environment`**:
    -   `PGADMIN_DEFAULT_EMAIL: admin@test.com`: Sets the login email (username) for the pgAdmin web interface.
    -   `PGADMIN_DEFAULT_PASSWORD: adminpass`: Sets the login password for pgAdmin.
-   **`ports: - "8080:80"`**: Maps port 8080 on your local machine to port 80 inside the container. You will access pgAdmin at `http://localhost:8080`.
-   **`depends_on: - postgres`**: Tells Docker Compose to start the `postgres` service before starting `pgadmin`.
-   **`volumes: - pgadmin_data:/var/lib/pgadmin`**: Creates a named volume `pgadmin_data` to persist pgAdmin user settings and server connections.

## How to Use

1.  **Start the services:**
    Open a terminal in the root directory of the project (where `docker-compose.yml` is located) and run:
    ```bash
    docker-compose up -d
    ```
    The `-d` flag runs the containers in detached mode (in the background).

2.  **Stop the services:**
    To stop the containers, run:
    ```bash
    docker-compose down
    ```
    If you want to remove the data volumes as well, use `docker-compose down -v`.

## Connecting to the Database from pgAdmin

1.  **Open pgAdmin**: Navigate to `http://localhost:8080` in your web browser.

2.  **Login**: Use the credentials you set in `docker-compose.yml`:
    -   **Email/Username**: `admin@test.com`
    -   **Password**: `adminpass`

3.  **Add a New Server**: On the pgAdmin dashboard, click on **"Add New Server"**.

4.  **Configure the Connection**:
    -   In the **General** tab, give your server a name, for example, `local-postgres`.
    -   Switch to the **Connection** tab and fill in the following details:
        -   **Host name/address**: `postgres` (This is the service name from `docker-compose.yml`. Docker's internal DNS will resolve it.)
        -   **Port**: `5432`
        -   **Maintenance database**: `devdb`
        -   **Username**: `devuser`
        -   **Password**: `devpass`

5.  **Save**: Click the **"Save"** button. Your database will now appear in the server list on the left, and you can start managing it.

## Connecting from the NestJS Application

To connect your NestJS application to this PostgreSQL database, you'll need to use a database module like `@nestjs/sequelize`.

1.  **Install Dependencies**:
    ```bash
    npm install --save @nestjs/sequelize sequelize sequelize-typescript pg
    npm install --save-dev @types/sequelize
    ```

2.  **Configure the Connection in `AppModule`**:
    In your main application module (e.g., `src/app.module.ts`), import and configure the `SequelizeModule`.

    ```typescript
    // src/app.module.ts
    import { Module } from '@nestjs/common';
    import { SequelizeModule } from '@nestjs/sequelize';

    @Module({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'devuser',
          password: 'devpass',
          database: 'devdb',
          autoLoadModels: true,
          synchronize: true, // Good for development, disable for production
        }),
      ],
      // ... other controllers and providers
    })
    export class AppModule {}
    ```

Once configured, you can create Sequelize models and inject them into your services using `@InjectModel()`.
