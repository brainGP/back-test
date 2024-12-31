const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { verifyTokenAndAdmin } = require("./verifyToken");
const env = require("../lib/env");

const { PASS_SEC, JWT_SEC } = env;

// НЭВТРЭХ (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Имэйл болон нууц үг шаардлагатай.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json("Имэйл эсвэл нууц үг буруу байна.");
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, PASS_SEC);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json("Имэйл эсвэл нууц үг буруу байна.");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password: _, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch {
    res.status(500).json("Дотоод серверийн алдаа.");
  }
});

// БҮРТГҮҮЛЭХ (Register)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json("Бүх талбаруудыг бөглөх шаардлагатай.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json("Имэйл хаяг аль хэдийн бүртгэгдсэн.");
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
  } catch {
    res.status(500).json("Дотоод серверийн алдаа.");
  }
});

router.get("/admin", verifyTokenAndAdmin, async (req, res) => {
  try {
    res.status(200).json(true);
  } catch {
    res.status(500).json("Дотоод серверийн алдаа.");
  }
});

module.exports = router;
