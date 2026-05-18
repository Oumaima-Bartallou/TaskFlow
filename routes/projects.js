const express = require('express');
const router = express.Router();
const Project = require('../models/Project'); 
const User = require('../models/User'); 
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

// --- 1. [GET] /api/projects---
router.get('/', authMiddleware, async (req, res) => {
  try {
    
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    })
    .populate('members', 'username') 
    .sort({ createdAt: -1 });
    
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
    
    
    const populatedProject = await Project.findById(savedProject._id).populate('members', 'username');
    res.status(201).json(populatedProject);
  } catch (err) {
    console.error("Erreur POST Project:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du projet." });
  }
});

// --- 3. [POST] /api/projects/:projectId/invite ---
router.post('/:projectId/invite', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;

    
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: "Utilisateur non trouvé avec cette adresse email." });
    }

    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    
    if (project.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: "Cet utilisateur est déjà membre du projet." });
    }

    
    project.members.push(userToInvite._id);
    await project.save();

    res.status(200).json({ message: `L'utilisateur ${userToInvite.username} ajout succes !` });
  } catch (err) {
    console.error("Erreur Invite Member:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'invitation." });
  }
});

// --- 4. [DELETE] /api/projects/:projectId/members/:memberId ---
router.delete('/:projectId/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Projet non trouvé." });

    
    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();

    res.status(200).json({ message: "Membre retiré avec succès du projet." });
  } catch (err) {
    console.error("Erreur Delete Member:", err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du membre." });
  }
});

module.exports = router;