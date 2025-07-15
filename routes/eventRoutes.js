const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddlewares');
const eventController = require('../controllers/eventController');
const router = express.Router();

// Create new event (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), eventController.createEvent);

// Get all events
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Update event (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), eventController.updateEvent);

// Delete event (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), eventController.deleteEvent);

module.exports = router; 