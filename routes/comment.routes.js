import express from "express";
import {
  addComment,
  getComments,
} from "../controllers/comment.controller.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Add a comment to a session (only students can comment)
router.post(
  "/:sessionId/comments",
  authenticateToken,
  authorizeRole(["student"]), // Only students can add comments
  addComment
);

// Get comments for a session (instructors and students can view)
router.get("/:sessionId/comments", authenticateToken, getComments);

export default router;
