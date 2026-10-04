const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    occupation: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "active",
        "inactive"
      ),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "customers",
    timestamps: true,
  }
);

module.exports = Customer;