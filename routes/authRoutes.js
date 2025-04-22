// routes/authRoutes.js
import express from "express";
const router = express.Router();
// routes/authRoutes.js
import { signup, login } from "../controllers/auth.controller.js"; // Correct file name

// Sign Up route
router.post("/signup", signup);

// Login route
router.post("/login", login);

export default router; // Use default export
