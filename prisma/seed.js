// prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create sample users (instructors and students)
  const instructor = await prisma.user.create({
    data: {
      email: "instructor@example.com",
      password: "hashedPassword123", // You would hash this password
      role: "instructor",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      password: "hashedPassword123", // You would hash this password
      role: "student",
    },
  });

  const course = await prisma.course.create({
    data: {
      title: "Introduction to JavaScript",
      description: "This is a beginner-level course for learning JavaScript.",
      category: "Programming",
      videoUrl: "https://youtube.com/sampleVideo",
      instructorId: instructor.id,
    },
  });

  // Create sample sessions for the course
  const session1 = await prisma.session.create({
    data: {
      title: "Session 1: Basics of JavaScript",
      description: "Learn about variables, data types, and syntax.",
      videoUrl: "https://youtube.com/sampleSession1",
      courseId: course.id,
    },
  });

  const session2 = await prisma.session.create({
    data: {
      title: "Session 2: Functions and Loops",
      description: "Learn about functions and loops in JavaScript.",
      videoUrl: "https://youtube.com/sampleSession2",
      courseId: course.id,
    },
  });

  // Create an enrollment for the student
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: "enrolled",
    },
  });

  // Create progress data for the student
  await prisma.progress.create({
    data: {
      enrollmentId: enrollment.id,
      sessionId: session1.id,
      isCompleted: false,
    },
  });

  await prisma.progress.create({
    data: {
      enrollmentId: enrollment.id,
      sessionId: session2.id,
      isCompleted: false,
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
