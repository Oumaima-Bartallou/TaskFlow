const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); 

const app = express();

// ==========================================
// 1. MIDDLEWARES 
// ==========================================
app.use(cors());
app.use(express.json()); 

// --- 1. Middleware ---

app.use(express.json());

// --- 2. Database Connection ---
const mongoURI = process.env.MONGO_URI; 

app.use(express.static(path.join(__dirname, 'public'))); 


app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/projets.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});


app.get('/', (req, res) => {
    res.redirect('/register.html');
});


app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));


app.get('/api/dashboard', async (req, res) => {
    try {
        const Project = require('./models/Project');
        const Task = require('./models/Task');

        const activeProjects = await Project.countDocuments();
        const totalAssigned = await Task.countDocuments({ status: { $ne: 'terminé' } });
        const completedTasks = await Task.countDocuments({ status: 'terminé' });
        
        
        const overdueTasks = await Task.countDocuments({ 
            deadline: { $lt: new Date() }, 
            status: { $ne: 'terminé' } 
        });

        res.status(200).json({
            activeProjects,
            totalAssigned,
            completedTasks,
            overdueTasks
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur Dashboard Metrics" });
    }
});


const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskflow"; 

mongoose.connect(MONGO_URI)
  .then(() => {
      console.log("🚀 Connecté avec succès à MongoDB !");
      
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
          console.log(`🔥 Serveur en cours d'exécution sur: http://127.0.0.1:${PORT}`);
      });
  })
  .catch(err => {
      console.error("❌ Échec de la connexion à MongoDB :", err.message);
  });
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
