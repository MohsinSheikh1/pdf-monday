const express = require("express");
const cors = require("cors");
const pdfRoute = require("./routes/pdfRoute");
const userRoute = require("./routes/userRoute");
const accountRoute = require("./routes/accountRoute");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");

const app = express();

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
app.use(cors());

app.use(express.json());

//Data Sanitization
app.use(mongoSanitize());

//Data sanitize
app.use(xss());

app.use("/api", pdfRoute);
app.use("/api", userRoute);
app.use("/page", express.static(`${__dirname}/public`));
app.use("/api", accountRoute);

module.exports = app;
