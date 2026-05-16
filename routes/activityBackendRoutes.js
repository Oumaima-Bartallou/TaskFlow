const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Route GET pour récupérer l'historique des activités d'un projet spécifique
router.get('/projects/:id/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
                                     .populate('author', 'name email') // Pour afficher qui a fait l'action
                                     .sort({ createdAt: -1 }); // Tri de la plus récente à la plus ancienne
    
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;