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

router.post("/change-password", (req, res) => {});

module.exports = router;
