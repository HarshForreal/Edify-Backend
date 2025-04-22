import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET; // Change this in the .env file in production

// Middleware to protect routes
function authenticateToken(req, res, next) {
  // Get token from the cookies
  const token = req.cookies.authToken;

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }
}

// Middleware to authorize user by role (e.g., 'instructor' or 'student')
function authorizeRole(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. You don't have permissions." });
    }
    next();
  };
}

export { authenticateToken, authorizeRole };
