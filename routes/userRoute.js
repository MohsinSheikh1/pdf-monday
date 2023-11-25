const express = require("express");
const { getUser, createUser } = require("../controllers/userController");

const router = express.Router();

router.route("/user").get(getUser);
router.route("/user").post(createUser);

module.exports = router;
