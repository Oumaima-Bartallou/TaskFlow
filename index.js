const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const Task = require('./models/Task');
const cors = require('cors');

const app = express();
app.use(express.static('.'));

// --- 1. Middleware Global ---
app.use(cors()); 

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(__dirname));

// --- 2. Database Connection ---
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/taskflow"; 
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connexion à MongoDB réussie !'))
  .catch((err) => console.log('❌ Erreur de connexion :', err));

const MONGO_URI = "mongodb+srv://... (الرابط ديالك)"; 

// --- 4. API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));

// [GET] 
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// --- 5. Server Start ---
const PORT = 5500;
// [PATCH] 
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['à faire', 'en cours', 'terminé'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));


app.post('/api/tasks', async (req, res) => {
    try {
        console.log("Données reçues:", req.body);
       
        res.status(201).json({ success: true, message: "Taskflow a reçu la tâche !" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
});