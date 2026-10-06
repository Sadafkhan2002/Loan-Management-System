"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      loanId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "loans",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      paymentMethod: {
        type: Sequelize.ENUM("cash", "bank", "online"),
        allowNull: false,
        defaultValue: "cash",
      },

      referenceNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  },
};