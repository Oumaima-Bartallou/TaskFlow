const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/dashboard 
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    
    const activeProjectsCount = await Project.countDocuments();

    
    const totalAssigned = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'terminé' });
    
    
    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'terminé' },
      deadline: { $lt: now }
    });

    
    const activeTasks = await Task.find({ status: { $ne: "terminé" } })
                                  .sort({ deadline: 1 });

    
    res.json({
      activeProjects: activeProjectsCount,
      totalAssigned: totalAssigned,
      completedTasks: completedTasks,
      overdueTasks: overdueTasks,
      tasksList: activeTasks
    });

  } catch (err) {
    console.error("❌ Erreur Dashboard Detail:", err);
    res.status(500).json({ message: "Erreur lors du calcul des métriques", error: err.message });
  }
});

module.exports = router;