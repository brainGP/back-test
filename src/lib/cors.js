const cors = require("cors");
const env = require("./env");

const { ALLOWED_CORS } = env;

const allowedList = ALLOWED_CORS.split(",") || [];
const allowedOrigins = [
  ...allowedList,
  "https://retevis-clzflylgb-braingps-projects.vercel.app",
  "https://retevis-braingps-projects.vercel.app",
  "https://retevis.vercel.app",
  "https://retevis-6l2ysup71-braingps-projects.vercel.app",
  "https://retevis-6umn4b3t5-braingps-projects.vercel.app",
];

const corsOptions = cors({
  origin: allowedOrigins,
  allowedHeaders: ["Authorization", "Content-Type", "Accept-Ranges", "Device"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
});

module.exports = corsOptions;
