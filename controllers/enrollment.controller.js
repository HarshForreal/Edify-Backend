import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getEnrolled(req, res) {
  const { courseId } = req.body;
  const { userId } = req.user;

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return res.status(404).json({
        message: "Cannot find the course you requested",
      });
    }

    // Check if the user is already enrolled and completed all sessions
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: Number(courseId),
        userId: Number(userId),
      },
    });

    if (enrollment) {
      // If the user is already enrolled then check if the course is completed
      if (enrollment.status === "completed") {
        return res
          .status(400)
          .json({ message: "You have already completed the course" });
      }
      return res
        .status(400)
        .json({ message: "You are already enrolled in the course" });
    }

    // Enroll the student in the course
    const enrollmentData = await prisma.enrollment.create({
      data: {
        userId: Number(userId),
        courseId: Number(courseId),
        status: "enrolled",
      },
    });

    return res.status(200).json({
      message: "Successfully enrolled in the course",
      enrollment: enrollmentData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while enrolling into the course",
      error: error.message,
    });
  }
}
export async function listOfEnrolledCourses(req, res) {
  const { userId } = req.user;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: Number(userId),
        status: {
          in: ["enrolled", "completed"],
        },
      },
      include: {
        course: true,
      },
    });
    if (enrollments.length === 0) {
      return res
        .status(404)
        .json({ message: "You are not enrolled into any courses" });
    }
    return res.status(201).json({
      enrollments,
    });
  } catch (error) {
    return res.status(501).json({
      message: "Error while fetching the enrolled courses",
    });
  }
}

export async function getCourseProgress(req, res) {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: Number(userId),
        courseId: Number(id),
      },
    });
    console.log("enrollment", enrollment);
    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    const sessions = await prisma.session.findMany({
      where: {
        courseId: Number(id),
      },
      include: {
        progress: {
          where: {
            enrollmentId: enrollment.id,
          },
        },
      },
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (session) =>
        session.progress.length > 0 && session.progress[0].isCompleted
    ).length;

    const progressPercentage = (completedSessions / totalSessions) * 100;
    const sessionDetails = sessions.map((session) => ({
      id: session.id,
      title: session.title,
      isCompleted:
        session.progress.length > 0 && session.progress[0].isCompleted,
    }));

    return res.status(200).json({
      courseId: id,
      totalSessions,
      completedSessions,
      progressPercentage,
      sessions: sessionDetails,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching course progress", error });
  }
}
export async function markSessionAsCompleted(req, res) {
  const { sessionId, courseId } = req.body;
  const { userId } = req.user;

  try {
    // Check if the student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: Number(userId),
        courseId: Number(courseId),
        status: "enrolled",
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    // Upsert progress (mark session as completed)
    const progress = await prisma.progress.upsert({
      where: {
        enrollmentId_sessionId: {
          enrollmentId: enrollment.id,
          sessionId: Number(sessionId),
        },
      },
      update: {
        isCompleted: true,
        completionDate: new Date(),
      },
      create: {
        enrollmentId: enrollment.id,
        sessionId: Number(sessionId),
        isCompleted: true,
        completionDate: new Date(),
      },
    });

    console.log("Session marked as completed:", progress);

    // Check if all sessions are completed
    const totalSessions = await prisma.session.count({
      where: { courseId: Number(courseId) },
    });

    const completedSessions = await prisma.progress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
    });

    console.log(
      `Course ${courseId}: ${completedSessions}/${totalSessions} sessions completed`
    );

    // If all sessions are completed, allow the student to review the course
    if (completedSessions === totalSessions && totalSessions > 0) {
      // Allow the student to review the course
      return res.status(200).json({
        message: "Session marked as completed. You can now review the course.",
        progress,
      });
    }

    return res.status(200).json({
      message: "Session marked as completed",
      progress,
    });
  } catch (error) {
    console.error("Error while updating progress:", error);
    return res.status(500).json({
      message: "Error while updating the progress",
      error: error.message,
    });
  }
}
