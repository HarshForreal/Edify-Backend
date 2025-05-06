// import express from "express";
// const router = express.Router();
// import {
//   signup,
//   login,
//   logout,
//   getCurrentUser,
// } from "../controllers/auth.controller.js";
// import { authenticateToken } from "../middlewares/auth.middleware.js";

// // Sign Up route
// router.post("/signup", signup);

// // Login route
// router.post("/login", login);

// // Logout route
// router.post("/logout", logout);

// // Current User route
// router.get("/current-user", authenticateToken, getCurrentUser);

// export default router; // Use default export

import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,
  getCurrentUser,
  googleLogin,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
// Sign Up route
router.post("/signup", signup);

// Login route
router.post("/google-login", googleLogin);
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Current User route
router.get("/current-user", authenticateToken, getCurrentUser);

export default router; // Use default export
