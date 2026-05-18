const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// [POST] /api/auth/register 
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    
    const newUser = new User({ username, email, password });
    await newUser.save();

   
    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    const token = jwt.sign({ id: newUser._id }, secretKey, { expiresIn: '1h' });

    res.status(201).json({ token, message: "Utilisateur créé avec succès !" });
  } catch (err) {
    console.error("Erreur Register Server:", err);
    res.status(500).json({ message: "Erreur serveur: " + err.message });
  }
});

// [POST] /api/auth/login 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect." });

    
    if (user.password !== password) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect." });
    }

    const secretKey = process.env.JWT_SECRET || "SECRET_SMI_S4_KEY_123";
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Erreur Login Server:", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
});

module.exports = router;