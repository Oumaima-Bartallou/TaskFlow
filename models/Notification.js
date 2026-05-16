const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // L'utilisateur qui va recevoir la notification
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false // Par défaut, la notification n'est pas lue
  },
  type: {
    type: String,
    enum: ['assignation_tâche', 'statut_modifié', 'ajout_projet'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);