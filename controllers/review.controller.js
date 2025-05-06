import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function addReview(req, res) {
  const { rating, comment } = req.body;
  const { courseId } = req.params;
  const { userId } = req.user;

  if (!userId) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  try {
    // Ensure the course exists
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("Course details:", course);
    console.log("User ID:", userId);

    // Get enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    });

    console.log("Enrollment status:", enrollment);

    if (!enrollment) {
      return res
        .status(400)
        .json({
          message: "You must be enrolled in the course before reviewing.",
        });
    }

    // If enrollment is not completed, check progress manually
    if (enrollment.status !== "completed") {
      // Count sessions
      const allSessions = await prisma.session.count({
        where: { courseId: Number(courseId) },
      });

      // Count completed sessions
      const completedSessions = await prisma.progress.count({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
        },
      });

      console.log(
        `Course progress: ${completedSessions}/${allSessions} sessions completed`
      );

      // Update enrollment if needed
      if (completedSessions === allSessions && allSessions > 0) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "completed" },
        });
        console.log("Enrollment status updated to completed.");
      } else {
        return res.status(400).json({
          message:
            "You must complete all sessions in the course before reviewing.",
        });
      }
    }

    // Check for existing review
    try {
      const existingReview = await prisma.review.findFirst({
        where: {
          studentId: Number(userId),
          courseId: Number(courseId),
        },
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this course" });
      }
    } catch (error) {
      console.error("Error checking existing review:", error);
      // Continue anyway to see if we can create a review
    }

    // Create the review
    try {
      const review = await prisma.review.create({
        data: {
          rating: Number(rating),
          comment: comment || "",
          courseId: Number(courseId),
          studentId: Number(userId),
        },
      });

      return res.status(201).json({
        message: "Review submitted successfully",
        review,
      });
    } catch (error) {
      console.error("Error creating review entry:", error);
      return res.status(500).json({
        message: `Failed to create review: ${error.message}`,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error in addReview:", error);
    return res.status(500).json({
      message: "Error while submitting the review",
      error: error.message,
    });
  }
}
// Get reviews for a course
export const getReviews = async (req, res) => {
  const { courseId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        courseId: parseInt(courseId),
      },
    });
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews", error });
  }
};
