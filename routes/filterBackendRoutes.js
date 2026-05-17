const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Route pour récupérer les tâches d'un projet avec filtrage, recherche et pagination
router.get('/projects/:id/tasks/search', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Extraction des query parameters avec des valeurs par défaut pour la pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { status, priority, assignedTo, search } = req.query;

    // Construction conditionnelle du filtre Mongoose
    let queryFilter = { project: projectId };

    if (status) {
      queryFilter.status = status;
    }
    if (priority) {
      queryFilter.priority = priority;
    }
    if (assignedTo) {
      queryFilter.assignedTo = assignedTo;
    }
    
    // Recherche par mot-clé dans le titre (case-insensitive grâce à l'option 'i')
    if (search) {
      queryFilter.title = { $regex: search, $options: 'i' };
    }

    // Exécution de la requête avec pagination et comptage total
    const total = await Task.countDocuments(queryFilter);
    const tasks = await Task.find(queryFilter)
                            .skip(skip)
                            .limit(limit);

    const totalPages = Math.ceil(total / limit);

    // Retour du format JSON exact exigé par le sujet
    res.status(200).json({
      data: tasks,
      total,
      page,
      totalPages
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;