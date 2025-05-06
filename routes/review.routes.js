import express from "express";
import {
  addReview,
  getReviews,
} from "../controllers/review.controller.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Add a review (only after course completion and only for students)
router.post(
  "/:courseId/reviews",
  authenticateToken,
  authorizeRole(["student"]), // Only students can add reviews
  addReview
);

// Get reviews for a course (instructors and students can view)
router.get("/:courseId/reviews", authenticateToken, getReviews);

export default router;
