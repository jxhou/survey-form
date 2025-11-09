import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Form } from './models/form.model';
import { FormField } from 'src/form-fields/models/form-field.model';

import { FindOptions, WhereOptions } from 'sequelize';

@Injectable()
export class FormsService {
  constructor(@InjectModel(Form) private formModel: typeof Form,) {}

  async create(createFormDto: CreateFormDto) {
    // return 'This action adds a new form';
    return this.formModel.create({
      name: createFormDto.name,
      state: createFormDto.state,
    });
  }

  async findAll(query: { name?: string; state?: number }) {
    const findOptions: FindOptions = {
      include: [FormField],
      raw: true, // Sequelize will return plain objects
    };
    const where: WhereOptions = {};

    if (query.name) {
      where.name = query.name;
    }

    if (query.state) {
      where.state = query.state;
    }

    if (Object.keys(where).length) {
      findOptions.where = where;
    }

    return this.formModel.findAll(findOptions);
  }

  findOne(id: number) {
    return `This action returns a #${id} form`;
  }

  update(id: number, updateFormDto: UpdateFormDto) {
    return `This action updates a #${id} form`;
  }

  remove(id: number) {
    return `This action removes a #${id} form`;
  }
}
