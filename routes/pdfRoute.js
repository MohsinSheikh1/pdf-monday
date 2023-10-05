const express = require("express");
const { createPDF, schedulePDF } = require("../controllers/pdfController");

const router = express.Router();

router.route("/pdf").post(createPDF);
router.route("/pdf/schedule").post(schedulePDF);

module.exports = router;
