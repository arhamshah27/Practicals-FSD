const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single student
router.get('/:id', getStudent, (req, res) => {
  res.json(res.student);
});

// Create student
router.post('/', async (req, res) => {
  const student = new Student({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    grade: req.body.grade,
    subjects: req.body.subjects,
    address: req.body.address,
    parentName: req.body.parentName,
    parentContact: req.body.parentContact,
    status: req.body.status || 'active'
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'A student with this email already exists.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update student
router.patch('/:id', getStudent, async (req, res) => {
  if (req.body.name != null) {
    res.student.name = req.body.name;
  }
  if (req.body.email != null) {
    res.student.email = req.body.email;
  }
  if (req.body.phone != null) {
    res.student.phone = req.body.phone;
  }
  if (req.body.grade != null) {
    res.student.grade = req.body.grade;
  }
  if (req.body.subjects != null) {
    res.student.subjects = req.body.subjects;
  }
  if (req.body.address != null) {
    res.student.address = req.body.address;
  }
  if (req.body.parentName != null) {
    res.student.parentName = req.body.parentName;
  }
  if (req.body.parentContact != null) {
    res.student.parentContact = req.body.parentContact;
  }
  if (req.body.status != null) {
    res.student.status = req.body.status;
  }

  try {
    const updatedStudent = await res.student.save();
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
router.delete('/:id', getStudent, async (req, res) => {
  try {
    await Student.deleteOne({ _id: res.student._id });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get student by ID
async function getStudent(req, res, next) {
  let student;
  try {
    student = await Student.findById(req.params.id);
    if (student == null) {
      return res.status(404).json({ message: 'Cannot find student' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.student = student;
  next();
}

module.exports = router;
