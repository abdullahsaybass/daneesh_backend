import express from "express";
import { protect } from "../middleware/userAuth.js";
import User from "../models/user.js";

const userRoutes = express.Router();

userRoutes.get("/profile", protect, async (req, res) => {
  try {
    // Make sure it's a student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch fresh student data from DB (optional)
    const student = await User.findById(req.user._id)
      .select("rollno name email department year createdAt");

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default userRoutes;


