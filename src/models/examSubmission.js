// models/ExamSubmission.js
import mongoose from "mongoose";

const examSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    examType: {
      type: String,
      enum: ["module", "final"],
      required: true
    },

    moduleTitle: String, // only for module exam

    answers: [
      {
        questionIndex: Number,
        selectedOption: Number
      }
    ],

    score: Number,

    graded: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("ExamSubmission", examSubmissionSchema);
