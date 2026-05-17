const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. Ajouter une tâche (Création)
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, status, project, dueDate } = req.body;

    // Middleware de validation Express rapide pour les enums
    if (priority && !['basse', 'moyenne', 'haute'].includes(priority)) {
      return res.status(400).json({ message: "Priorité invalide" });
    }
    if (status && !['à faire', 'en cours', 'terminé'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const newTask = new Task({ title, description, priority, status, project, dueDate });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la création", error: err.message });
  }
});

// 2. Récupérer une tâche par son ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// 3. Modifier une tâche (Full Update)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    
    if (priority && !['basse', 'moyenne', 'haute'].includes(priority)) {
      return res.status(400).json({ message: "Priorité invalide" });
    }
    if (status && !['à faire', 'en cours', 'terminé'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, status, dueDate },
      { new: true, runValidators: true }
    );

    if (!updatedTask) return res.status(404).json({ message: "Tâche introuvable" });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la modification", error: err.message });
  }
});

// 4. Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Tâche introuvable" });
    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;