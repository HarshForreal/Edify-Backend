import express from "express";
import cookieParser from "cookie-parser"; // Import cookie-parser
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import commentRoutes from "./routes/comment.routes.js";
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/enroll", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes); 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
