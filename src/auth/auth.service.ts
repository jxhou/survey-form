import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
   constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // Use the specific service method that includes the password
    const user = await this.usersService.findOneWithPassword(username);

    // Compare the provided password with the stored hash
    // The user object is a Sequelize instance, so we access properties via .get() or directly
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.get({ plain: true });
      return result;
    }
    return null;
  }

  async register(username: string, pass: string): Promise<any> {
    // Check if user already exists
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    // Create the new user with the default 'user' role
    const newUser = await this.usersService.create({
      username,
      password: hashedPassword,
      roles: [Role.User], // Assign the default role here
    });

    return newUser;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // You might add methods for user registration, password hashing, etc.
}