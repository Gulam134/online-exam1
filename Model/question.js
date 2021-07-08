const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const questionSchema = new Schema({
    examId: { type: String, default: null, ref: "exam" },
    qNo: { type: String, default: null, required: true },
    question: { type: String, default: null, required: true },
    optionA: { type: String, default: null, required: true },
    optionB: { type: String, default: null, required: true },
    optionC: { type: String, default: null, required: true },
    optionD: { type: String, default: null, required: true },
    correctOption: { type: String, default: null, required: true },

});
module.exports = mongoose.model("question", questionSchema)