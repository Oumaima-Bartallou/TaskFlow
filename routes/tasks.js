const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Activity = require('../models/Activity'); 
const Notification = require('../models/Notification'); 
const Task = require('../models/Task'); 
const jwt = require('jsonwebtoken');

// --- 🔐 Middleware d'authentification sécurisé ---
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: "Accès refusé. Token manquant." });

  try {
    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    const decoded = jwt.verify(token, secretKey); 
    
   
    req.user = {
      id: decoded.id || decoded._id,
      ...decoded
    };
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, deadline, priority, project, assignedTo } = req.body;
    if (!title || !project) return res.status(400).json({ message: "Champs obligatoires manquants." });

    let targetUser = null;
    if (assignedTo && assignedTo !== "") {
      targetUser = mongoose.Types.ObjectId.isValid(assignedTo) ? new mongoose.Types.ObjectId(assignedTo) : assignedTo;
    }

    const newTask = new Task({
      title,
      description,
      deadline,
      priority: priority || 'moyenne',
      project,
      assignedTo: targetUser,
      status: 'à faire' 
    });

    await newTask.save();

    const newActivity = new Activity({
      actionType: 'création_tâche',
      details: `La tâche "${title}" a été créée`, 
      project: project,
      user: req.user.id
    });
    await newActivity.save();
    console.log(`✅ [Historique] Activité enregistrée : La tâche "${title}" a été créée`);

   
    if (targetUser) {
      const newNotification = new Notification({
        user: targetUser, 
        message: `📌 Une nouvelle tâche "${title}" vous a été assignée.`,
        type: 'assignation_tâche',
        isRead: false
      });
      await newNotification.save();
      console.log(`🔔 Notification créée en DB pour l'utilisateur: ${targetUser}`);
    }

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur: " + err.message });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { project, search, status, priority, page = 1, limit = 5 } = req.query;
    
    if (!project) return res.status(400).json({ message: "Le paramètre project est requis." });

    let query = { project };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const totalTasks = await Task.countDocuments(query); 
    const totalPages = Math.ceil(totalTasks / limit);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
                            .populate('assignedTo', 'username email') 
                            .skip(skip)
                            .limit(parseInt(limit))
                            .sort({ createdAt: -1 }); 

    res.status(200).json({
      data: tasks,
      total: totalTasks,
      page: parseInt(page),
      totalPages: totalPages
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur: " + err.message });
  }
});


router.patch('/:taskId/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Tâche non trouvée." });

 
    const newActivity = new Activity({
      actionType: 'changement_statut',
      details: `Le statut de la tâche "${updatedTask.title}" est passé à "${status}"`,
      project: updatedTask.project,
      user: req.user.id
    });
    await newActivity.save();
    console.log(`🔄 [Historique] Status changé : "${updatedTask.title}" est passé à "${status}"`);

  
    if (updatedTask.assignedTo) {
      const newNotification = new Notification({
        user: updatedTask.assignedTo,
        message: `🔄 Le statut de votre tâche "${updatedTask.title}" est passé à "${status}".`,
        type: 'statut_modifié',
        isRead: false
      });
      await newNotification.save();
      console.log(`🔔 Notification de statut créée pour ${updatedTask.assignedTo}`);
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut: " + err.message });
  }
});


router.put('/:taskId', authMiddleware, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body, 
      { returnDocument: 'after', runValidators: true } 
    );
    if (!updatedTask) return res.status(404).json({ message: "Tâche non trouvée." });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour complète: " + err.message });
  }
});

// 5️⃣ [DELETE] /api/tasks/:taskId 
router.delete('/:taskId', authMiddleware, async (req, res) => {
  try {
    const taskToDelete = await Task.findById(req.params.taskId);
    if (!taskToDelete) return res.status(404).json({ message: "Tâche non trouvée." });

    await Task.findByIdAndDelete(req.params.taskId);

    const newActivity = new Activity({
      actionType: 'suppression_tâche',
      details: `La tâche "${taskToDelete.title}" a été supprimée`,
      project: taskToDelete.project,
      user: req.user.id
    });
    await newActivity.save();
    console.log(`❌ [Historique] Tâche supprimée : "${taskToDelete.title}"`);

    res.status(200).json({ message: "Tâche supprimée avec succès !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression: " + err.message });
  }
});

module.exports = router;