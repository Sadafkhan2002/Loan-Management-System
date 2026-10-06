"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "notifications",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        customerId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "customers",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        type: {
          type: Sequelize.ENUM(
            "loan_submitted",
            "loan_approved",
            "loan_rejected",
            "loan_activated",
            "payment_received",
            "loan_completed",
            "system"
          ),
          allowNull: false,
        },

        title: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },

        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        isRead: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "notifications"
    );
  },
};