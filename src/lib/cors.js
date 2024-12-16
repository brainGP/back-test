const cors = require("cors");

const allowedOrigins = ["http://localhost:3003"];

const corsOptions = cors({
  origin: allowedOrigins,
  allowedHeaders: ["Authorization", "Content-Type", "Accept-Ranges", "Device"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

module.exports = corsOptions;
