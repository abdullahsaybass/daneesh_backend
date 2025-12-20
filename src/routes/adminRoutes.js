import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import StudentMaster from "../models/studentMasterSchema.js";

import { protect } from "../middleware/userAuth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { roleOnly } from "../middleware/roleAuth.js";

import {
  adminDashboard,
  createUser,
  editUser,
  deleteUser,
  getAllUsers,
  getUserById
} from "../controllers/adminController.js";
import {
  createCourse,
  checkCourseExists,
  updateCourse,
  getAllCourses,
  getCourseById,
  deleteCourse
} from "../controllers/courseController.js";

import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessons,
  getSingleLesson
} from "../controllers/lessonController.js";

const router = express.Router();

/* ================= ADMIN MIDDLEWARE ================= */
router.use(protect, adminOnly);

/* ================= DASHBOARD ================= */
router.get("/dashboard", adminDashboard);

/* ================= USER MANAGEMENT ================= */
router.post("/create-user", createUser);
router.put("/edit-user/:id", editUser);
router.delete("/delete-user/:id", deleteUser);
router.get("/user", getAllUsers);
router.get("/user/:id", getUserById);
router.get("/course/check", checkCourseExists);

// Get / Update / Delete course
router.post("/course", createCourse);
router.get("/course", getAllCourses)
router.get("/course/:courseId", getCourseById);
router.put("/course/:courseId", updateCourse);
router.delete("/course/:courseId", deleteCourse);

/* ================= LESSON MANAGEMENT (ADMIN ONLY) ================= */

router.post("/course/:courseId/lessons", createLesson);
router.get("/course/:courseId/lessons", getLessons);
router.put("/course/:courseId/lessons/:lessonId", updateLesson);
router.delete("/course/:courseId/lessons/:lessonId", deleteLesson);
router.get("/course/:courseId/lessons/:lessonId", getSingleLesson);

/* ================= BULK UPLOAD STUDENTS ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/admin/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/students/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let created = 0;
    let updated = 0;

    for (const item of data) {
      const { rollno, name, email, department, year } = item;
      if (!rollno || !name || !email) continue;

      const existing = await StudentMaster.findOne({ rollno });

      if (existing) {
        await StudentMaster.updateOne(
          { rollno },
          { name, email, department, year }
        );
        updated++;
      } else {
        await StudentMaster.create({ rollno, name, email, department, year });
        created++;
      }
    }

    res.json({
      success: true,
      message: "Bulk upload completed",
      stats: { created, updated }
    });

  } catch (error) {
    console.error("BULK UPLOAD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= TEACHER ROUTES ================= */
router.get("/teacher/dashboard", roleOnly("teacher"), (req, res) => {
  res.json({ success: true, message: "Welcome Teacher", user: req.user });
});

/* ================= INSTRUCTOR ROUTES ================= */
router.get("/instructor/dashboard", roleOnly("instructor"), (req, res) => {
  res.json({ success: true, message: "Welcome Instructor", user: req.user });
});

export default router;
