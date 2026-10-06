const sequelize = require("../../config/database");

const User = require("./User");
const Customer = require("./Customer");
const Loan = require("./Loan");
const Payment = require("./Payment");
const Notification = require("./Notification");

// ==========================================
// Customer ↔ Loan
// ==========================================

Customer.hasMany(Loan, {
  foreignKey: "customerId",
  as: "loans",
});

Loan.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

// ==========================================
// User ↔ Customer
// ==========================================

User.hasOne(Customer, {
  foreignKey: "userId",
  as: "customerProfile",
});

Customer.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ==========================================
// Loan ↔ Payment
// ==========================================

Loan.hasMany(Payment, {
  foreignKey: "loanId",
  as: "payments",
});

Payment.belongsTo(Loan, {
  foreignKey: "loanId",
  as: "loan",
});

// ==========================================
// User ↔ Loan
// ==========================================

User.hasMany(Loan, {
  foreignKey: "approvedBy",
  as: "approvedLoans",
});

Loan.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approver",
});

// ==========================================
// User ↔ Notification
// ==========================================

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ==========================================
// Customer ↔ Notification
// ==========================================

Customer.hasMany(Notification, {
  foreignKey: "customerId",
  as: "notifications",
});

Notification.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

module.exports = {
  sequelize,
  User,
  Customer,
  Loan,
  Payment,
  Notification,
};