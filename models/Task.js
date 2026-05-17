const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Le titre de la tâche est obligatoire"],
        trim: true
    },
    description: {
        type: String,
        default: "Aucune description"
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
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, "Une tâche doit obligatoirement être liée à un projet parent"]
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);