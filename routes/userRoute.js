const express = require("express");
const {
  getUser,
  createUser,
  handleEvent,
} = require("../controllers/userController");

const router = express.Router();

router.route("/user").get(getUser);
router.route("/user").post(createUser);
// router.route("/user/event").post(handleEvent);

module.exports = router;
