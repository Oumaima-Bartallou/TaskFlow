const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');


router.post('/', auth, async (req, res) => {
    try {
        const newProject = new Project({
            title: req.body.title,
            description: req.body.description,
            owner: req.user.id
        });
        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        res.status(500).send('Erreur Serveur');
    }
});


router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user.id });
        res.json(projects);
    } catch (err) {
        res.status(500).send('Erreur Serveur');
    }
});
const Task = require('../models/Task'); 

// GET /api/projects/:id/tasks
router.get('/:id/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des tâches du projet", error: err.message });
  }
});

module.exports = router;