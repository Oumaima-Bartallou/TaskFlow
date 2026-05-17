require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const Task = require('./models/Task');


const Activity = require('./models/Activity'); 

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], 
// --- 1. Middleware Global ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(__dirname));

// --- 2. Database Connection ---

const MONGO_URI = "mongodb+srv://oumaimabartallou:oumaima2004@cluster0.z5m6z.mongodb.net/TaskFlow?retryWrites=true&w=majority&appName=Cluster0"; 
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/taskflow"; 
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connexion à MongoDB réussie !'))
  .catch((err) => console.log('❌ Erreur de connexion :', err));
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/taskflow"; 

// --- 3. API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/dashboard', require('./routes/dashboard'));

// [GET] 
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/tasks', async (req, res) => {
    try {
        console.log("Données reçues:", req.body);
        

        const userId = req.user ? req.user.id : "66463e2a9b1c2d3e4f5a6b7d"; 

        await Activity.create({
            actionType: 'création_tâche',
            project: req.body.project || "66463e2a9b1c2d3e4f5a6b7c", 
            user: userId,
            details: `a créé la tâche "${req.body.title}"`
        });

        res.status(201).json({ success: true, message: "Taskflow a reçu la tâche et enregistré l'activité !" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
// [POST] 
app.post('/api/tasks', async (req, res) => {
  try {
    console.log("Données reçues:", req.body);
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: "Could not create task", details: err.message });
  }
});

// [patch]
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['à faire', 'en cours', 'terminé'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
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



app.use('/api', require('./routes/activityBackendRoutes'));


const PORT = 3000;
app.listen(PORT, () => {
// --- 4. Server Start ---
const PORT = 3000; 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur prêt sur http://127.0.0.1:${PORT}`);
});