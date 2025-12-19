// controllers/adminController.js
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import StudentMaster from "../models/studentMasterSchema.js";
import Course from '../models/course.js'
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

export const checkCourseExists = async (req, res) => {
  try {
    const { title, code } = req.query;

    if (!title && !code) {
      return res.status(400).json({
        success: false,
        message: "Provide either title or code to check"
      });
    }

    // Build dynamic query
    const query = {};
    if (title) query.title = title.trim();
    if (code) query.code = code.trim().toUpperCase();

    const course = await Course.findOne(query);

    return res.json({
      success: true,
      exists: !!course, // true or false
      course: course ? { id: course._id, title: course.title, code: course.code } : null
    });

  } catch (error) {
    console.error("CHECK COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const createCourse = async (req, res) => {
  try {
    const {
      title,
      code,
      subtitle,
      description,
      language,
      level,
      category,
      subCategory,
      thumbnail,
      promoVideoVimeoId,
      whatYouWillLearn,
      requirements
    } = req.body;

    if (!title || !code) {
      return res.status(400).json({ success: false, message: "Title and code required" });
    }

    const courseTitle = String(title).trim();
    const courseCode = String(code).trim().toUpperCase();

    const existing = await Course.findOne({
      $or: [
        { title: courseTitle },
        { code: courseCode }
      ]
    });


    if (existing) {
      return res.status(409).json({ success: false, message: "Course with same title or code already exists" });
    }

    const course = await Course.create({
      title: courseTitle ,
      code: courseCode,
      subtitle,
      description,
      language,
      level,
      category,
      subCategory,
      thumbnail,
      promoVideoVimeoId,
      whatYouWillLearn,
      requirements,
      isDraft: true,
      isPublished: false,
      isActive: true,
      createdBy: req.user._id
    });

    return res.status(201).json({ success: true, message: "Course created", course });

  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ---------- UPDATE / EDIT COURSE ---------- */
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const allowedFields = [
      "title",
      "code",
      "subtitle",
      "description",
      "language",
      "level",
      "category",
      "subCategory",
      "thumbnail",
      "promoVideoVimeoId",
      "whatYouWillLearn",
      "requirements",
      "isDraft",
      "isPublished",
      "isActive"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "code") {
          course.code = String(req.body.code).trim().toUpperCase();
        } else if (field === "title") {
          course.title = String(req.body.title).trim();
        } else {
          course[field] = req.body[field];
        }
      }
    }

    if (req.body.title || req.body.code) {
      const existing = await Course.findOne({
        $or: [
          req.body.title
            ? { title: String(req.body.title).trim() }
            : null,
          req.body.code
            ? { code: String(req.body.code).trim().toUpperCase() }
            : null
        ].filter(Boolean),
        _id: { $ne: course._id }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Title or code already exists"
        });
      }
    }

    await course.save();

    return res.json({
      success: true,
      message: "Course updated",
      course
    });

  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error);
    return res.status(500).json({
      sucess:false, message: error.message
    });
  }
};

/* ---------- DELETE COURSE (cascade delete lessons + content) ---------- */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Optionally: check if students are enrolled
    // if (course.totalStudents > 0) {
    //   return res.status(400).json({ success: false, message: "Cannot delete course with enrolled students" });
    // }

    await course.deleteOne(); // Mongoose deletes subdocuments automatically

    return res.json({ success: true, message: "Course deleted successfully" });

  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all course

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });

  } catch (error) {
    console.error("GET ALL COURSES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};

// get course by id

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(id).select("-__v");

    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error("GET COURSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course"
    });
  }
};

