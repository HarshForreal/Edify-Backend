import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

// Sign Up route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Current User
router.get("/current-user", authenticateToken, getCurrentUser);

export default router; // Use default export
