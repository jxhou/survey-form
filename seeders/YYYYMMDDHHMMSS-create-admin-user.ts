'use strict';
import { QueryInterface } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/common/enums/role.enum';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpass';

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Check if the admin user already exists
    const users: any[] = await queryInterface.sequelize.query(
      `SELECT * FROM "Users" WHERE username = :username`,
      { replacements: { username: adminUsername }, type: 'SELECT' }
    );

    // this log undefine
    console.log(users);

    if (users && users.length === 0) {
      const user = await queryInterface.bulkInsert('Users', [{
        username: adminUsername,
        password: hashedPassword,
        roles: [Role.Admin, Role.User], // Assign both admin and user roles
        createdAt: new Date(),
        updatedAt: new Date(),
      }], {});
      console.log(user);
    }
  },

  async down(queryInterface: QueryInterface, Sequelize) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    await queryInterface.bulkDelete('Users', { username: adminUsername }, {});
  }
};