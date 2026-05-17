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
const Notification = mongoose.model('Notification', notificationSchema);


const Activity = require('./models/Activity'); 

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


const MONGO_URI = "mongodb://oumaimabartallou:oumaima2004@cluster0-shard-00-00.z5m6z.mongodb.net:27017,cluster0-shard-00-01.z5m6z.mongodb.net:27017,cluster0-shard-00-02.z5m6z.mongodb.net:27017/TaskFlow?ssl=true&replicaSet=atlas-z5m6z-shard-0&authSource=admin&retryWrites=true&w=majority"; 


mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));


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

// 5️⃣ & 9️⃣ ROUTE DES TASKS + ENREGISTREMENT ACTIVITÉ
app.post('/api/tasks', async (req, res) => {
    try {
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

app.use('/api', require('./routes/activityBackendRoutes'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur http://127.0.0.1:${PORT}`);
});