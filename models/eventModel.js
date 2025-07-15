const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true
  },
  description: String,
  date: Date,
  endDate: Date,
  location: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 