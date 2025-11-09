import { Controller, Get, Post, Req, Res, Body, HttpStatus, UseGuards } from '@nestjs/common';
import  type { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { AuthService } from './auth.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from './roles.guard';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { User } from './interfaces/user.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // Apply the local authentication guard
  @Post('login')
  async login(@Req() req: Request) {
    // If we get here, the username and password are verified by LocalAuthGuard
    // let create/return a jwt token for client to use for subsequent requests
    const  token = await this.authService.login(req.user);
    return { message: 'You have been logged in!', user: req.user as User, ...token };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto.username, registerDto.password);
    // Exclude password from the response
    const { password, ...result } = user.dataValues;
    return { message: 'User registered successfully!', user: result };
  }

  @UseGuards(AuthenticatedGuard) // Ensure the user is authenticated to access their profile
  @Get('profile')
  getProfile(@Req() req: Request) {
    return { user: req.user };
  }

  @UseGuards(AuthenticatedGuard, RolesGuard) // Apply both guards
  @Roles(Role.Admin) // Specify that only 'admin' role can access this
  @Get('admin')
  getAdminResource(@Req() req: Request) {
    return { message: 'Welcome, Admin!', user: req.user };
  }

  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated to access their profile
  @Get('jwt-guarded')
  getJwtGuardedResource(@Req() req: Request) {
    return { user: req.user };
  }

  // Consolidated and improved logout endpoint
  @UseGuards(AuthenticatedGuard) // Ensure only authenticated users can log out
  @Post('logout') // Use POST for logout to prevent CSRF attacks
  async logout(@Req() req: Request, @Res() res: Response) {
    if (!req.isAuthenticated()) {
      // This case should ideally be caught by AuthenticatedGuard,
      // but it's a good defensive check.
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Not authenticated.' });
    }

    try {
      // Passport's req.logout() is asynchronous and expects a callback or returns a Promise.
      // We wrap it in a Promise to use async/await.
      await new Promise<void>((resolve, reject) => {
        req.logout((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      // After Passport's logout, explicitly clear the session cookie from the client.
      // While req.logout() often handles server-side session destruction,
      // explicitly clearing the cookie ensures the client-side is also cleaned up.
      res.clearCookie('connect.sid'); // Default session cookie name for express-session

      return res.status(HttpStatus.OK).json({ message: 'You have been logged out successfully.' });
    } catch (err) {
      console.error('Error during logout:', err); // Log the error for debugging
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error logging out' });
      }
      // Fallback for unexpected errors
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred during logout.' });
    }
  }
}
