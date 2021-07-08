const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const resultSchema = new Schema({
    userId: { type: String, default: null, ref: "user", required: true },
    examId: { type: String, default: null, required: true },
    correct: { type: String, default: null, required: true },
    wrong: { type: String, default: null, required: true },
    skip: { type: String, default: null, required: true }

});
module.exports = mongoose.model("result", resultSchema)