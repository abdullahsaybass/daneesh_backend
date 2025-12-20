import mongoose from "mongoose";

/* ---------- CONTENT ---------- */
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["vimeo", "pdf"], required: true },
  vimeoVideoId: {
    type: String,
    required: function () { return this.type === "vimeo"; }
  },
  documentUrl: {
    type: String,
    required: function () { return this.type === "pdf"; }
  },
  duration: String, // optional
  isPreview: { type: Boolean, default: false }
});

/* ---------- MCQ ---------- */
const mcqQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], validate: v => v.length === 4 },
  correctAnswerIndex: { type: Number, min: 0, max: 3 }
});

/* ---------- CODING ---------- */
const codingQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  description: String,
  language: {
    type: String,
    enum: ["python", "java", "c", "cpp", "javascript"],
    required: true
  },
  starterCode: String,
  testCases: [{ input: String, output: String }]
});

/* ---------- EXAM ---------- */
const examSchema = new mongoose.Schema({
  title: String,
  mcqQuestions: [mcqQuestionSchema],
  codingQuestions: [codingQuestionSchema],
  passingScore: { type: Number, default: 50 }
});

/* ---------- LESSON ---------- */
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    contents: [contentSchema], // array of video/pdf
    order: { type: Number, required: true, min: 1 }, // for sorting lessons
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

/* ---------- COURSE ---------- */
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    code: { type: String, required: true, unique: true },
    language: { type: String, default: "English" },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
    category: String,
    subCategory: String,
    thumbnail: String,
    promoVideoVimeoId: String,
    whatYouWillLearn: [String],
    requirements: [String],
    lessons: [lessonSchema],
    finalExam: examSchema,
    isDraft: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratings: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Lesson = mongoose.model("Lesson", lessonSchema);
export const Course = mongoose.model("Course", courseSchema);