// models/User.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    rollno: { type: Number, required: true, unique: true },

    password: {
      type: String,
      required: true,
      select: false
    },

    email: {
      type: String,
      default: "student"
    },

    resetOtp: String,
    resetOtpExpiry: Date
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", schema);
