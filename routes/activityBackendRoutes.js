const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');


const authMiddleware = require('../middleware/auth');

// 1️⃣ Route GET pour récupérer l'historique des activités d'un projet spécifique

router.get('/projects/:id/activities', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name email')
      .sort({ timestamp: -1 });
    
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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


module.exports = {
  router,
  logActivity
};