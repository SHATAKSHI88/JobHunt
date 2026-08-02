import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import { extractTextFromUrl } from "../utils/pdfText.js";
import { scoreResumeMatch, generateDetailedAnalysis } from "../utils/geminiMatch.js";

const SHORTLIST_THRESHOLD = Number(process.env.SHORTLIST_THRESHOLD) || 70;
const GENDER_OPTIONS = ["male", "female", "prefer_not_to_say"];

// POST /api/v1/application/apply/:id  (candidate) — submits the screening
// form (gender, disability, relative-at-company, nationality, terms) along
// with the application itself.
export const applyJob = asyncHandler(async (req, res) => {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
        throw new ApiError(400, "Job id is required.");
    }

    const {
        gender,
        hasDisability,
        disabilityDetails,
        hasRelativeAtCompany,
        relativeDetails,
        nationality,
        agreedToTerms,
    } = req.body;

    // Validate the screening form before touching the DB — every field here
    // is required except the two conditional detail boxes.
    if (!gender || !GENDER_OPTIONS.includes(gender)) {
        throw new ApiError(400, "Please select a valid gender option.");
    }
    if (typeof hasDisability !== "boolean") {
        throw new ApiError(400, "Please answer the disability question.");
    }
    if (hasDisability && !disabilityDetails?.trim()) {
        throw new ApiError(400, "Please share a few details about your disability.");
    }
    if (typeof hasRelativeAtCompany !== "boolean") {
        throw new ApiError(400, "Please answer the relative-at-company question.");
    }
    if (!nationality?.trim()) {
        throw new ApiError(400, "Nationality is required.");
    }
    if (agreedToTerms !== true) {
        throw new ApiError(400, "You must agree to the terms and conditions to apply.");
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
        gender,
        hasDisability,
        disabilityDetails: hasDisability ? disabilityDetails.trim() : undefined,
        hasRelativeAtCompany,
        relativeDetails: hasRelativeAtCompany ? (relativeDetails || "").trim() : undefined,
        nationality: nationality.trim(),
        agreedToTerms: true,
    });

    job.applications.push(newApplication._id);
    await job.save();

    const applicant = await User.findById(userId);

    // Auto resume-vs-JD scoring, best-effort. Only runs if the recruiter
    // attached a JD PDF to the job and the candidate has a resume on file —
    // otherwise the application just stays "pending" for manual review, same
    // as before this feature existed. A scoring failure (bad API key, Gemini
    // down, unparseable PDF, etc.) never blocks the application itself.
    if (job.jdText && applicant?.profile?.resume) {
        try {
            const resumeText = await extractTextFromUrl(applicant.profile.resume);
            const { score, summary } = await scoreResumeMatch({
                resumeText,
                jobDescription: job.description,
                requirements: job.requirements,
            });
            newApplication.matchScore = score;
            newApplication.matchSummary = summary;
            if (score >= SHORTLIST_THRESHOLD) {
                // Reuses the exact same "accepted" status the recruiter's manual
                // Accept button sets — this is what makes "Schedule interview"
                // appear automatically, no separate wiring needed.
                newApplication.status = "accepted";
            }
            await newApplication.save();
        } catch (error) {
            console.error("Resume-JD matching failed:", error.message);
        }
    }

    // Best-effort confirmation email - failure here should never block the application.
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

// GET /api/v1/application/:id  (recruiter who owns the job only)
// Full detail for a single applicant — used by the applicant detail page.
export const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate("applicant")
        .populate({ path: "job", populate: { path: "company" } });

    if (!application) {
        throw new ApiError(404, "Application not found.");
    }
    if (application.job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to view this application.");
    }

    return res.status(200).json({ application, success: true });
});

// POST /api/v1/application/:id/analyze  (recruiter who owns the job only)
// Generates (or regenerates) the per-skill LLM breakdown for one candidate.
export const generateApplicantAnalysis = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate("applicant")
        .populate({ path: "job" });

    if (!application) {
        throw new ApiError(404, "Application not found.");
    }
    if (application.job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to analyze this application.");
    }
    if (!application.applicant?.profile?.resume) {
        throw new ApiError(400, "This candidate hasn't uploaded a resume.");
    }

    const resumeText = await extractTextFromUrl(application.applicant.profile.resume);
    const { skillScores, overallScore, overallSummary } = await generateDetailedAnalysis({
        resumeText,
        jobTitle: application.job.title,
        jobDescription: application.job.description,
        requirements: application.job.requirements,
    });

    application.detailedAnalysis = {
        skillScores,
        overallScore,
        overallSummary,
        generatedAt: new Date(),
    };
    await application.save();

    return res.status(200).json({
        message: "Analysis generated.",
        detailedAnalysis: application.detailedAnalysis,
        success: true,
    });
});
