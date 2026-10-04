"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "customers",
      "userId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "customers",
      "userId"
    );
  },
};