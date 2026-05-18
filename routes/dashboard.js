const express = require('express');
const router = report = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/dashboard - (Mise à jour F5 : Aggregation Pipeline)
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    
    const activeProjectsCount = await Project.countDocuments();

    
    const totalAssignedAgg = await Task.aggregate([
      { $count: "count" }
    ]);
    const totalAssigned = totalAssignedAgg[0]?.count || 0;

    
    const completedTasksAgg = await Task.aggregate([
      { $match: { status: 'terminé' } },
      { $count: "count" }
    ]);
    const completedTasks = completedTasksAgg[0]?.count || 0;

    
    const overdueTasksAgg = await Task.aggregate([
      { 
        $match: { 
          status: { $ne: 'terminé' }, 
          deadline: { $lt: now } 
        } 
      },
      { $count: "count" }
    ]);
    const overdueTasks = overdueTasksAgg[0]?.count || 0;

    
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