const mongoose = require("mongoose");
const env = require("./env");

const { MONGO_URL } = env;

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected with Mongoose");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDb;
