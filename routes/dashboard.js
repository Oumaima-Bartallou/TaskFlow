const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('./auth'); 

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?._id || req.userId; 
    const now = new Date();

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }


    const activeProjectsCount = await Project.countDocuments({ 
      $or: [{ creator: userId }, { members: userId }] 
    });

   
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "terminé"] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "terminé"] },
                    { $lt: ["$deadline", now] } 
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = taskStats[0] || { totalAssigned: 0, completedTasks: 0, overdueTasks: 0 };

  
    const activeTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: "terminé" }
    })
    .sort({ priority: -1, deadline: 1 }); 

    res.json({
      activeProjects: activeProjectsCount,
      totalAssigned: stats.totalAssigned,
      completedTasks: stats.completedTasks,
      overdueTasks: stats.overdueTasks,
      tasksList: activeTasks
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur lors du calcul des métriques du dashboard", error: err.message });
  }
});

module.exports = router;