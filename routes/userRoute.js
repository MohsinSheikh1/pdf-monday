const express = require("express");
const { getUser, createUser } = require("../controllers/userController");

const router = express.Router();

router.route("/user/:id").get(getUser);
router.route("/user").post(createUser);

module.exports = router;
