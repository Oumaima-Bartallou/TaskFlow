const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// GET /api/projects/:id/activities
router.get('/projects/:id/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name email')
      .sort({ timestamp: -1 });      

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;