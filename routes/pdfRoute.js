const express = require("express");
const { createPDF, schedulePDF } = require("../controllers/pdfController");

const router = express.Router();

router.route("/pdf").get(createPDF);
router.route("/pdf/schedule").post(schedulePDF);

module.exports = router;
