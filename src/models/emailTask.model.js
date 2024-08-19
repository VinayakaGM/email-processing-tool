const mongoose = require('mongoose');

const emailTaskSchema = new mongoose.Schema({
  messageId: String,
  emailContent: String,
  category: String,
  reply: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: String
}, { timestamps: true });

module.exports = mongoose.model('EmailTask', emailTaskSchema);
