import express from "express";
import {
  createCourse,
  getAllCourse,
  getCourseById,
} from "../controllers/course.controller.js";

import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();
// endpoint to create course
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["instructor"]),
  createCourse
);
// endpoint to get all course
router.get("/", authenticateToken, getAllCourse);
// endpoint to get course by id
router.get("/:id", authenticateToken, getCourseById);
export default router;
