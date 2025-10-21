import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkStudentLogin } from "../middleware/licenseMiddleware.js";

const router = express.Router();

// Login Route
router.post("/login", checkStudentLogin, async (req, res) => {
  const { email, password, simulation, degree } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Allow both superadmin and student roles
    if (!["superadmin", "student"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // SIMULATION ACCESS CONTROL: Check if user's degree matches the requested simulation
    // Skip check for superadmin
    if (user.role === "student") {
      // If simulation or degree is specified in request, verify access
      if ((simulation || degree) && user.degree) {
        const requestedDegree = degree || simulation;
        if (user.degree !== requestedDegree) {
          return res.status(403).json({ 
            message: "Simulation access denied",
            details: `You are enrolled in ${user.degree} and cannot access ${requestedDegree} simulations. Please use the correct simulation for your degree.`
          });
        }
      }
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      user: { 
        id: user._id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role,
        college: user.college,
        degree: user.degree
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
