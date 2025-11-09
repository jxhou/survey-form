# Frontend Guide: Interacting with Authentication Routes

This document provides a guide for frontend developers on how to interact with the application's session-based authentication API.

## Important Note on Cookies and CORS

This authentication system relies on HTTP-only cookies for session management. For frontend applications running on a different domain or port (e.g., `localhost:3001` for frontend, `localhost:3000` for backend), you must configure your HTTP client (like Axios or Fetch) to include credentials with every request.

**For Postman:**
  It is a convenient way to just to test the api via Postman

**For Axios:**
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Your API base URL
  withCredentials: true,
});
```

**For Fetch API:**
```javascript
fetch('http://localhost:3000/auth/profile', {
  method: 'GET',
  credentials: 'include',
});
```

---

## Default Admin User

When the application is seeded for the first time, a default administrator account is created. You can use this account to log in and access admin-only routes.

These credentials are set by environment variables but will fall back to the following defaults if the variables are not set:

- **Username**: `admin`
- **Password**: `adminpass`

### Creating the Admin User

If the admin user does not exist in your database, you can create it by running the database seeder from the command line in the project's root directory. This command will execute all pending seed files, including the one that creates the admin user:
seeders/YYYYMMDDHHMMSS-create-admin-user.ts

```bash
npx sequelize-cli db:seed:all
```

**Note**: It is highly recommended to change these default credentials in a production environment by setting the `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

---

## 1. Register a New User

This endpoint creates a new user account.

- **Endpoint**: `POST /auth/register`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "username": "newuser",
  "password": "a-strong-password"
}
```

#### Success Response (Status `201 Created`)
The server returns a success message and the newly created user object (without the password).
```json
{
  "message": "User registered successfully!",
  "user": {
    "id": 2,
    "username": "newuser",
    "roles": [
      "user"
    ],
    "updatedAt": "2023-10-27T10:00:00.000Z",
    "createdAt": "2023-10-27T10:00:00.000Z"
  }
}
```

#### Error Response (Status `409 Conflict`)
This occurs if the username is already taken.
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "error": "Conflict"
}
```

---

## 2. Log In

This endpoint authenticates a user and establishes a session. The server will respond with a `Set-Cookie` header containing the session ID (`connect.sid`). The browser will automatically store this cookie and send it with all subsequent requests to the API.

- **Endpoint**: `POST /auth/login`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "username": "newuser",
  "password": "a-strong-password"
}
```

#### Success Response (Status `201 Created`)
The server returns a success message, the authenticated user's data, and a JWT `access_token`. While the session is managed by the cookie, this token can be used for other purposes if needed.
```json
{
  "message": "You have been logged in!",
  "user": {
    "id": 2,
    "username": "newuser",
    "roles": ["user"]
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
This response also contains a access_token, which allow client to access resource using jwt token.


#### Error Response (Status `401 Unauthorized`)
This occurs if the credentials are invalid.
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## 3. Accessing Session-Protected Pages

Once logged in, any request to a protected endpoint will be authenticated using the session cookie.

- **Example Endpoint**: `GET /auth/profile`

#### Request
A simple GET request. No body is needed. The browser will automatically include the `connect.sid` cookie.

#### Success Response (Status `200 OK`)
The server returns the data for the requested resource.
```json
{
  "user": {
    "id": 2,
    "username": "newuser",
    "roles": ["user"]
  }
}
```

#### Error Response (Status `401 Unauthorized`)
If the user is not logged in (i.e., no valid session cookie is sent), the server will deny access.

---

## 4. Accessing Admin-Only Pages

Some routes are protected by role-based access control. Only users with the `admin` role can access them.

- **Example Endpoint**: `GET /auth/admin`

#### Behavior
- If an authenticated **admin** user makes a request, they will receive a `200 OK` response with the resource.
- If an authenticated **non-admin** user makes a request, they will receive a `403 Forbidden` error.
- If an **unauthenticated** user makes a request, they will receive a `401 Unauthorized` error.

---

## 5 access jwt route

The Auth module also implement jwt based authentication. 
See 2. Log In above to see access_token returned with login in response.

Test using Postman:
- **Example Endpoint**: `GET http://localhost:3000/auth/jwt-guarded`

Add Authorization header, using the access_token

#### Success Response (Status `200 OK`)
```json
{
    "user": {
        "id": 7,
        "username": "John2",
        "roles": [
            "user"
        ],
        "createdAt": "2025-11-08T04:55:23.449Z",
        "updatedAt": "2025-11-08T04:55:23.449Z"
    }
}
```

## 6. Log Out

This endpoint terminates the user's session on the server.

- **Endpoint**: `POST /auth/logout`

#### Behavior
When this endpoint is called, the server destroys the session. It also instructs the browser to clear the `connect.sid` cookie, effectively logging the user out on the client side as well.

#### Success Response (Status `200 OK`)
```json
{
  "message": "You have been logged out successfully."
}
```

## 6. Public Routes 
src/forms/forms.controller.ts

src/form-fields/form-fields.controller.ts
