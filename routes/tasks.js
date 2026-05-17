const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// =========================================================================
// 1. AJOUTER UNE TÂCHE 
// =========================================================================
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, status, project, deadline } = req.body;

    
    if (!title || !project || !deadline) {
      return res.status(400).json({ 
        message: "Les champs obligatoires sont manquants (title, project, deadline)." 
      });
    }

    
    const newTask = new Task({ 
        title, 
        description: description || 'Aucune description', 
        priority: priority || 'moyenne', 
        status: status || 'à faire', 
        project, 
        deadline 
    });
    
    await newTask.save();
    res.status(201).json(newTask); 
  } catch (err) {
    console.error("❌ ERROR DETAIL IN TERMINAL:", err);
    res.status(400).json({ message: "Erreur lors de la création", error: err.message });
  }
});

// =========================================================================
// 2. RÉCUPÉRER TOUTES LES TÂCHES D'UN PROJET 
// =========================================================================
router.get('/', async (req, res) => {
    try {
        const { project } = req.query; 
        if (!project) return res.status(400).json({ message: "Project ID est requis" });

        const tasks = await Task.find({ project });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// =========================================================================
// 3. RÉCUPÉRER UNE TÂCHE PAR SON ID
// =========================================================================
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// =========================================================================
// 4. MODIFIER UNE TÂCHE / METTRE À JOUR LE STATUT (PUT)
// =========================================================================
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, status, deadline } = req.body;
    
    if (priority && !['basse', 'moyenne', 'haute'].includes(priority)) {
      return res.status(400).json({ message: "Priorité invalide" });
    }
    if (status && !['à faire', 'en cours', 'terminé'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, status, deadline },
      { new: true, runValidators: true }
    );

    if (!updatedTask) return res.status(404).json({ message: "Tâche introuvable" });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la modification", error: err.message });
  }
});

// =========================================================================
// 5. SUPPRIMER UNE TÂCHE
// =========================================================================
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