import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getEnrolled(req, res) {
  const { courseId } = req.body;
  const { userId } = req.user;
  console.log("User Id: ", userId, "Course Id: ", courseId);
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return res.status(404).json({
        message: "Cannot find the course you requested",
      });
    }
    console.log("Course: ", course);
    const isEnrolled = await prisma.enrollment.findFirst({
      where: {
        courseId: Number(courseId),
        userId: Number(userId),
      },
    });
    console.log("Is Enrolled", isEnrolled);
    if (isEnrolled) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in the course" });
    }

    // Step 3: Enroll the student in the course
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: Number(userId),
        courseId: Number(courseId),
        status: "enrolled",
      },
    });
    console.log("Enrollment", enrollment);
    return res.status(200).json({
      message: "Successfully enrolled in the course",
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment Error: ", error); // More detailed error log
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
        status: "enrolled",
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
  const { id } = req.params; // courseId from URL params
  const { userId } = req.user; // userId from the JWT token (from the authenticate middleware)

  try {
    // Check if the user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: Number(userId),
        courseId: Number(id), // Using `courseId` from `req.params.id`
        status: "enrolled",
      },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    // Fetch all sessions for the course
    const sessions = await prisma.session.findMany({
      where: {
        courseId: Number(id), // Using courseId to get the related sessions
      },
      include: {
        progress: {
          where: {
            enrollmentId: enrollment.id,
          },
        },
      },
    });

    // Calculate session progress
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

    // Return course progress (percentage)
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

// export async function markSessionAsCompleted(req, res) {
//   const { sessionId, courseId } = req.body;
//   const { userId } = req.user;

//   try {
//     // Check if the student is enrolled in the course
//     const enrollment = await prisma.enrollment.findFirst({
//       where: {
//         userId: Number(userId),
//         courseId: Number(courseId),
//         status: "enrolled",
//       },
//     });

//     if (!enrollment) {
//       return res.status(403).json({
//         message: "You are not enrolled in this course",
//       });
//     }

//     // Upsert progress (mark session as completed)
//     const progress = await prisma.progress.upsert({
//       where: {
//         // This is the unique identifier based on enrollmentId and sessionId
//         enrollmentId_sessionId: {
//           enrollmentId: enrollment.id,
//           sessionId: Number(sessionId),
//         },
//       },
//       update: {
//         isCompleted: true,
//         completionDate: new Date(),
//       },
//       create: {
//         enrollmentId: enrollment.id,
//         sessionId: Number(sessionId),
//         isCompleted: true,
//         completionDate: new Date(),
//       },
//     });

//     return res.status(200).json({
//       message: "Session marked as completed",
//       progress,
//     });
//   } catch (error) {
//     console.error("Error while updating progress:", error);
//     return res.status(500).json({
//       message: "Error while updating the progress",
//       error: error.message,
//     });
//   }
// }

// ! Modified Marksession completed for review section
export async function markSessionAsCompleted(req, res) {
  const { sessionId, courseId } = req.body;
  const { userId } = req.user;

  try {
    // Step 1: Check if the student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: Number(userId),
        courseId: Number(courseId),
        status: "enrolled", // Ensure the student is currently enrolled
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    // Step 2: Upsert progress (mark session as completed)
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

    // Step 3: Check if all sessions are completed
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

    // Step 4: If all sessions are completed, allow the student to review the course
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
