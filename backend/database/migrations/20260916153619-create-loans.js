"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("loans", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      loanNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "customers",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      interestRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },

      durationMonths: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      monthlyInstallment: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      totalPayable: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      paidAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      remainingAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          "pending",
          "approved",
          "rejected",
          "active",
          "completed"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      purpose: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      approvedAt: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("loans");
  },
};