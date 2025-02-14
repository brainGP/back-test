const cors = require("cors");
const env = require("./env");

const { ALLOWED_CORS } = env;

// Ensure ALLOWED_CORS is a valid string before splitting
const allowedList = ALLOWED_CORS ? ALLOWED_CORS.split(",") : [];
const allowedOrigins = [
  ...allowedList.map((origin) => origin.trim()), // Trim spaces to avoid issues
  "https://retevis.mn",
  "https://retevis.vercel.app",
];

const corsOptions = cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*", // Use "*" if no origins are defined
  allowedHeaders: ["Authorization", "Content-Type", "Accept-Ranges", "Device"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
});

module.exports = corsOptions;
