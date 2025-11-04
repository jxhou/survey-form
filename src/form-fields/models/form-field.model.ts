import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Form } from '../../forms/models/form.model';

@Table
export class FormField extends Model {
  @ForeignKey(() => Form)
  @Column
  formId: number;

  @Column
  name: string;

  @Column
  type: string;

  @Column({ defaultValue: false })
  required: boolean;

  @Column({ defaultValue: 0 })
  order: number;

  @Column({ defaultValue: true })
  active: boolean;

  @BelongsTo(() => Form)
  form: Form;
}
