// controllers/adminController.js
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import StudentMaster from "../models/studentMasterSchema.js";

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

// ----------------------
// Create Staff (teacher/instructor)
// ----------------------
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!["teacher", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent creating admin accidentally
    if (role === "admin") {
      return res.status(403).json({ message: "Cannot create admin" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({ success: true, message: `${role} created`, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// Add User (student, teacher, instructor)
// ----------------------
export const addUser = async (req, res) => {
  try {
    const { role, name, email, password, rollno, department, year } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!["student", "teacher", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "student") {
      if (!rollno || !department || !year) {
        return res.status(400).json({ message: "Student rollno, department, year required" });
      }

      const masterStudent = await StudentMaster.findOne({ rollno });
      if (!masterStudent) {
        return res.status(400).json({ message: "Invalid university roll number" });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const userData = { name, email, password: hashed, role };

    if (role === "student") {
      userData.rollno = rollno;
      userData.department = department;
      userData.year = year;
    }

    const user = await User.create(userData);
    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// Edit User
// ----------------------
export const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password, rollno, department, year } = req.body;

    
    if (name) user.name = name;
    if (email) user.email = email;

    if (password) user.password = await bcrypt.hash(password, 10);

    
    if (user.role === "student") {
      if (rollno) user.rollno = rollno;
      if (department) user.department = department;
      if (year) user.year = year;
    }

    await user.save();

    const { password: _, ...safeUser } = user.toObject();
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// Delete User
// ----------------------
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Admin cannot be deleted" });

    await user.deleteOne();
    res.json({ success: true, message: `${user.role} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
