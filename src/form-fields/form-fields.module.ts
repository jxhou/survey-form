import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FormFieldsService } from './form-fields.service';
import { FormFieldsController } from './form-fields.controller';
import { FormField } from './models/form-field.model';

@Module({
  imports: [SequelizeModule.forFeature([FormField])],
  controllers: [FormFieldsController],
  providers: [FormFieldsService],
})
export class FormFieldsModule {}
