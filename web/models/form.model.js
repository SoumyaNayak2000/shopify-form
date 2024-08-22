import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
    formId: { type: String, required: true, unique: true },
    formName: { type: String, required: true },
    fields: [
        {
            type: { type: String, required: true },
            label: { type: String, required: true },
            size: { type: String, enum: ['one-third', 'half', 'full'], default: 'full' },
            required: { type: Boolean, default: false },
            defaultValue: String,
            placeholder: String,
            options: [String], 
            min: Number, 
            max: Number, 
            customClass: String
        }
    ],
    storeId: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now }
});

export const Form = mongoose.model('Form', formSchema);
