import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    aiAnalysis: {
        type: Object, // Stores the JSON result from AI
        default: null
    }
});

export default mongoose.model('MedicalReport', medicalReportSchema);
