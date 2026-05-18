const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// [POST] /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect !" });
    }

   
    if (user.password !== password) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect !" });
    }

    
    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    
    const token = jwt.sign(
      { id: user._id, username: user.username },
      secretKey,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error("Erreur Login Backend:", err);
    return res.status(500).json({ message: "Erreur serveur lors de la connexion", error: err.message });
  }
});

// [POST] /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    return res.status(201).json({ message: "Utilisateur créé avec succès ! Connectez-vous." });
  } catch (err) {
    console.error("Erreur Register Backend:", err);
    return res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

module.exports = router;