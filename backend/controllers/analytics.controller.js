import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Aggregated stats for the logged-in recruiter's dashboard:
// job/company counts, application status breakdown, a 30-day
// applications trend, and their top 5 jobs by applicant count.
export const getRecruiterAnalytics = asyncHandler(async (req, res) => {
    const recruiterId = req.id;

    const jobs = await Job.find({ created_by: recruiterId }).select("_id title createdAt");
    const jobIds = jobs.map((j) => j._id);

    const totalJobs = jobs.length;
    const totalCompanies = await Company.countDocuments({ userId: recruiterId });

    const statusBreakdownRaw = await Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusBreakdown = { pending: 0, accepted: 0, rejected: 0 };
    statusBreakdownRaw.forEach((s) => {
        statusBreakdown[s._id] = s.count;
    });
    const totalApplicants = statusBreakdown.pending + statusBreakdown.accepted + statusBreakdown.rejected;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const applicationsOverTimeRaw = await Application.aggregate([
        { $match: { job: { $in: jobIds }, createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    const applicationsOverTime = applicationsOverTimeRaw.map((d) => ({ date: d._id, count: d.count }));

    const topJobsRaw = await Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$job", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);
    const topJobs = topJobsRaw.map((tj) => {
        const job = jobs.find((j) => j._id.toString() === tj._id.toString());
        return { jobId: tj._id, title: job?.title || "Untitled role", count: tj.count };
    });

    return res.status(200).json({
        totalJobs,
        totalCompanies,
        totalApplicants,
        statusBreakdown,
        applicationsOverTime,
        topJobs,
        success: true,
    });
});
