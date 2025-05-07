import express from "express";
import {
  createSession,
  getSessionsByCourse,
  updateSession,
  deleteSession,
} from "../controllers/session.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post(
  "/createSession",
  authenticateToken,
  authorizeRole(["instructor"]),
  createSession
);

router.get(
  "/getSessionsByCourse/:courseId",
  authenticateToken,
  getSessionsByCourse
);

router.put(
  "/updateSession/:id",
  authenticateToken,
  authorizeRole(["instructor"]),
  updateSession
);

router.delete(
  "/deleteSession/:id",
  authenticateToken,
  authorizeRole(["instructor"]),
  deleteSession
);
export default router;
