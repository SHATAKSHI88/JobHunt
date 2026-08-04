import { Notification } from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Reusable helper other controllers call to create a notification.
// Never throws — a failed notification write should never break the
// action that triggered it (status update, alert match, etc).
export const createNotification = async ({ user, type, title, message, link = "" }) => {
    try {
        await Notification.create({ user, type, title, message, link });
    } catch (error) {
        console.error("createNotification failed:", error);
    }
};

export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.id })
        .sort({ createdAt: -1 })
        .limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.id, read: false });

    return res.status(200).json({ notifications, unreadCount, success: true });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        throw new ApiError(404, "Notification not found.");
    }
    if (notification.user.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to update this notification.");
    }
    notification.read = true;
    await notification.save();
    return res.status(200).json({ success: true });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.id, read: false }, { $set: { read: true } });
    return res.status(200).json({ success: true });
});
