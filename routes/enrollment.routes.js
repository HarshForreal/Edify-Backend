import express from "express";

import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";
import {
  getCourseProgress,
  getEnrolled,
  listOfEnrolledCourses,
  markSessionAsCompleted,
} from "../controllers/enrollment.controller.js";

const router = express.Router();
router.use(authenticateToken);
router.use(authorizeRole(["student"]));
router.post("/enrollInCourse", getEnrolled);
router.get("/getListOfEnrollments", listOfEnrolledCourses);
router.get("/courseProgress/:id", getCourseProgress);
router.post("/markSessionCompleted", markSessionAsCompleted);

export default router;
