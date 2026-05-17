const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    
    priority: { 
        type: String, 
        enum: ['basse', 'moyenne', 'haute'], 
        default: 'moyenne' 
    },
    status: { 
        type: String, 
        enum: ['à faire', 'en cours', 'terminé'], 
        default: 'à faire' 
    },
   
    status: {
        type: String,
        required: true,
        enum: {
            values: ['à faire', 'en cours', 'terminé'],
            message: '{VALUE} n\'est pas un statut valide (à faire, en cours, terminé)'
        },
        default: 'à faire'
    },
    priority: {
        type: String,
        required: true,
        enum: {
            values: ['basse', 'moyenne', 'haute'],
            message: '{VALUE} n\'est pas une priorité valide (basse, moyenne, haute)'
        },
        default: 'moyenne'
    },

    deadline: { 
        type: Date 
    },
  
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project',
        required: true 
    },
  
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);