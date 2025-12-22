import mongoose from 'mongoose';

const scheduledNotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: String, // Format: "HH:MM" (24-hour)
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    channels: {
        type: [String],
        enum: ['email', 'sms'],
        default: ['email']
    },
    reminderEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying by time
scheduledNotificationSchema.index({ time: 1, isActive: 1 });

export default mongoose.model('ScheduledNotification', scheduledNotificationSchema);
