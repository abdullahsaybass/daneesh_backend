import express from "express";
import { register, login, logout } from '../controllers/authController.js';

const authRoutes = express.Router();

// Routes
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export default authRoutes;
