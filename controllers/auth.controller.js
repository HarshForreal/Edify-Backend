import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET;
const oneDay = 24 * 60 * 60 * 1000;

// User Registration
export async function signup(req, res) {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Encrypting the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });
  return res.status(201).json({ message: "Signup successful", newUser });
}

//  find or create a user with Google credentials
const findOrCreateGoogleUser = async (googleData, role) => {
  try {
    // First, check if a user with this Google ID already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: googleData.email,
      },
    });

    if (existingUser) {
      // If the user exists, return the existing user
      return existingUser;
    } else {
      // If the user doesn't exist, create a new user with role
      const newUser = await prisma.user.create({
        data: {
          email: googleData.email,
          name: googleData.name,
          googleId: googleData.sub,
          role: role, // Ensure role is passed correctly
        },
      });

      return newUser; // Make sure to return the user object
    }
  } catch (error) {
    console.error("Error in findOrCreateGoogleUser:", error);
    throw error;
  }
};

export const googleLogin = async (req, res) => {
  const { token, role } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  if (!role) {
    return res
      .status(400)
      .json({ message: "Role must be provided for Google Sign-In" });
  }

  try {
    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleData = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };

    console.log("Decoded Google Payload:", googleData);

    // Proceed with creating or finding the user in your database
    const user = await findOrCreateGoogleUser(googleData, role);

    // Generate JWT token
    const userToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie like traditional login
    res.cookie("authToken", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: oneDay,
      path: "/",
    });

    return res.status(200).json({
      message: "Google login successful",
      token: userToken,
      userData: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Google login failed:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// Traditional Login Handler
export async function login(req, res) {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: oneDay,
    path: "/",
  });
  return res.status(200).json({
    message: "Login successful",
    token,
    userData: { id: user.id, email: user.email, role: user.role },
  });
}

// Logout handler
export function logout(req, res) {
  res.clearCookie("authToken", {
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
}

// Get current user handler
export async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User Data fetched successfully",
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching user data",
    });
  }
}
