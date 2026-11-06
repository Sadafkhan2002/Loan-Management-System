
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add userId without a foreign key or unique constraint first.
    await queryInterface.addColumn("customers", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Add the foreign key separately.
    await queryInterface.addConstraint("customers", {
      fields: ["userId"],
      type: "foreign key",
      name: "customers_user_id_foreign",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add the unique index separately.
    await queryInterface.addIndex("customers", ["userId"], {
      unique: true,
      name: "customers_user_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "customers",
      "customers_user_id_unique"
    );

    await queryInterface.removeConstraint(
      "customers",
      "customers_user_id_foreign"
    );

    await queryInterface.removeColumn("customers", "userId");
  },
};
