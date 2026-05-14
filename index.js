const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task'); // هذا السطر ضروري باش السيرفر يعرف الموديل

const app = express();
app.use(express.json());

// الربط مع قاعدة البيانات اللي شاعلة في Docker
mongoose.connect('mongodb://127.0.0.1:27017/taskflow_db')
  .then(() => console.log('✅ Connected to MongoDB via Docker!'))
  .catch(err => console.error('❌ Database connection error:', err));

// الـ Route القديم (للترحيب)
app.get('/', (req, res) => {
  res.send('Welcome to TaskFlow API! 🚀');
});

// --- الكود الجديد كيبدا هنا ---

// 1. Route باش نزيدو Task جديدة (POST)
app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 2. Route باش نشوفو كاع المهام اللي كاينين (GET)
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- الكود الجديد كيسالي هنا ---

const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});