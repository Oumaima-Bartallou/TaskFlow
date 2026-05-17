const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// --- 1. ROUTE D'INSCRIPTION ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Cet email est déjà utilisé." });

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur: " + err.message });
    }
});

// --- 2. ROUTE DE CONNEXION  ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect." });

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email ou mot de passe incorrect." });

        
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || "MonSuperSecretSMI2026", 
            { expiresIn: '3h' } 
        );

        
        res.status(200).json({ 
            token, 
            message: "Connexion réussie ! Redirection..." 
        });

    } catch (err) {
        res.status(500).json({ message: "Erreur serveur: " + err.message });
    }
});

module.exports = router;