import express from "express";
const router = express.Router();
import { signup, login, logout } from "../controllers/auth.controller.js";

// Sign Up route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

export default router; // Use default export
