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

@Module({
  imports: [
    AuthModule,
    FormsModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost', // Or 'postgres' if the app runs in the same Docker network
      port: 5432,
      username: 'devuser',
      password: 'devpass',
      database: 'devdb',
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
