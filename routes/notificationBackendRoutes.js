const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); 

// 🔐 Middleware d'authentification sécurisé
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: "Accès refusé. Token manquant." });
  
  try {
    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    const decoded = jwt.verify(token, secretKey); 
    
    req.user = {
      id: decoded.id || decoded._id,
      ...decoded
    };
    
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};

// 1. [GET] /api/notifications 
router.get('/', authMiddleware, async (req, res) => {
  try {
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

  
    if (!req.user.id) {
      return res.status(400).json({ message: "ID utilisateur introuvable dans le token." });
    }

  
    const notifications = await Notification.find({ 
      user: req.user.id, 
      isRead: false 
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id;

   
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Format de l'ID de notification invalide." });
    }

   
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { isRead: true },
      { new: true } 
    );
    
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification non trouvée ou non autorisée." });
    }
    
    res.status(200).json(updatedNotification);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur: " + err.message });
  }
});

module.exports = router;