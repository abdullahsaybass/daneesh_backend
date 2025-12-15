import User from "../models/user.js";

// controllers/userController.js
export const getMyProfile = async (req, res) => {
  try {
    // req.user is attached by protect middleware
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await User.findById(req.user._id)
      .select("rollno name email department year createdAt");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
