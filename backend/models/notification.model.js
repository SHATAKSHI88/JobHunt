import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['application_status', 'job_alert'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    // where clicking the notification should take the user
    link: {
        type: String,
        default: "",
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// most recent-first is how this is always queried
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
