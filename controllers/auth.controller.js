// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import dotenv from "dotenv";
// Secret for JWT
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

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

  // Hash password
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
    { expiresIn: "1h" }
  );

  // Set JWT token in an HTTP-only, Secure cookie
  res.cookie("authToken", token, {
    httpOnly: true, // Prevent access to the cookie via JavaScript
    secure: true, // sent over https
    maxAge: 3600000, // Token expiration (1 hour)
    sameSite: "Strict", // Protect against CSRF attacks
  });
  return res.status(200).json({ message: "Login successful" });
}
