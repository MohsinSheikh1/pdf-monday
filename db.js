const mongoose = require("mongoose");
require("dotenv").config();

try {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    });
} catch (error) {
  console.log("Could not connect to MongoDB");
}

const db = mongoose.connection;

module.exports = db;
