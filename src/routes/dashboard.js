const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../lib/cloudinary");
const { verifyTokenAndAdmin } = require("./verifyToken");
const { Readable } = require("stream");
const Banner = require("../models/Banner");

// Cloudinary Storage Setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "banners",
        public_id: filename,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    bufferToStream(buffer).pipe(stream);
  });
}

// CREATE Banner (Single Image Upload)
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("banner"), // Single file upload, adjust field name as necessary
  async (req, res) => {
    try {
      const { file } = req;
      const { authorization } = req.headers; // Extract Authorization header

      // If no file is uploaded, return error
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // If no access token or invalid token, return error
      if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized user" });
      }

      const accessToken = authorization.split(" ")[1]; // Extract the token

      // If the token is missing or invalid, throw an error
      if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized user" });
      }

      // Upload the image to Cloudinary
      const uploadedImage = await uploadToCloudinary(
        file.buffer,
        file.originalname
      );
      const imageUrl = uploadedImage.secure_url;

      // Create a new banner entry
      const newBanner = new Banner({
        image: imageUrl,
        ...req.body, // other data from request body
      });

      // Save to the database
      const savedBanner = await newBanner.save();
      res.status(200).json(savedBanner);
    } catch (err) {
      console.error("ERROR:", err);
      res.status(500).json({ error: err.message || "Unknown error" });
    }
  }
);

// GET All Banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ banners });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch banners." });
  }
});

// UPDATE Banner (with optional new image upload)
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("banner"), // Single file upload, adjust field name as necessary
  async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found." });
      }

      // If a new file is uploaded, delete the old one from Cloudinary
      if (req.file) {
        const oldPublicId = banner.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`banners/${oldPublicId}`);
        // Upload the new image to Cloudinary
        const uploadedImage = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        req.body.image = uploadedImage.secure_url; // set new image path
      }

      // Update banner with the new image URL or other fields
      const updatedBanner = await Banner.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.status(200).json(updatedBanner);
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: "Failed to update banner." });
    }
  }
);
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json("Banner has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
