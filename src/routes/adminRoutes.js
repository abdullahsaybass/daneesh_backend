import express from "express";
import { protect } from "../middleware/userAuth.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    admin: req.user,
  });
});

export default router;
