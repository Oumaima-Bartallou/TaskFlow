const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const Activity = require('./models/Activity'); 

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


const MONGO_URI = "mongodb+srv://oumaimabartallou:oumaima2004@cluster0.z5m6z.mongodb.net/TaskFlow?retryWrites=true&w=majority&appName=Cluster0"; 

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));



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
    }
});



app.use('/api', require('./routes/activityBackendRoutes'));


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur http://127.0.0.1:${PORT}`);
});