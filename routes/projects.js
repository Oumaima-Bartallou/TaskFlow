const express = require('express');
const router = express.Router();
const Project = require('../models/Project'); 
const jwt = require('jsonwebtoken');

// --- Middleware ---
const authMiddleware = (req, res, next) => {
  
  const token = req.headers.authorization?.split(' ')[1] || req.headers['authorization'];
  if (!token) return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });

  try {
    
    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    const verified = jwt.verify(token, secretKey);
    req.user = verified; 
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};

// --- 1. [GET] /api/projects ---
router.get('/', authMiddleware, async (req, res) => {
  try {
    
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(projects);
  } catch (err) {
    console.error("Erreur GET Projects:", err);
    res.status(500).json({ message: "Erreur serveur lors du chargement des projets." });
  }
});

// --- 2. [POST] /api/projects ---
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Le titre est requis." });

    
    const newProject = new Project({
      title,
      description: description || "Aucune description",
      owner: req.user.id,    
      members: [req.user.id] 
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Erreur POST Project:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du projet." });
  }
});


module.exports = router;