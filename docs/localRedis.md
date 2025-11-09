# Local PostgreSQL and pgAdmin + Redis Setup with Docker

docker-compose-redis.yml add redis service to existing services to docker-compose.yml

see docs/localTestPostgreSQL.md for details about Postgres and pgadmin setup

## Redis
  -Redis Service: A new service named redis has been added.
  Image: It uses the official redis:alpine image, which is lightweight and ideal for development.
  Ports: It maps port 6379 from your local machine to the container, which is the standard Redis port. This allows your NestJS application to connect to it via localhost:6379.
  Volumes: A new named volume redisdata is created to persist your Redis data, so the sessions won't be lost if you restart the container.
  You can now start all three services (Postgres, pgAdmin, and Redis) by running:
      docker-compose -f docker-compose-redis.yml up -d
      docker-compose -f docker-compose-redis.yml down

      If you want to remove the data volumes as well, use:
       docker-compose -f docker-compose-redis.yml down -v.