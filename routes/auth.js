const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 📝 1. Route: Inscription (Register) -> /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet e-mail est déjà utilisé." });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    // 🚨 دابا هادي غاتطبع الخطأ ديال الـ register ديريكت ف التيرمينال!
    console.log("===========================================");
    console.error("DÉTAIL DE L'ERREUR REGISTER :", error);
    console.log("===========================================");

    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// 🔑 2. Route: Connexion (Login) -> /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides." });
    }

    
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.log("===========================================");
    console.error("DÉTAIL DE L'ERREUR LOGIN :", error);
    console.log("===========================================");

    res.status(500).json({ 
        message: "Erreur serveur lors de la connexion.", 
        error: error.message 
    });
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;