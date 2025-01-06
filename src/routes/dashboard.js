const Banner = require("../models/Banner");
const { verifyTokenAndAdmin } = require("./verifyToken");
const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/banner"));
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
  upload.single("banner"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const newBanner = new Banner({
        image: `/banner/${req.file.filename}`,
      });
      const savedBanner = await newBanner.save();
      res.status(200).json(savedBanner);
    } catch (err) {
      console.error("Error while saving banner:", err);
      res
        .status(500)
        .json({ error: "An error occurred while saving the banner." });
    }
  }
);

// GET
router.get("/", async (req, res) => {
  try {
    const banner = await Banner.find();

    res.status(200).json({ banner });
  } catch (err) {
    res.status(404).json(err);
  }
});

module.exports = router;

// UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedBanner);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});
