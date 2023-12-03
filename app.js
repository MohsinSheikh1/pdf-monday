const express = require("express");
const cors = require("cors");
const pdfRoute = require("./routes/pdfRoute");
const userRoute = require("./routes/userRoute");
const accountRoute = require("./routes/accountRoute");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api", pdfRoute);
app.use("/api", userRoute);
app.use("/page", express.static(`${__dirname}/public`));
app.use("/api", accountRoute);

module.exports = app;
