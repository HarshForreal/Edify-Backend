import express from "express";
import {
  createCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
} from "../controllers/course.controller.js";

import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// create course
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["instructor"]),
  createCourse
);

//  get all course
router.get("/", authenticateToken, getAllCourse);

router.get(
  "/getInstructorCourses",
  authenticateToken,
  authorizeRole(["instructor"]),
  getInstructorCourses
);

// get course by id
router.get("/:id", authenticateToken, getCourseById);

// update course
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["instructor"]),
  updateCourse
);

// delete course
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["instructor"]),
  deleteCourse
);

export default router;
