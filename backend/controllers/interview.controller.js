import { randomUUID } from "crypto";
import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import { createDailyRoom, createMeetingToken, deleteDailyRoom } from "../utils/dailyApi.js";
import { createNotification } from "./notification.controller.js";

const ROOM_BUFFER_SECONDS = 60 * 60; // keep the room alive 1hr past the scheduled end, in case it runs long
const TOKEN_LIFETIME_SECONDS = 60 * 30; // join tokens are short-lived; minted fresh each time someone hits "Join"

// POST /api/v1/interview/schedule/:applicationId  (recruiter only)
export const scheduleInterview = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { scheduledAt, durationMinutes } = req.body;

    if (!scheduledAt) {
        throw new ApiError(400, "scheduledAt is required.");
    }
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        throw new ApiError(400, "scheduledAt must be a valid date in the future.");
    }

    const application = await Application.findById(applicationId)
        .populate({ path: "job", populate: { path: "company" } })
        .populate("applicant");
    if (!application) {
        throw new ApiError(404, "Application not found.");
    }
    if (application.job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to schedule an interview for this application.");
    }
    if (application.status !== "accepted") {
        throw new ApiError(400, "Only accepted applications can have an interview scheduled.");
    }

    const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 30;
    const roomName = `jobhunt-${randomUUID()}`;
    const expiry = Math.floor(scheduledDate.getTime() / 1000) + duration * 60 + ROOM_BUFFER_SECONDS;

    const room = await createDailyRoom({ name: roomName, expiryUnixSeconds: expiry });

    // Upsert: re-scheduling an application that already had an interview
    // reuses the same document instead of creating duplicates.
    const interview = await Interview.findOneAndUpdate(
        { application: application._id },
        {
            application: application._id,
            job: application.job._id,
            recruiter: req.id,
            candidate: application.applicant._id,
            scheduledAt: scheduledDate,
            durationMinutes: duration,
            roomName,
            roomUrl: room.url,
            status: "scheduled",
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    sendEmail({
        to: application.applicant?.email,
        subject: `Interview scheduled: ${application.job.title}`,
        html: `<p>Hi ${application.applicant?.fullname || ""},</p>
               <p>Your interview for <strong>${application.job.title}</strong> at ${application.job.company?.name || "the company"} has been scheduled for <strong>${scheduledDate.toLocaleString()}</strong> (${duration} minutes).</p>
               <p>Log in to JobHunt and go to "My Applications" to join the video call at the scheduled time.</p>`,
    }).catch(() => {});

    createNotification({
        user: application.applicant?._id,
        type: "interview",
        title: `Interview scheduled: ${application.job.title}`,
        message: `${application.job.company?.name || "The company"} scheduled your interview for ${scheduledDate.toLocaleString()}.`,
        link: `/profile`,
    });

    return res.status(201).json({
        message: "Interview scheduled successfully.",
        interview,
        success: true,
    });
});

// PATCH /api/v1/interview/:id/reschedule  (recruiter only)
export const rescheduleInterview = asyncHandler(async (req, res) => {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
        throw new ApiError(400, "scheduledAt is required.");
    }
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        throw new ApiError(400, "scheduledAt must be a valid date in the future.");
    }

    const interview = await Interview.findById(req.params.id)
        .populate({ path: "job" })
        .populate("candidate");
    if (!interview) {
        throw new ApiError(404, "Interview not found.");
    }
    if (interview.recruiter.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to reschedule this interview.");
    }

    interview.scheduledAt = scheduledDate;
    interview.status = "scheduled";
    await interview.save();

    sendEmail({
        to: interview.candidate?.email,
        subject: `Interview rescheduled: ${interview.job.title}`,
        html: `<p>Hi ${interview.candidate?.fullname || ""},</p>
               <p>Your interview for <strong>${interview.job.title}</strong> has been rescheduled to <strong>${scheduledDate.toLocaleString()}</strong>.</p>`,
    }).catch(() => {});

    createNotification({
        user: interview.candidate?._id,
        type: "interview",
        title: `Interview rescheduled: ${interview.job.title}`,
        message: `Your interview is now set for ${scheduledDate.toLocaleString()}.`,
        link: `/profile`,
    });

    return res.status(200).json({
        message: "Interview rescheduled successfully.",
        interview,
        success: true,
    });
});

// PATCH /api/v1/interview/:id/cancel  (recruiter only)
export const cancelInterview = asyncHandler(async (req, res) => {
    const interview = await Interview.findById(req.params.id)
        .populate({ path: "job" })
        .populate("candidate");
    if (!interview) {
        throw new ApiError(404, "Interview not found.");
    }
    if (interview.recruiter.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to cancel this interview.");
    }

    interview.status = "cancelled";
    await interview.save();
    deleteDailyRoom(interview.roomName).catch(() => {});

    sendEmail({
        to: interview.candidate?.email,
        subject: `Interview cancelled: ${interview.job.title}`,
        html: `<p>Hi ${interview.candidate?.fullname || ""},</p>
               <p>Your interview for <strong>${interview.job.title}</strong> scheduled on ${interview.scheduledAt.toLocaleString()} has been cancelled. The recruiter may reach out to reschedule.</p>`,
    }).catch(() => {});

    createNotification({
        user: interview.candidate?._id,
        type: "interview",
        title: `Interview cancelled: ${interview.job.title}`,
        message: `Your interview scheduled for ${interview.scheduledAt.toLocaleString()} was cancelled.`,
        link: `/profile`,
    });

    return res.status(200).json({
        message: "Interview cancelled.",
        success: true,
    });
});

// GET /api/v1/interview/application/:applicationId  (recruiter or the candidate who owns it)
export const getInterviewByApplication = asyncHandler(async (req, res) => {
    const interview = await Interview.findOne({ application: req.params.applicationId });
    if (!interview) {
        return res.status(200).json({ interview: null, success: true });
    }
    if (interview.recruiter.toString() !== req.id && interview.candidate.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to view this interview.");
    }
    return res.status(200).json({ interview, success: true });
});

// GET /api/v1/interview/my  (either role — returns interviews where the user is recruiter or candidate)
export const getMyInterviews = asyncHandler(async (req, res) => {
    const interviews = await Interview.find({
        $or: [{ recruiter: req.id }, { candidate: req.id }],
    })
        .sort({ scheduledAt: 1 })
        .populate({ path: "job", populate: { path: "company" } })
        .populate("candidate", "fullname email profile.profilePhoto")
        .populate("recruiter", "fullname email");

    return res.status(200).json({ interviews, success: true });
});

// GET /api/v1/interview/:id/join  (recruiter or candidate on that interview)
export const joinInterview = asyncHandler(async (req, res) => {
    const interview = await Interview.findById(req.params.id).populate("candidate recruiter", "fullname");
    if (!interview) {
        throw new ApiError(404, "Interview not found.");
    }
    if (interview.status === "cancelled") {
        throw new ApiError(400, "This interview has been cancelled.");
    }

    const isRecruiter = interview.recruiter._id.toString() === req.id;
    const isCandidate = interview.candidate._id.toString() === req.id;
    if (!isRecruiter && !isCandidate) {
        throw new ApiError(403, "You are not authorized to join this interview.");
    }

    const userName = isRecruiter ? interview.recruiter.fullname : interview.candidate.fullname;
    const expiry = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
    const token = await createMeetingToken({
        roomName: interview.roomName,
        userName,
        isOwner: isRecruiter,
        expiryUnixSeconds: expiry,
    });

    return res.status(200).json({
        roomUrl: interview.roomUrl,
        token,
        isOwner: isRecruiter,
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes,
        success: true,
    });
});
