// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  rollno: {
    type: String,
    unique: true,
    sparse: true   // students have it, admins don’t
  },

  name: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  department: String,
  year: Number,

  password: {
    type: String,
    required: true,
    select: false
  },

  resetOtp: String,
  resetOtpExpiryAt: Date,

  role: {
    type: String,
    enum: ["student", "admin", "teacher", "instructor"],
    default: "student"
  }
  
}, { timestamps: true });



export default mongoose.model("User", userSchema);
