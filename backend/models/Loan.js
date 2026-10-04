const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Loan = sequelize.define(
  "Loan",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    loanNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },

    durationMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    monthlyInstallment: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    totalPayable: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    remainingAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
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
      type: DataTypes.TEXT,
      allowNull: true,
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "loans",
    timestamps: true,
  }
);

module.exports = Loan;