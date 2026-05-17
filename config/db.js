const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🍃 MongoDB Connecté avec succès en Local !");
    } catch (err) {
        console.error("❌ Erreur MongoDB :", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;