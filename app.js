const express = require("express");
const cors = require("cors");
const pdfRoute = require("./routes/pdfRoute");
const userRoute = require("./routes/userRoute");

const app = express();
// app.use(cors());

app.use(express.json());

app.use(
  "/api",
  cors({
    origin: "https://xportpdfmonday.netlify.app",
    optionsSuccessStatus: 200,
  }),
  pdfRoute
);
app.use("/api", cors(), userRoute);
app.use("/page", cors(), express.static(`${__dirname}/public`));

module.exports = app;
