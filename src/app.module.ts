import cors from 'cors';
import helmet from 'helmet';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FormsModule } from './forms/forms.module';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UsersModule } from './users/users.module';

const host = process.env.DATABASE_HOST || 'localhost';
const port = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;
const username = process.env.DATABASE_USERNAME || 'devuser';
const password = process.env.DATABASE_PASSWORD || 'devpass';
const database = process.env.DATABASE_DB || 'devdb';

@Module({
  imports: [
    AuthModule,
    FormsModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host, 
      port,
      username,
      password,
      database,
      autoLoadModels: true, // Automatically load all models defined in your project
      synchronize: true, // Auto-create database tables on every application launch (good for dev, not for prod)
      // For development, you can use alter to automatically update schema
      sync: { alter: true }, // This is a more specific and safer option
    }),
    FormFieldsModule,
    UsersModule,
  ],
  controllers: [AppController],
  // providers: [AppService, UsersService],
   providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors(), helmet(), LoggerMiddleware).forRoutes('*');
  }
}
