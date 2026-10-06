"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash("Admin@12345", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "System Administrator",
        email: "admin@loanmanagement.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "admin@loanmanagement.com",
    });
  },
};