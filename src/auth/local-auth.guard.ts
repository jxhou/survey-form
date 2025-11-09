import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Override canActivate to automatically log in the user and establish a session.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Run the standard authentication process
    const result = (await super.canActivate(context)) as boolean;

    // Manually log in the user to initiate the session
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);

    return result;
  }
}