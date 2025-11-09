import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config'
import session from 'express-session';
import { RedisStore } from "connect-redis"
import passport from 'passport';
import { createClient } from 'redis';

async function bootstrap() {
  const sessionKey = process.env.SESSION_SECRET || 'secret';

  const app = await NestFactory.create(AppModule);

  // Initialize Redis client and store
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'session:',
  });

  // add session support
  app.use(
    session({
      store: redisStore,
      secret: sessionKey, 
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
  console.log(process.env);
}
bootstrap();
