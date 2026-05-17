const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middlewares/authMiddleware');

// 1️⃣ Route GET pour récupérer l'historique des activités d'un projet spécifique

router.get('/projects/:id/activities', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name email') // Pour afficher qui a fait l'action (Nom et Email)
      .sort({ timestamp: -1 }); // Tri de la plus récente à la plus ancienne (F9)
    
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2️⃣ Fonction utilitaire pour enregistrer les activités (Middleware/Helper)
const logActivity = async (actionType, projectId, userId, details) => {
  try {
    await Activity.create({
      actionType,
      project: projectId,
      user: userId,
      details
    });
    console.log(`✅ Activité enregistrée : ${details}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de l'activité:", error.message);
  }
};

// 3️⃣ Exportation correcte du router et de la fonction en même temps
module.exports = {
  router,
  logActivity
};
