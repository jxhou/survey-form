import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
  defaultScope: {
    attributes: {
      exclude: ['password'],
    },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
  },
})
export class User extends Model {
  @Column
  username: string;

  @Column
  declare password: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare roles: string[];

}
