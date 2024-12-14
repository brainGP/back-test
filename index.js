const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const path = require("path");

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connect with Mongoose"))
  .catch((err) => {
    console.log(err);
  });

const { ALLOWED_CORS } = process.env;

var allowlist = ALLOWED_CORS?.split(",") || [];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use("/images", express.static("public/images"));
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);

app.use("/", express.static(path.join(__dirname, "public")));

app.listen(process.env.PORT, () => {
  console.log(`backend running on port: ${process.env.PORT}`);
});
