const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { verifyTokenAndAdmin } = require("./verifyToken");
const env = require("../lib/env");

const { PASS_SEC, JWT_SEC } = env;
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email and password are required.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json("Invalid email or password.");
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, PASS_SEC);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json("Invalid email or password.");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password: _, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error.");
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json("All fields are required.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json("Email is already registered.");
    }

    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      PASS_SEC
    ).toString();

    const newUser = new User({
      username,
      email,
      password: encryptedPassword,
    });

    const savedUser = await newUser.save();

    const { password: _, ...userDetails } = savedUser._doc;
    res.status(201).json(userDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error.");
  }
});

router.get("/admin", verifyTokenAndAdmin, async (req, res) => {
  try {
    res.status(200).json(true);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error.");
  }
});

module.exports = router;
