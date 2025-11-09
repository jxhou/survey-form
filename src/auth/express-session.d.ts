import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: { username: string; [key: string]: any };
  }
}