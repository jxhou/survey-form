import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { FormField } from '../../form-fields/models/form-field.model';

@Table
export class Form extends Model {
  @Column
  name: string;

  @Column
  state: number;

  @HasMany(() => FormField)
  formFields: FormField[];
}
