const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();

// Middleware
app.use(express.json());

// Database Connection
require('dotenv').config(); // هاد السطر ضروري يكون هو الأول في الملف
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// استخدام المتغير المخبي بدل الرابط المباشر
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie (Secure mode) !'))
  .catch((err) => console.log('Erreur de connexion :', err));

// باقي الكود ديالك (app.get, app.listen...)
// --- API Routes (CRUD) ---

// 1. Create - إضافة مهمة جديدة
app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: "Could not create task", details: err.message });
  }
});

// 2. Read All - جلب جميع المهام
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // الترتيب من الأحدث للأقدم
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 3. Read Single - جلب مهمة واحدة بالمعرف
app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID format", details: err.message });
  }
});

// 4. Update - تعديل مهمة (مثلاً تغيير الحالة)
app.put('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
    { returnDocument: 'after', runValidators: true }// runValidators كتأكد أن البيانات الجديدة صحيحة
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err.message });
  }
});

// 5. Delete - مسح مهمة
app.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

// Server Configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API is running on http://localhost:${PORT}`);
});