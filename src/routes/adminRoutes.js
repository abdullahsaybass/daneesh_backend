import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import StudentMaster from "../models/studentMasterSchema.js";

import { protect } from "../middleware/userAuth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { roleOnly } from "../middleware/roleAuth.js";
import {
  adminDashboard,
  createStaff,
  addUser,
  editUser,
  deleteUser
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

router.use(protect, adminOnly);

router.get("/dashboard", adminDashboard);
router.post("/create-staff", createStaff);
router.post("/add-user", addUser);
router.put("/edit-user/:id", editUser);
router.delete("/delete-user/:id", deleteUser);

/* ================= BULK UPLOAD STUDENTS ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/admin/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/students/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

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
      message: "Bulk upload/update completed",
      stats: { created, updated }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= TEACHER ROUTES ================= */
router.get("/teacher/dashboard", protect, roleOnly("teacher"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Teacher",
    user: req.user
  });
});

/* ================= INSTRUCTOR ROUTES ================= */
router.get("/instructor/dashboard", protect, roleOnly("instructor"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Instructor",
    user: req.user
  });
});

export default router;
