const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); 
const jwt = require('jsonwebtoken');

// --- Middleware ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers['authorization'];
  if (!token) return res.status(401).json({ message: "Accès refusé." });

  try {
    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    req.user = jwt.verify(token, secretKey); 
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};

// 1️⃣ [POST] /api/tasks 
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, deadline, priority, project } = req.body;
    if (!title || !project) return res.status(400).json({ message: "Champs obligatoires manquants." });

    const newTask = new Task({
      title,
      description,
      deadline,
      priority: priority || 'moyenne',
      project,
      status: 'à faire' 
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur: " + err.message });
  }
});

// 2️⃣ [GET] /api/tasks 
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { project } = req.query;
    if (!project) return res.status(400).json({ message: "Le paramètre project est requis." });

    const tasks = await Task.find({ project });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 3️⃣ [PUT] /api/tasks/:taskId 
router.put('/:taskId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { returnDocument: 'after' } 
    );
    if (!updatedTask) return res.status(404).json({ message: "Tâche non trouvée." });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});

// 4️⃣ [DELETE] /api/tasks/:taskId
router.delete('/:taskId', authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.taskId);
    if (!deletedTask) return res.status(404).json({ message: "Tâche non trouvée." });
    res.status(200).json({ message: "Tâche supprimée avec succès !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
});

module.exports = router;