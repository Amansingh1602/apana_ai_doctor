import mongoose from 'mongoose';

const symptomSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symptomsText: {
    type: String,
    required: [true, 'Symptoms description is required'],
    minlength: [10, 'Please describe symptoms in at least 10 characters']
  },
  severity: {
    type: String,
    required: [true, 'Severity is required'],
    enum: ['mild', 'moderate', 'severe', 'critical']
  },
  onset: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  existingConditions: {
    type: String,
    trim: true
  },
  currentMedications: {
    type: String,
    trim: true
  },
  allergies: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 1,
    max: 120
  },
  isPregnant: {
    type: Boolean,
    default: false
  },
  analysisResult: {
    triageLevel: {
      type: String,
      enum: ['emergency', 'urgent-visit', 'see-doctor', 'self-care']
    },
    triageReason: String,
    recommendations: {
      medicines: [{
        name: String,
        dose: String,
        notes: String,
        evidenceLevel: String
      }],
      homeRemedies: [String],
      whatToDo: [String],
      whatNotToDo: [String],
      doctorSpecialization: String,
      emergencyContacts: [{
        service: String,
        number: String,
        description: String
      }]
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    },
    disclaimer: String
  },
  uploadedReportPath: String,
  uploadedReportData: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
symptomSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
symptomSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SymptomSession', symptomSessionSchema);
