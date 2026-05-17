require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Activity = require('./models/Activity'); 

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const app = express();

// --- 1. CONFIGURATION CORS ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- 2. CONNEXION MONGOOSE LOCAL ---

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskflow")
    .then(() => console.log("🍃 MongoDB Connecté avec succès en Local !"))
    .catch(err => console.error("❌ Erreur MongoDB :", err));

// --- 3. ROUTES GENERALES & AUTH ---
app.use('/api/auth', require('./routes/auth.js')); 
app.use('/api', require('./routes/activityBackendRoutes')); 
app.use('/api/projects', require('./routes/projects.js'));
app.use('/api/tasks', require('./routes/tasks.js'));
app.use('/api/dashboard', require('./routes/dashboard.js'));


app.use('/api', require('./routes/activityBackendRoutes').router);

// 🔔 Routes des Notifications (F8 د شيماء)
app.get('/api/notifications', async (req, res) => {
    try {
        const notifs = await Notification.find({ isRead: false }).sort({ timestamp: -1 });
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.json({ success: true, notif });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. EXEMPLE POST TASK ---
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

        await Notification.create({
            user: userId,
            details: `Une nouvelle tâche "${req.body.title}" vous a été assignée.`
        });

        res.status(201).json({ success: true, message: "Activité et Notification créées !" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 5. DEMARRAGE DU SERVEUR ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur prêt sur http://127.0.0.1:${PORT}`);
});