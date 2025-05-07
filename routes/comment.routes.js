import express from "express";
import { addComment, getComments } from "../controllers/comment.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();
// Add comment for a session
router.post(
  "/:sessionId/comments",
  authenticateToken,
  authorizeRole(["student"]),
  addComment
);

// Get comments for a session
router.get("/:sessionId/comments", authenticateToken, getComments);

export default router;
