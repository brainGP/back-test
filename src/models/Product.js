const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    default: function genUUID() {
      return uuid();
    },
  },
  brand: { type: String, required: true },
  sort: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  style: { type: String, required: true },
  price: { type: String, required: false },
  priceN: { type: String, required: true },
  battery: { type: String, required: true },
  power: { type: String, required: true },
  hertz: { type: String, required: true },
  status: { type: String, default: "false" },
  description: { type: String, required: true },
  rating: { type: String, required: true },
  quantity: { type: String, required: true },
  size: { type: String, required: false },
  images: [
    {
      image: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
