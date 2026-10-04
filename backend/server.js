require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

// Load models and associations
require("./models");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();

    console.log("✅ MySQL database connected successfully.");

    // IMPORTANT:
    // We are using migrations to manage tables.
    // Therefore, do NOT use sequelize.sync() here.

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server.");
    console.error("Error:", error.message);

    process.exit(1);
  }
};

startServer();