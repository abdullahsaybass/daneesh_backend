import express from "express";
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
// Protect ALL admin routes at once
router.use(protect, adminOnly);

router.get("/dashboard", adminDashboard);
router.post("/create-staff", createStaff);
router.post("/add-user", addUser);
router.put("/edit-user/:id", editUser);
router.delete("/delete-user/:id", deleteUser);

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
