const cors = require("cors");
const env = require("./env");

const { ALLOWED_CORS } = env;

const allowedList = ALLOWED_CORS.split(",") || [];
const allowedOrigins = [
  ...allowedList,
  " https://retevis.mn",
  "https://retevis.vercel.app",
];

const corsOptions = cors({
  origin: allowedOrigins,
  allowedHeaders: ["Authorization", "Content-Type", "Accept-Ranges", "Device"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
});

module.exports = corsOptions;
