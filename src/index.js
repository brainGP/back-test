const express = require("express");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const bannerRoute = require("./routes/dashboard");
const path = require("path");
const connectDb = require("./lib/db");
const cors = require("./lib/cors");
const env = require("./lib/env");
const Banner = require("./models/Banner");

const app = express();

const { PORT } = env;

connectDb();

app.use(cors);
app.use(express.json());

app.use("/images", express.static("/public/images"));

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);
app.use("/api/dashboard", bannerRoute);
app.listen(PORT, () => {
  console.log(`backend running on port: ${PORT}`);
});
