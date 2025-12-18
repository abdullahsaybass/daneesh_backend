import express from "express";
import { register, login, logout,sendResetOtp,resetPassword,me } from '../controllers/authController.js';
import { protect } from "../middleware/userAuth.js";

const authRoutes = express.Router();

// Routes
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/send-reset-otp", sendResetOtp);
authRoutes.post("/reset-password", resetPassword);
authRoutes.get("/me", protect, me);

export default authRoutes;
