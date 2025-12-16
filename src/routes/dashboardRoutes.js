// routes/dashboardRoutes.js
import express from "express";
import { protect } from "../middleware/userAuth.js";
import { roleOnly } from "../middleware/roleAuth.js";
import { getMyDashboard } from "../controllers/authController.js";

const router = express.Router();

router.get("/admin", protect, roleOnly("admin"), getMyDashboard);
router.get("/teacher", protect, roleOnly("teacher"), getMyDashboard);
router.get("/instructor", protect, roleOnly("instructor"), getMyDashboard);
router.get("/student", protect, roleOnly("student"), getMyDashboard);

export default router;
