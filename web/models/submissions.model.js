import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    storeId: { type: String, required: true },
    submissionData: { 
        type: Map, 
        of: String,
        required: true 
    },
    submittedAt: { type: Date, default: Date.now }
});

export const Submission = mongoose.model('Submission', submissionSchema);
