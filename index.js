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