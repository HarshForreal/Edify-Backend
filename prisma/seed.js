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

  // Create a sample course
  const course = await prisma.course.create({
    data: {
      title: "Introduction to JavaScript",
      description: "This is a beginner-level course for learning JavaScript.",
      category: "Programming",
      videoUrl: "https://youtube.com/sampleVideo", // Example YouTube video link
      instructorId: instructor.id, // Link course to the instructor
    },
  });

  // Create sample sessions for the course
  const session1 = await prisma.session.create({
    data: {
      title: "Session 1: Basics of JavaScript",
      description: "Learn about variables, data types, and syntax.",
      videoUrl: "https://youtube.com/sampleSession1",
      courseId: course.id, // Link session to the course
    },
  });

  const session2 = await prisma.session.create({
    data: {
      title: "Session 2: Functions and Loops",
      description: "Learn about functions and loops in JavaScript.",
      videoUrl: "https://youtube.com/sampleSession2",
      courseId: course.id, // Link session to the course
    },
  });

  // Create an enrollment for the student
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id, // Link the enrollment to the student
      courseId: course.id, // Link the enrollment to the course
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
