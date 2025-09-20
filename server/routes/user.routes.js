const express = require("express");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

router.get("/me", (req, res) => {
  res.status(200).json({
    message: "User retrieved",
    user: req.user,
  });
});

router.post("/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    await User.changePassword(req.user._id, oldPassword, newPassword);

    res.json({ message: "Password changed successfully" }); //200 default status code
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
