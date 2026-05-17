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


// =========================================================================
// [F8] : Route d'invitation d'un membre par Email
// =========================================================================
router.post('/:id/invite', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ msg: "Projet non trouvé" });

        
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Action non autorisée. Seul le propriétaire peut inviter des membres." });
        }

        
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ msg: "Aucun utilisateur trouvé avec cet email" });
        }

        
        if (project.members.includes(userToInvite._id)) {
            return res.status(400).json({ msg: "Cet utilisateur est déjà membre du projet" });
        }

        project.members.push(userToInvite._id);
        await project.save();

        res.json({ msg: "Membre invité avec succès", members: project.members });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur Serveur");
    }
});

module.exports = router;