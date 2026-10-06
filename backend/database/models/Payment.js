const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    loanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "cash",
        "bank",
        "online"
      ),
      allowNull: false,
      defaultValue: "cash",
    },

    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;