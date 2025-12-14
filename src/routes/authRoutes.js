import express from "express";
import { register, login, logout,sendResetOtp,resetPassword } from '../controllers/authController.js';

const authRoutes = express.Router();

// Routes
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/send-reset-otp", sendResetOtp);
authRoutes.post("/reset-password", resetPassword);


export default authRoutes;
