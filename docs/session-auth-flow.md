# Passport Session-Based Authentication Flow in NestJS

This document explains the step-by-step process of how session-based authentication works in a NestJS application using Passport.js. It details the journey from the initial login to handling subsequent authenticated requests.

## Overview

The core idea behind session-based authentication is to verify a user's credentials once, create a server-side session, and then send a cookie to the client. The client's browser will automatically send this cookie with every subsequent request, allowing the server to identify the user without needing credentials each time.

This flow primarily involves three key Passport methods:
1.  `validate()` in `LocalStrategy`
2.  `serializeUser()` in `SessionSerializer`
3.  `deserializeUser()` in `SessionSerializer`

---

## The Authentication Flow

### Step 1: Initial Login (`LocalStrategy.validate`)

This step happens **only once** when the user submits their credentials (e.g., username and password) to a login endpoint.

1.  **Request**: A `POST` request is made to `/auth/login` with user credentials.
2.  **Guard**: The `LocalAuthGuard` is triggered, which invokes Passport's `local` strategy.
3.  **Validation**: Passport calls the `validate()` method in your `local.strategy.ts`. This method is responsible for looking up the user in the database and verifying their password.
    ```typescript
    // src/auth/local.strategy.ts
    async validate(username: string, password?: string): Promise<any> {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        throw new UnauthorizedException();
      }
      // 1. If validation is successful, return the full user object.
      return user; 
    }
    ```
4.  **Session Initiation**: After `validate()` returns the user object, Passport attaches it to the request as `req.user`. The `LocalAuthGuard` then calls `req.logIn()`, which signals to Passport that a session should be created.

### Step 2: Creating the Session (`SessionSerializer.serializeUser`)

This step also happens **only once** immediately after a successful login.

1.  **Serialization**: When `req.logIn()` is called, Passport takes the full `user` object from `req.user` and passes it to the `serializeUser()` method in your `session.serializer.ts`.
2.  **Store Minimal Data**: The purpose of `serializeUser` is to decide what small, unique piece of information about the user should be stored in the session. Storing the entire user object is inefficient. Storing the user's ID is the best practice.
    ```typescript
    // src/auth/session.serializer.ts
    serializeUser(user: User, done: Function) {
      // 2. The user ID is extracted and passed to the 'done' callback.
      done(null, user.id);
    }
    ```
3.  **Cookie**: Passport stores this ID in the session store (e.g., in-memory, Redis) and sends a session cookie back to the client's browser.

### Step 3: Subsequent Authenticated Requests (`SessionSerializer.deserializeUser`)

This step happens on **every subsequent request** to a protected endpoint.

1.  **Cookie Sent**: The client's browser sends the session cookie with the request.
2.  **Session Found**: The server's session middleware uses the cookie to find the session data, which contains the user ID we stored.
3.  **Deserialization**: Passport retrieves the user ID from the session and passes it to the `deserializeUser()` method.
4.  **Fetch Full User**: This method's job is to take the ID and retrieve the full, up-to-date user object from the database.
    ```typescript
    // src/auth/session.serializer.ts
    async deserializeUser(payload: any, done: Function) {
      // 'payload' is the user ID we stored in the session.
      // 3. Fetch the complete user from the database.
      const user = await this.usersService.findById(payload);
      // 4. The full user object (minus password) is returned.
      done(null, user);
    }
    ```
5.  **Populate `req.user`**: The user object returned by `deserializeUser()` is attached to the request as `req.user`. This makes the user data available to all route handlers for the duration of that request.
6.  **Guard Check**: Guards like `AuthenticatedGuard` can now simply check `req.isAuthenticated()` which will be `true` because `req.user` has been successfully populated.

## Summary

*   **`validate()`**: Runs on login to check credentials. Returns a user object.
*   **`serializeUser()`**: Runs on login to decide what to store in the session (e.g., user ID).
*   **`deserializeUser()`**: Runs on every authenticated request to fetch the full user from the database using the ID from the session, populating `req.user`.