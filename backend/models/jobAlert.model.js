import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // A short label the user sees in their alerts list, e.g. "Frontend jobs in Pune"
    label: {
        type: String,
        required: true,
    },
    keyword: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    jobType: {
        type: String,
        default: "",
    },
    // Last time we scanned this alert for matches, so we only ever email
    // about jobs posted after the alert was created or last matched.
    lastNotifiedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const JobAlert = mongoose.model("JobAlert", jobAlertSchema);
