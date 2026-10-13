export const ROLES = Object.freeze({
  ADMIN: "admin",
  LOAN_OFFICER: "loan_officer",
  CUSTOMER: "customer",
});

export const STAFF_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.LOAN_OFFICER,
]);

export const ADMIN_ROLES = Object.freeze([ROLES.ADMIN]);