import express from "express";
import cookieParser from "cookie-parser"; // Import cookie-parser
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
dotenv.config();

const app = express();

// Use cookie-parser middleware to parse cookies
app.use(cookieParser());

// Enable CORS with credentials for cross-origin requests
app.use(
  cors({
    // frontend url
    origin: "http://localhost:5173",
    // allow cookies to be sent which will have token
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/enroll", enrollmentRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
