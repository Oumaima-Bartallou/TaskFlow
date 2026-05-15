require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();

// --- 1. Middleware ---

app.use(express.json());

// --- 2. Database Connection ---
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connexion à MongoDB réussie (Docker Mode) !'))
  .catch((err) => console.log('❌ Erreur de connexion :', err));


app.get('/', (req, res) => {
    res.send('<h1>🚀 TaskFlow API is Live!</h1><p>Server is running and MongoDB is connected.</p>');
});

app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: "Could not create task", details: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID format", details: err.message });
  }
});


app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API is running on port ${PORT}`);
});