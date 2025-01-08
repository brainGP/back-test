const Product = require("../models/Product");
const { verifyTokenAndAdmin } = require("./verifyToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const express = require("express");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/stations"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// CREATE
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("images"),
  async (req, res) => {
    try {
      const imageFiles = req.files;
      const imageUrls = imageFiles.map((file) => ({
        image: `/stations/${file.filename}`,
      }));
      const newProduct = new Product({
        ...req.body,
        images: imageUrls,
      });
      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Something went wrong while saving the product." });
    }
  }
);

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:name", async (req, res) => {
  try {
    const product = await Product.findOne({ name: req.params.name });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET ALL PRODUCT WITH 5 LIMIT when(?new=true)
router.get("/", async (req, res) => {
  const { new: isNew, ...query } = req.query;
  try {
    const products = isNew
      ? await Product.find().sort({ _id: -1 }).limit(5)
      : query
      ? await Product.find(query)
      : await Product.find();

    res.status(200).json({ products });
  } catch (err) {
    res.status(404).json(err);
  }
});

module.exports = router;
