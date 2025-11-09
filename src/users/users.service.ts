import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User){}

  async create(data: { username: string, password: string, roles: string[]}): Promise<User> {
    return this.userModel.create(data);
  }

  async findOne(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { username } });
    return user;
  }

  async findOneWithoutPassword(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async findOneWithPassword(username: string): Promise<User | null> {
    return this.userModel.scope('withPassword').findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async findByIdWithPassword(id: number): Promise<User | null> {
    return this.userModel.scope('withPassword').findByPk(id);
  }
}
