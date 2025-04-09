const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyTokenAndAdmin } = require("./verifyToken");
const multer = require("multer");
const cloudinary = require("../lib/cloudinary");

// Use memory storage to handle files in memory before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Helper to upload to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder: "stations", public_id: filename },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });
};

// CREATE PRODUCT
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("images"),
  async (req, res) => {
    try {
      const imageFiles = req.files;

      // Upload each image to Cloudinary
      const uploadPromises = imageFiles.map((file) =>
        uploadToCloudinary(file.buffer, file.originalname)
      );

      const results = await Promise.all(uploadPromises);

      const imageUrls = results.map((result) => ({
        image: result.secure_url,
      }));

      const newProduct = new Product({
        ...req.body,
        images: imageUrls,
      });

      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Image upload or product save failed." });
    }
  }
);

// UPDATE PRODUCT
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err); // Log error to help with debugging
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE PRODUCT
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET PRODUCT BY NAME
router.get("/find/:name", async (req, res) => {
  try {
    const product = await Product.findOne({ name: req.params.name });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PRODUCT BY ID
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL PRODUCTS
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
