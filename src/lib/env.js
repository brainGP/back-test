const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  PASS_SEC: process.env.PASS_SEC,
  JWT_SEC: process.env.JWT_SEC,
  PORT: process.env.PORT,
  ALLOWED_CORS: process.env.ALLOWED_CORS,
};
