const express = require("express");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const router = express.Router();

router.route("/accountSlug").post((req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, process.env.CLIENT_SECRET);
  if (decoded) {
    console.log("decoded");
    res.status(200).json({
      accountSlug: decoded.dat.slug,
    });
  } else {
    console.log("not decoded");
    res.status(500).json({
      message: "Error",
    });
  }
});

router.route("/checkToken").post((req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, process.env.CLIENT_SECRET);
  if (decoded) {
    // console.log("decoded");
    res.status(200).json({
      valid: true,
    });
  } else {
    console.log("not decoded");
    res.status(500).json({
      message: "Error",
    });
  }
});
// router.route("/user").post(createUser);

module.exports = router;
