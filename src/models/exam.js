// // models/Exam.js
// import mongoose from "mongoose";

// const questionSchema = new mongoose.Schema({
//   question: String,
//   options: [String],
//   correctAnswer: Number,
//   marks: Number
// });

// const examSchema = new mongoose.Schema({
//   course: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Course",
//     required: true
//   },

//   moduleId: {
//     type: mongoose.Schema.Types.ObjectId,
//     default: null // null = final exam
//   },

//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   questions: [questionSchema],
//   totalMarks: Number,

//   published: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// export default mongoose.model("Exam", examSchema);
