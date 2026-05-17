const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// 1. Route GET pour récupérer toutes les notifications d'un utilisateur connecté
router.get('/notifications', async (req, res) => {
  try {
    // Dans un vrai projet, l'ID viendra du middleware Auth (req.user.id)
    // Pour l'instant, on filtre par l'utilisateur
    const notifications = await Notification.find({ user: req.query.userId })
                                             .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Route PATCH pour marquer une notification comme lue (sans rechargement de page)
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;