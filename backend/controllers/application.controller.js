import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";

export const applyJob = asyncHandler(async (req, res) => {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
        throw new ApiError(400, "Job id is required.");
    }

    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
        throw new ApiError(400, "You have already applied for this job.");
    }

    const job = await Job.findById(jobId).populate("company");
    if (!job) {
        throw new ApiError(404, "Job not found.");
    }

    const newApplication = await Application.create({
        job: jobId,
        applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();

    // Best-effort confirmation email - failure here should never block the application.
    const applicant = await User.findById(userId);
    sendEmail({
        to: applicant?.email,
        subject: `Application received: ${job.title}`,
        html: `<p>Thanks for applying to <strong>${job.title}</strong> at ${job.company?.name || "the company"}. We'll notify you when your status changes.</p>`,
    }).catch(() => {});

    return res.status(201).json({
        message: "Job applied successfully.",
        success: true,
    });
});

export const getAppliedJobs = asyncHandler(async (req, res) => {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
        .sort({ createdAt: -1 })
        .populate({
            path: "job",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "company",
                options: { sort: { createdAt: -1 } },
            },
        });

    return res.status(200).json({
        application,
        success: true,
    });
});

// recruiter view: applicants for one of their jobs
export const getApplicants = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
        path: "applications",
        options: { sort: { createdAt: -1 } },
        populate: { path: "applicant" },
    });

    if (!job) {
        throw new ApiError(404, "Job not found.");
    }
    // Only the recruiter who posted this job can see its applicants.
    if (job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to view these applicants.");
    }

    return res.status(200).json({
        job,
        success: true,
    });
});

export const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
        throw new ApiError(400, "Status is required.");
    }
    if (!["pending", "accepted", "rejected"].includes(status.toLowerCase())) {
        throw new ApiError(400, "Status must be pending, accepted, or rejected.");
    }

    const application = await Application.findById(applicationId).populate({
        path: "job",
        populate: { path: "company" },
    }).populate("applicant");

    if (!application) {
        throw new ApiError(404, "Application not found.");
    }
    // Only the recruiter who owns the job can change its applicants' status.
    if (application.job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to update this application.");
    }

    application.status = status.toLowerCase();
    await application.save();

    sendEmail({
        to: application.applicant?.email,
        subject: `Update on your application: ${application.job.title}`,
        html: `<p>Hi ${application.applicant?.fullname || ""},</p>
               <p>Your application for <strong>${application.job.title}</strong> at ${application.job.company?.name || "the company"} has been <strong>${application.status}</strong>.</p>`,
    }).catch(() => {});

    return res.status(200).json({
        message: "Status updated successfully.",
        success: true,
    });
});
