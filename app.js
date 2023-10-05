const express = require("express");
const pdfRoute = require("./routes/pdfRoute");
const userRoute = require("./routes/userRoute");

const app = express();

app.use(express.json());

app.use("/api", pdfRoute);
app.use("/api", userRoute);

module.exports = app;
