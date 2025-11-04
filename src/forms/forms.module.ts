import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Form } from './models/form.model';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';

@Module({
  imports: [SequelizeModule.forFeature([Form])],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}
