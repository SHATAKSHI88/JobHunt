import { JobAlert } from "../models/jobAlert.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import { createNotification } from "./notification.controller.js";

export const createJobAlert = asyncHandler(async (req, res) => {
    const { label, keyword, location, jobType } = req.body;
    if (!label) {
        throw new ApiError(400, "Give this alert a name.");
    }
    if (!keyword && !location && !jobType) {
        throw new ApiError(400, "An alert needs at least one criterion (keyword, location, or job type).");
    }

    const alert = await JobAlert.create({
        user: req.id,
        label,
        keyword: keyword || "",
        location: location || "",
        jobType: jobType || "",
    });

    return res.status(201).json({
        message: "Job alert created. We'll email you when a matching role is posted.",
        alert,
        success: true,
    });
});

export const getMyJobAlerts = asyncHandler(async (req, res) => {
    const alerts = await JobAlert.find({ user: req.id }).sort({ createdAt: -1 });
    return res.status(200).json({ alerts, success: true });
});

export const deleteJobAlert = asyncHandler(async (req, res) => {
    const alert = await JobAlert.findById(req.params.id);
    if (!alert) {
        throw new ApiError(404, "Alert not found.");
    }
    if (alert.user.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to delete this alert.");
    }
    await alert.deleteOne();
    return res.status(200).json({ message: "Alert deleted.", success: true });
});

// Called (fire-and-forget, non-blocking) after a new job is posted.
// Finds every alert whose criteria match the new job and emails the
// alert's owner. Never throws — a failed notification should never
// affect the job-posting flow that triggered it.
export const notifyMatchingAlerts = async (job) => {
    try {
        const candidateAlerts = await JobAlert.find({}).populate("user", "email fullname");

        const titleAndDesc = `${job.title} ${job.description}`.toLowerCase();

        const matches = candidateAlerts.filter((alert) => {
            const keywordOk = !alert.keyword || titleAndDesc.includes(alert.keyword.toLowerCase());
            const locationOk = !alert.location || alert.location.toLowerCase() === (job.location || "").toLowerCase();
            const jobTypeOk = !alert.jobType || alert.jobType.toLowerCase() === (job.jobType || "").toLowerCase();
            return keywordOk && locationOk && jobTypeOk;
        });

        for (const alert of matches) {
            if (!alert.user?.email) continue;
            sendEmail({
                to: alert.user.email,
                subject: `New match for your alert "${alert.label}": ${job.title}`,
                html: `
                    <p>Hi ${alert.user.fullname || ""},</p>
                    <p>A new job matching your saved alert <strong>"${alert.label}"</strong> was just posted:</p>
                    <p><strong>${job.title}</strong> — ${job.location} · ${job.jobType}</p>
                    <p><a href="${process.env.CLIENT_URL}/description/${job._id}">View the job</a></p>
                `,
            }).catch(() => {});

            createNotification({
                user: alert.user._id,
                type: "job_alert",
                title: `New match: ${job.title}`,
                message: `Matches your alert "${alert.label}" — ${job.location} · ${job.jobType}`,
                link: `/description/${job._id}`,
            });
        }
    } catch (error) {
        console.error("notifyMatchingAlerts failed:", error);
    }
};
