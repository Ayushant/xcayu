import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import License from '../models/licenseModel.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all licenses
router.get('/licenses', async (req, res) => {
  try {
    const licenses = await License.find();
    console.log('Found licenses:', licenses);
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching licenses' });
  }
});

// Add new license
router.post('/licenses', async (req, res) => {
  try {
    const { college, email, password, maxStudents, expiryDate } = req.body;

    // Validate input
    if (!college || !email || !password || !maxStudents || !expiryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingLicense = await License.findOne({ email });
    if (existingLicense) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newLicense = new License({
      college,
      email,
      password: password, // Note: You should hash this password in production
      maxStudents,
      currentStudents: 0,
      expiryDate,
      status: 'Active'
    });
    await newLicense.save();
    res.status(201).json(newLicense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating license' });
  }
});

// Update license
router.put('/licenses/:id', async (req, res) => {
  try {
    const license = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(license);
  } catch (error) {
    res.status(500).json({ message: 'Error updating license' });
  }
});

// Delete license
router.delete('/licenses/:id', async (req, res) => {
  try {
    await License.findByIdAndDelete(req.params.id);
    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting license' });
  }
});

export default router;
