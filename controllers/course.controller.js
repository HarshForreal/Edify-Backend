import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createCourse(req, res) {
  const { title, description, category, videoUrl } = req.body;
  const { userId } = req.user;
  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        category,
        videoUrl,
        instructorId: userId,
      },
    });
    return res.status(201).json({
      message: "Course created succesfully",
      course: newCourse,
    });
  } catch (error) {
    return res.json({
      message: "Error while creating course",
      Error: error,
    });
  }
}

export async function getAllCourse(req, res) {
  try {
    const courses = await prisma.course.findMany();
    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching all courses",
      error,
    });
  }
}

export async function getCourseById(req, res) {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });
    if (!course) {
      return res.status(404).json({ message: "unable to find the course" });
    } else {
      return res.status(200).json({ course });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching course", error });
  }
}

export async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, description, category, videoUrl } = req.body;
  const { userId } = req.user;
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });
    if (!course) {
      return res.status(404).json({
        message: "No Book Found",
      });
    }
    if (course.instructorId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this course" });
    }
    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      date: { title, description, category, videoUrl },
    });
    return res.status(201).json({
      message: "Course is updated successfully",
      course: updateCourse,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating course", Error: error });
  }
}

export async function deleteCourse(req, res) {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.instructorId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this course",
      });
    }
    await prisma.course.delete({
      where: { id: parseInt(id) },
    });
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error while deleting the course",
      error: error.message,
    });
  }
}

export async function getInstructorCourses(req, res) {
  const { userId, role } = req.user;
  if (role !== "instructor") {
    return res.status(403).json({
      message: "You are not authorized to view instructor's courses",
    });
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: userId,
      },
    });

    if (courses.length === 0) {
      return res.status(404).json({
        message: "No courses found for this instructor",
      });
    }

    return res.status(200).json({
      message: "Courses fetched successfully",
      courses,
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return res.status(500).json({
      message: "Error while fetching instructor's courses",
      error: error.message,
    });
  }
}
