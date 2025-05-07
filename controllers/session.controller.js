import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createSession(req, res) {
  const { title, description, videoUrl, courseId } = req.body;
  const { userId } = req.user;
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
      },
    });
    if (!course) {
      return res.status(404).json({ message: "Course not Found" });
    }
    if (course.instructorId !== userId) {
      return res.status(403).json({
        message: "Your are not authorized to add the session in this course",
      });
    }
    const newSession = await prisma.session.create({
      data: {
        title,
        description,
        videoUrl,
        courseId: parseInt(courseId),
      },
    });
    return res
      .status(201)
      .json({ message: "Session created succesfully", newSession });
  } catch (error) {
    res.status(501).json({
      message: "Error while creating session",
      Error: error,
    });
  }
}

export async function getSessionsByCourse(req, res) {
  const { courseId } = req.params;
  const { userId } = req.user;

  try {
    // Fetch sessions for the course
    const sessions = await prisma.session.findMany({
      where: {
        courseId: Number(courseId),
      },
      include: {
        progress: {
          where: {
            enrollment: {
              userId: Number(userId),
            },
          },
        },
      },
    });

    // Map sessions to include completion status
    const sessionsWithCompletionStatus = sessions.map((session) => {
      const isCompleted = session.progress && session.progress.isCompleted;
      return {
        ...session,
        isCompleted: isCompleted || false, // default to false if no progress data exists
      };
    });

    if (sessionsWithCompletionStatus.length === 0) {
      return res.status(404).json({
        message: `No Sessions found for this Course`,
      });
    }

    res.status(200).json({
      message: `Session found for course ${courseId}`,
      sessions: sessionsWithCompletionStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sessions",
      error,
    });
  }
}

export async function updateSession(req, res) {
  const { id } = req.params;
  const { userId } = req.user;
  const { title, description, videoUrl } = req.body;

  try {
    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: { course: true },
    });

    if (!session) {
      return res.status(404).json({
        message: `Session with ID ${id} not found`,
      });
    }

    // Check if the logged-in user is the instructor of the course
    if (session.course.instructorId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this session",
      });
    }

    // Update the session data
    const updatedSession = await prisma.session.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        videoUrl,
      },
    });

    // Return the updated session data in the response
    return res.status(200).json({
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      message: "Error while updating session",
      error: error.message, // Return the error message for debugging
    });
  }
}

export async function deleteSession(req, res) {
  const { id } = req.params;
  try {
    await prisma.session.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      message: "Session deleted succesfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete the session",
    });
  }
}
