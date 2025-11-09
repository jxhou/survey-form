import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// import { User } from './interfaces/user.interface';
import { UsersService } from '../users/users.service';
import type { User } from '../users/models/user.model';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    // Store a minimal representation of the user in the session
    // Storing the ID is generally better than the username
    done(null, user.id);
  }

  async deserializeUser(payload: any, done: Function) {
    // Retrieve the full user object based on the stored payload
    const user = await this.usersService.findById(payload);
    // Passport will pass null to the callback if the user is not found,
    // which will clear the session and effectively log the user out.
    const { password, ...userInfo } = user?.get({ plain: true }) || {};
    done(null, user ? userInfo : null);
  }
}