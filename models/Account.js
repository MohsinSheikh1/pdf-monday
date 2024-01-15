const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  account_id: { type: String, required: [true, "Account ID is required"] },
  plan_id: { type: String },
  renewal_date: { type: String },
  exports_remaining: {
    type: Number,
  },
});

module.exports = mongoose.model("Account", AccountSchema);
