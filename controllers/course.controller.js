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
    return res.status(201).json({ courses });
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
