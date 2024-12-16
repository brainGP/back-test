const express = require("express");

const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const path = require("path");
const connectDb = require("./lib/db");
const cors = require("./lib/cors");

dotenv.config();

const app = express();

connectDb();

app.use(cors);
app.use(express.json());

app.use("/images", express.static("public/images"));

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);

app.use("/", express.static(path.join(__dirname, "public")));

app.listen(process.env.PORT, () => {
  console.log(`backend running on port: ${process.env.PORT}`);
});
