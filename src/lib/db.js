const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected with Mongoose");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDb;
