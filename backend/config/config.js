require("dotenv").config();

const databaseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      minVersion: "TLSv1.2",
    },
  },
};

module.exports = {
  development: { ...databaseConfig },
  test: {
    ...databaseConfig,
    database: "loan_management_test",
  },
  production: { ...databaseConfig },
};