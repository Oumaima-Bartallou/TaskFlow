const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. Récupérer toutes les tâches d'un projet spécifique
router.get('/projects/:id/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Créer une nouvelle tâche
router.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. Route PATCH pour mettre à jour UNIQUEMENT le statut d'une tâche
router.patch('/tasks/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true } // Active la validation des enums (à faire, en cours, terminé)
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. Routes CRUD classiques (Modifier et Supprimer une tâche par son ID)
router.route('/tasks/:id')
  .put(async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
      );
      if (!updatedTask) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const deletedTask = await Task.findByIdAndDelete(req.params.id);
      if (!deletedTask) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;