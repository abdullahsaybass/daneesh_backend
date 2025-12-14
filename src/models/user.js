// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  rollno: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  department: String,
  year: Number,
  password: { type: String, required: true, select: false },
  resetOtp: String,
  resetOtpExpiryAt: Date
}, { timestamps: true });

export default mongoose.model("User", userSchema);
