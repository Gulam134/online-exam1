const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const signupSchema = new Schema({
  username: { type: String, required: true, default: null },
  email: { type: String, required: true },
  password: { type: String, required: true }
});
module.exports = mongoose.model("signup", signupSchema);