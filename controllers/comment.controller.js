import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const addComment = async (req, res) => {
  const { content } = req.body;
  const { sessionId } = req.params;
  const { userId } = req.user;

  try {
    console.log("Received content:", content);
    console.log("Session ID:", sessionId);
    console.log("Student ID:", userId);

    const comment = await prisma.comment.create({
      data: {
        content,
        session: {
          connect: { id: parseInt(sessionId) },
        },
        student: {
          connect: { id: userId },
        },
      },
    });

    console.log("Created Comment:", comment);
    return res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Error creating comment", error });
  }
};

// Get comments for a session
export const getComments = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        sessionId: parseInt(sessionId),
      },
    });
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching comments", error });
  }
};
