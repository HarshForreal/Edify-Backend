import express from "express";
import cookieParser from "cookie-parser"; // Import cookie-parser
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // Adjust as needed
import courseRoutes from "./routes/courseRoutes.js"; // Adjust as needed

dotenv.config();

const app = express();

// Use cookie-parser middleware to parse cookies
app.use(cookieParser());

// Enable CORS with credentials for cross-origin requests
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust if using a different frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

// Use other middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
