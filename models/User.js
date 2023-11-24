const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: { type: String, required: [true, "User ID is required"] },
  apiKey: { type: String, required: [true, "API key is required"] },
  account_id: { type: String, required: [true, "Account ID is required"] },
});

module.exports = mongoose.model("User", UserSchema);
