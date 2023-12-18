const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  account_id: { type: String, required: [true, "Account ID is required"] },
  plan_id: { type: String, required: [true, "Plan ID is required"] },
  renewal_date: { type: String },
  exports_remaining: {
    type: Number,
    required: [true, "Exports remaining are required"],
  },
});

module.exports = mongoose.model("Account", AccountSchema);
