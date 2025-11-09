# Handling Sequelize Model Instances vs. Plain JSON Data

A common point of confusion when working with Sequelize in a NestJS (or any Node.js) application is observing that model properties appear `undefined` during debugging, even though they are correctly sent to the frontend. This document explains why this happens and the best practices for handling Sequelize's data objects.

## The Problem: "Undefined" Properties During Debugging

Consider the following code in a service:

```typescript
// In some service...
async findUser(username: string) {
  const user = await this.userModel.findOne({ where: { username } });
  
  // When you set a breakpoint here and inspect `user`,
  // you might see that `user.username` is `undefined`.
  console.log(user.username); // This will correctly print the username.

  return user;
}
```

When you use a debugger to inspect the `user` object, you might not see the `username` property directly on the object, leading you to believe it's `undefined`. However, when the `user` object is returned from a controller, the frontend receives a perfect JSON object with all the expected fields.

---

## The "Why": Sequelize Instances vs. Plain Objects

When you execute a query like `this.userModel.findOne()`, Sequelize returns a **Sequelize model instance**, not a plain JavaScript object.

These instances are special objects that:
1.  Contain the actual data (like `username`, `id`, etc.) inside an internal property named `dataValues`.
2.  Expose your model's fields through **getter** and **setter** methods.
3.  Have many built-in methods for database operations (`.save()`, `.update()`, `.destroy()`).

When a debugger inspects the instance, it often shows the object's top-level properties, not the values returned by its getters. This is why the properties appear to be missing.

When you return the instance from a controller, NestJS (or Express) serializes it to JSON. This process calls the instance's `toJSON()` method, which correctly retrieves all values from `dataValues` and creates the plain object that gets sent to the client.

---

## Solutions: How to Access Plain Data

Here are the best ways to access the plain data from a Sequelize instance within your code.

### 1. The Recommended Way: `instance.get({ plain: true })`

This is the canonical Sequelize method to get a plain JavaScript object from a model instance. It's clean, explicit, and should be your go-to method when you need to manipulate the data as a simple object.

```typescript
const user = await this.usersService.findOneWithPassword(username);

if (user) {
  // Destructuring works reliably on the plain object
  const { password, ...result } = user.get({ plain: true });
  return result;
}
```

### 2. The Query-Level Approach: `raw: true`

If you only need to read data and don't need the Sequelize instance methods (`.save()`, etc.), you can add `raw: true` to your query options. This is more performant as Sequelize skips creating model instances altogether.

```typescript
// In forms.service.ts
async findAll(query: { name?: string; state?: number }) {
  const findOptions: FindOptions = {
    include: [FormField],
    raw: true, // Sequelize will return plain objects instead of instances
    nest: true, // Use with `raw: true` to group included associations
  };
  // ...
  return this.formModel.findAll(findOptions);
}
```

### 3. The Quick Debugging Way: `JSON.stringify`

For a quick look during a debugging session, `JSON.stringify()` implicitly calls the `toJSON()` method on the instance, showing you exactly what the frontend would receive.

```typescript
const forms = await this.formsService.findAll(query);

// This will log the plain objects to the console
console.log(JSON.parse(JSON.stringify(forms)));

return forms;
```

---

## A Special Case: Excluded Attributes (e.g., Passwords)

Sometimes, a property is `undefined` for a different reason: it was intentionally excluded for security.

In the `User` model, a `defaultScope` is used to exclude the `password` field from all standard queries.

**File: `src/users/models/user.model.ts`**
```typescript
@Table({
  defaultScope: {
    attributes: {
      exclude: ['password'], // This line excludes the password by default
    },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
  },
})
export class User extends Model {
  // ...
}
```

To fetch the password for validation, you must explicitly use the `withPassword` scope. This is handled by a dedicated service method.

**File: `src/users/users.service.ts`**
```typescript
async findOneWithPassword(username: string): Promise<User | null> {
  return this.userModel.scope('withPassword').findOne({ where: { username } });
}
```

By using `this.usersService.findOneWithPassword(username)`, you ensure the `password` field is included in the Sequelize instance, allowing you to perform comparisons.