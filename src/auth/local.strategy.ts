import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username', // Default is 'username', explicitly set for clarity
      passwordField: 'password', // Default is 'password', explicitly set for clarity
    });
  }

  async validate(username: string, password?: string): Promise<any> {
    // The password parameter is optional in the DTO but required for validation here.
    // If your DTO allows password to be optional, ensure it's handled.
    const user = await this.authService.validateUser(username, password||'');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // Passport will attach this user object to req.user
  }
}