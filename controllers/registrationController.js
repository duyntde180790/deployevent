const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');

exports.registerEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const existingRegistration = await Registration.findOne({ studentId, eventId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }
    const count = await Registration.countDocuments({ eventId });
    if (count >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event full' });
    }
    const registration = new Registration({ studentId, eventId });
    await registration.save();
    await registration.populate('eventId');
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    if (registration.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }
    await registration.deleteOne();
    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling registration', error: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user.id })
      .populate('eventId')
      .sort({ registrationDate: -1 });
    if (registrations.length === 0) {
      return res.json({ message: "You haven't registered for any events yet" });
    }
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('eventId')
      .populate('studentId', 'username')
      .sort({ registrationDate: -1 });
    if (registrations.length === 0) {
      return res.json({ message: 'No registrations yet' });
    }
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
};

exports.getRegistrationsByDate = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    if (new Date(start) > new Date(end)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    const registrations = await Registration.find({
      registrationDate: { $gte: new Date(start), $lte: new Date(end) }
    })
    .populate('eventId')
    .populate('studentId', 'username')
    .sort({ registrationDate: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
}; 