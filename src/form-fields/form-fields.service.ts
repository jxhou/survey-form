import { Injectable } from '@nestjs/common';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
// import { FormFieldsModule } from './form-fields.module';
import { InjectModel } from '@nestjs/sequelize';
import { FormField } from './models/form-field.model';
import { FindOptions, WhereOptions } from 'sequelize';
import { Form } from 'src/forms/models/form.model';


@Injectable()
export class FormFieldsService {
  constructor(@InjectModel(FormField)  private formFieldsModel: typeof FormField) {}

  create(createFormFieldDto: CreateFormFieldDto) {
    return 'This action adds a new formField';
  }

  findAll(query: { name?: string; state?: number }) {
    const findOptions: FindOptions = {
      include: [Form],
    };
    const where: WhereOptions = {};
    findOptions.where = where;
  
    if (query.name) {
      where.name = query.name;
    }
  
    if (query.state) {
      where.state = query.state;
    }
  
    return this.formFieldsModel.findAll(findOptions);
  
    //return `This action returns all formFields`;
  }

  findOne(id: number) {
    return `This action returns a #${id} formField`;
  }

  update(id: number, updateFormFieldDto: UpdateFormFieldDto) {
    return `This action updates a #${id} formField`;
  }

  remove(id: number) {
    return `This action removes a #${id} formField`;
  }
}
