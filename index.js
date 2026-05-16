const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();


app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


const MONGO_URI = "mongodb+srv://... (الرابط ديالك)"; 

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
});