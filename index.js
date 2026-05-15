require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
app.use(express.static('.'));

// --- 1. Middleware ---
app.use(express.json());

// --- 2. Database Connection ---
const mongoURI = process.env.MONGO_URI; 
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connexion à MongoDB réussie !'))
  .catch((err) => console.log('❌ Erreur de connexion :', err));

// --- 3. Health Check ---
app.get('/', (req, res) => {
    res.send('<h1>🚀 TaskFlow API is Live!</h1>');
});

// --- 4. API Routes (Tâches - Fonctionnalité 3) ---

// [GET] 
// [GET] 
app.get('/api/projects/:projectId/tasks', async (req, res) => {
  try {
    const { status, priority, search } = req.query; 
    let query = { project: req.params.projectId };

    
    if (status) query.status = status;
    
    //
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, 
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
                            .populate('assignedTo', 'name email')
                            .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des tâches", details: err.message });
  }
});

// [POST] 
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: "Could not create task", details: err.message });
  }
});

// [PATCH] 
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['à faire', 'en cours', 'terminé'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// [DELETE] 
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Authentication Routes ---
app.use('/api/auth', require('./routes/auth'));

// Server Configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API running on port ${PORT}`);
});