import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['LOGIN', 'FILE_UPLOAD', 'REPORT', 'LOGOUT', 'DATA_EXPORT', 'SETTINGS_UPDATE']
  },
  orgId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Compound index for efficient queries: orgId + timestamp
eventSchema.index({ orgId: 1, timestamp: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
