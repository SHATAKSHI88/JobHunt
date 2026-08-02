import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
        unique: true, // one interview per application; reschedule reuses this doc
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    scheduledAt: {
        type: Date,
        required: true,
    },
    durationMinutes: {
        type: Number,
        default: 30,
    },
    // Daily.co room identifiers. roomName is what we use to mint join
    // tokens; roomUrl is stored for convenience/emails.
    roomName: {
        type: String,
        required: true,
        unique: true,
    },
    roomUrl: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    notes: {
        type: String, // recruiter's private post-interview notes
    },
}, { timestamps: true });

export const Interview = mongoose.model("Interview", interviewSchema);
