const app = require("./app");
const port = process.env.PORT || 5000;
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
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    });
} catch (error) {
  console.log("Could not connect to MongoDB");
}

// const db = mongoose.connection;
