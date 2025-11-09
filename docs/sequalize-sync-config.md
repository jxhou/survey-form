# Handling Sequelize Schema Synchronization in NestJS

When developing a NestJS application with Sequelize, it's common to modify your models by adding, removing, or changing columns. When you do this, you might encounter an error like:

```
error: column "new_column" of relation "Users" does not exist
```

This document explains why this happens and how to manage it during development.

## The Problem: Model vs. Database Schema Mismatch

This error occurs because your application's Sequelize model definition is out of sync with the actual table schema in your database.

1.  **In your code:** You've updated a model file (e.g., `user.model.ts`) to include a new property/column.
2.  **In your database:** The table (e.g., `Users`) was created *before* this change and does not have the new column.

Sequelize does not automatically alter your database tables every time you change a model by default. You must explicitly instruct it to synchronize the schema.

## The Solution (for Development): Enable `sync`

For development environments, the most straightforward way to keep your database schema synchronized with your models is by using the `sync` option in your `SequelizeModule` configuration.

The `alter: true` setting is particularly useful. It compares the current state of the table in the database against your model definition and performs the necessary non-destructive `ALTER TABLE` statements to match your model (like adding a new column).

### Configuration Example

You should add this configuration to your main `SequelizeModule.forRoot()` call, which is typically located in `app.module.ts`.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// ... other imports

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      // ... other connection options
      autoLoadModels: true,
      
      // Add this sync option for development
      sync: { alter: true }, 
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

After adding `sync: { alter: true }` and restarting your NestJS application, Sequelize will automatically run the necessary `ALTER TABLE` query to add the missing column, resolving the error.

### Sync Options Explained

*   **`sync: { alter: true }`**: (Recommended for Dev) This performs non-destructive updates. It will add new columns or modify existing ones but will not delete columns that have been removed from the model. This is a safe and convenient option for development.

*   **`sync: { force: true }`**: **(Use with Extreme Caution!)** This will execute a `DROP TABLE IF EXISTS` command before re-creating the table from the model definition. **You will lose all data in that table.** This is useful for resetting tables in a test environment but should never be used in production.

### Important Note for Production

The `sync` feature is a powerful development tool but is **not recommended for production environments**. Automatically altering a live database schema can be risky and may lead to data loss.

For production, the best practice is to use a dedicated migration tool like **`Sequelize-CLI`** or **`Umzug`**. Migrations provide precise, version-controlled, and reversible control over your database schema changes, which is essential for a stable production application.