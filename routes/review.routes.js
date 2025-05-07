import express from "express";
import { addReview, getReviews } from "../controllers/review.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Add a review
router.post(
  "/:courseId/reviews",
  authenticateToken,
  authorizeRole(["student"]),
  addReview
);

// Get reviews for a course
router.get("/:courseId/reviews", authenticateToken, getReviews);

export default router;
