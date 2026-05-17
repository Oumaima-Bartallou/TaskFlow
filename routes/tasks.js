const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Activity = require('../models/Activity'); // Importation du modèle d'activité pour l'historique
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware pour sécuriser les routes

// =========================================================================
// 1. AJOUTER UNE TÂCHE (CRÉATION)
// =========================================================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, status, project, deadline } = req.body;

    // Validation Express rapide pour les enums (Priorité)
    if (priority && !['basse', 'moyenne', 'haute'].includes(priority)) {
      return res.status(400).json({ message: "Priorité invalide" });
    }
    
    // Validation Express rapide pour les enums (Statut)
    if (status && !['à faire', 'en cours', 'terminé'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    // Création et sauvegarde de la nouvelle tâche
    const newTask = new Task({ title, description, priority, status, project, deadline });
    await newTask.save();

    // ⏳ HISTORIQUE : Enregistrement automatique de l'événement de création
    await Activity.create({
      actionType: 'create_task',
      project: project,
      user: req.user.id, // ID de l'utilisateur connecté récupéré depuis le middleware
      details: `a créé la tâche "${title}"`
    });

    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la création", error: err.message });
  }
});

// =========================================================================
// 2. RÉCUPÉRER UNE TÂCHE PAR SON ID
// =========================================================================
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Récupération de la tâche avec les détails du membre assigné (Nom et Email uniquement)
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// =========================================================================
// 3. MODIFIER UNE TÂCHE / METTRE À JOUR LE STATUT (PUT)
// =========================================================================
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, status, deadline } = req.body;
    
    if (priority && !['basse', 'moyenne', 'haute'].includes(priority)) {
      return res.status(400).json({ message: "Priorité invalide" });
    }
    if (status && !['à faire', 'en cours', 'terminé'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    // Récupération de la tâche avant modification pour vérifier le changement de statut
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: "Tâche introuvable" });

    // Mise à jour de la tâche dans la base de données
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, status, deadline },
      { new: true, runValidators: true }
    );

    // ⏳ HISTORIQUE : Si le statut a changé, on enregistre l'action automatiquement
    if (status && oldTask.status !== status) {
      await Activity.create({
        actionType: 'change_status',
        project: updatedTask.project,
        user: req.user.id,
        details: `a changé le statut de la tâche "${updatedTask.title}" à "${status}"`
      });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la modification", error: err.message });
  }
});

// =========================================================================
// 4. SUPPRIMER UNE TÂCHE
// =========================================================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Recherche de la tâche avant suppression pour récupérer l'ID du projet parent
    const taskToClear = await Task.findById(req.params.id);
    if (!taskToClear) return res.status(404).json({ message: "Tâche introuvable" });

    // Suppression définitive de la tâche
    await Task.findByIdAndDelete(req.params.id);

    // ⏳ HISTORIQUE : Enregistrement automatique de l'événement de suppression
    await Activity.create({
      actionType: 'delete_task',
      project: taskToClear.project,
      user: req.user.id,
      details: `a supprimé la tâche "${taskToClear.title}"`
    });

    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// =========================================================================
// 5. FILTRER LES TÂCHES DU MEMBRE CONNECTÉ
// =========================================================================
router.get('/my-tasks/:projectId', authMiddleware, async (req, res) => {
  try {
    // Récupération des tâches associées à un projet spécifique ET assignées à l'utilisateur connecté
    const tasks = await Task.find({ 
      project: req.params.projectId,
      assignedTo: req.user?.id || req.user?._id
    }).populate('assignedTo', 'name email');
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du filtrage des tâches", error: err.message });
  }
});

module.exports = router;