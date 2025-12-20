// controllers/adminController.js
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import StudentMaster from "../models/studentMasterSchema.js";
import mongoose from "mongoose";
// ----------------------
// Admin Dashboard
// ----------------------
export const adminDashboard = (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    admin: req.user,
  });
};



export const createUser = async (req, res) => {
  try {
    const { role, name, email, password, rollno, department, year } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    if (!["student", "teacher", "instructor"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    let userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      role
    };

    if (role === "student") {
      if (!rollno || !department || year === undefined) {
        return res.status(400).json({
          success: false,
          message: "Student rollno, department and year required"
        });
      }

      const validRoll = await StudentMaster.findOne({ rollno });
      if (!validRoll) {
        return res.status(400).json({
          success: false,
          message: "Invalid university roll number"
        });
      }

      userData = { ...userData, rollno, department, year };
    }

    const user = await User.create(userData);

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ success: true, user: safeUser });

  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ---------- GET ALL USERS ---------- */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/* ---------- GET USER BY ID ---------- */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password -__v");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

/* ---------- UPDATE USER ---------- */
export const editUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, password, rollno, department, year } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (user.role === "student") {
      if (rollno !== undefined) user.rollno = rollno;
      if (department !== undefined) user.department = department;
      if (year !== undefined) user.year = year;
    }

    await user.save();

    const { password: _, ...safeUser } = user.toObject();
    res.json({ success: true, user: safeUser });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ---------- DELETE USER ---------- */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Admin cannot be deleted" });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: `${user.role} deleted successfully`
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// ----------------------check Course -------------------//



// create lesson under course

// create course

