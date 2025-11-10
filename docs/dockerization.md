# Dockerization Strategy

This document provides an overview of the containerization strategy for the `survey-form` application. We use Docker to create consistent, isolated, and portable environments for both development and production.

## Core Components

Our Docker setup consists of several key files, each with a specific purpose.

### `Dockerfile`

This is the production Dockerfile. It uses a **multi-stage build** process to create a small, optimized, and secure final image.

*   **Build Stage (`build`)**: This stage installs all `npm` dependencies (including `devDependencies`), copies the source code, and runs `npm run build` to compile the TypeScript into JavaScript.
*   **Production Stage (`production`)**: This stage starts from a clean Node.js Alpine image, installs *only* the production dependencies using `npm ci`, and copies the compiled JavaScript from the `build` stage's `/dist` directory.

This approach ensures that the final image does not contain any build tools, development dependencies, or source code, making it lightweight and more secure.

### `Dockerfile.dev`

This file is specifically for the development environment. Its goal is to enable a fast and efficient development loop with features like hot-reloading.

*   It installs all dependencies, including `devDependencies`.
*   It uses `npm run start:dev` (or `start:debug`) as its default command to start the application in watch mode.
*   It exposes both the application port (`3000`) and the Node.js debug port (`9229`).

### `docker-compose.yml`

This file orchestrates our multi-container development environment. It defines and links all the services required to run the application locally.

*   **`app`**: The NestJS application service, built using `Dockerfile.dev`.
*   **`postgres`**: A PostgreSQL 15 database service.
*   **`pgadmin`**: A web-based GUI for managing the PostgreSQL database.

### `.dockerignore`

This file acts like `.gitignore` but for Docker. It tells the Docker daemon which files and directories to exclude from the build context. This is a critical optimization that:
*   Prevents large directories like `node_modules` and `.git` from being sent to the Docker daemon, speeding up builds.
*   Avoids accidentally copying sensitive files like `.env` into the image.
*   Prevents cache-busting from irrelevant file changes (e.g., in `.vscode`).

### `docker-entrypoint.sh`

This shell script is used as the `entrypoint` for the `app` service in `docker-compose.yml`. It ensures that database migrations are run automatically every time the container starts, before the main application process is launched.

1.  It runs `npm run db:migrate`.
2.  It then uses `exec "$@"` to execute the `command` specified in `docker-compose.yml` (e.g., `npm run start:debug`).

## Development Workflow

Our setup is optimized for a seamless development experience with hot-reloading and database management.

### Starting the Environment

1.  **Start all services**:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the `app` image using `Dockerfile.dev`.
    *   Start the `postgres` and `pgadmin` containers.
    *   Start the `app` container, which will first run database migrations via `docker-entrypoint.sh` and then start the NestJS application in debug/watch mode.

2.  **Hot-Reloading**:
    Because the `docker-compose.yml` file mounts your local source code (`.`) into the container at `/usr/src/app`, any changes you make to your files will be detected by NestJS's watch mode, which will automatically recompile and restart the application.

3.  **Debugging**:
    The `app` service is configured to start in debug mode, listening on port `9229`. You can attach your VS Code debugger using the provided `.vscode/launch.json` configuration named **"Attach to NestJS (Docker)"**.

### Managing the Database

*   **pgAdmin**: Access the pgAdmin web interface at `http://localhost:8080`. You can connect to the database using the service name `postgres` as the host.
*   **Migrations**: To create a new migration, execute the following command in a separate terminal:
    ```bash
    docker-compose exec app npx sequelize-cli migration:generate --name <your-migration-name>
    ```

### Stopping the Environment

To stop all running services:
```bash
docker-compose down
```
To stop services and remove the persistent data volumes:
```bash
docker-compose down -v
```

## Production Workflow

The production workflow is focused on creating a self-contained, runnable image from the production `Dockerfile`.

1.  **Build the Production Image**:
    From the root of the project, run:
    ```bash
    docker build -t survey-form-app .
    ```
    This command uses the multi-stage `Dockerfile` by default to create a lean production image tagged as `survey-form-app`.

2.  **Run the Production Container**:
    To run the image, you must provide the necessary environment variables.
    ```bash
    docker run -d \
      -p 3000:3000 \
      -e DATABASE_HOST=your_prod_db_host \
      -e DATABASE_PORT=5432 \
      -e DATABASE_USER=your_prod_user \
      -e DATABASE_PASSWORD=your_prod_password \
      -e DATABASE_DB=your_prod_db \
      --name survey-form-container \
      survey-form-app
    ```
    *Note: In a real-world scenario, you would use a more secure method for managing secrets, such as Docker secrets, Kubernetes secrets, or a cloud provider's secret manager.*

3.  **Migrations in Production**:
    The production image does not run migrations automatically. You should run them as a separate, one-off task against your production database before deploying the new version of the application.
    ```bash
    docker run --rm \
      -e DATABASE_HOST=your_prod_db_host \
      # ... other env vars
      survey-form-app npm run db:migrate
    ```
