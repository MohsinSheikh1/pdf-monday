const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: String,
  apiKey: String
});

module.exports = mongoose.model("User", UserSchema);
