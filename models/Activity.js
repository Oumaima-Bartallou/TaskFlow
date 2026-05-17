const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: ['création_tâche', 'suppression_tâche', 'changement_statut', 'ajout_membre', 'retrait_membre', 'modification_projet']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: { 
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);