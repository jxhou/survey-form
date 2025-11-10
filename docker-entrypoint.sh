#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running database migrations..."
# Run migrations, yet to enable
# npm run db:migrate

echo "Migrations complete. Starting the application..."
# Execute the command passed to this script (i.e., the CMD from Dockerfile or command from docker-compose)
exec "$@"