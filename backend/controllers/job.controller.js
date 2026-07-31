import { Job } from "../models/job.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// recruiter posts a job
export const postJob = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        requirements,
        salary,
        location,
        jobType,
        experience,
        position,
        companyId,
    } = req.body;
    const userId = req.id;

    if (
        !title ||
        !description ||
        !requirements ||
        !salary ||
        !location ||
        !jobType ||
        !experience ||
        !position ||
        !companyId
    ) {
        throw new ApiError(400, "Something is missing.");
    }

    if (isNaN(Number(salary)) || Number(salary) < 0) {
        throw new ApiError(400, "Salary must be a valid positive number.");
    }
    if (isNaN(Number(position)) || Number(position) < 1) {
        throw new ApiError(400, "Position count must be at least 1.");
    }

    const job = await Job.create({
        title,
        description,
        requirements: requirements.split(",").map((r) => r.trim()),
        salary: Number(salary),
        location,
        jobType,
        experienceLevel: experience,
        position,
        company: companyId,
        created_by: userId,
    });

    return res.status(201).json({
        message: "New job created successfully.",
        job,
        success: true,
    });
});

// student-facing job listing: search + filters + pagination
export const getAllJobs = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword || "";
    const { location, jobType, minSalary, maxSalary } = req.query;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 9, 1);

    const query = {
        $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ],
    };

    if (location) query.location = { $regex: `^${location}$`, $options: "i" };
    if (jobType) query.jobType = { $regex: `^${jobType}$`, $options: "i" };
    if (minSalary || maxSalary) {
        query.salary = {};
        if (minSalary) query.salary.$gte = Number(minSalary);
        if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
        .populate({ path: "company" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json({
        jobs,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page,
        success: true,
    });
});

// returns real, distinct filter options derived from the DB instead of a hardcoded list
export const getFilterOptions = asyncHandler(async (req, res) => {
    const [locations, jobTypes, salaryRange] = await Promise.all([
        Job.distinct("location"),
        Job.distinct("jobType"),
        Job.aggregate([
            {
                $group: {
                    _id: null,
                    min: { $min: "$salary" },
                    max: { $max: "$salary" },
                },
            },
        ]),
    ]);

    return res.status(200).json({
        locations: locations.filter(Boolean).sort(),
        jobTypes: jobTypes.filter(Boolean).sort(),
        salaryRange: salaryRange[0]
            ? { min: salaryRange[0].min, max: salaryRange[0].max }
            : { min: 0, max: 0 },
        success: true,
    });
});

export const getJobById = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
        .populate({ path: "company" })
        .populate({ path: "applications" });

    if (!job) {
        throw new ApiError(404, "Job not found.");
    }
    return res.status(200).json({ job, success: true });
});

// jobs a specific recruiter has posted
export const getAdminJobs = asyncHandler(async (req, res) => {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
        .populate({ path: "company" })
        .sort({ createdAt: -1 });

    return res.status(200).json({
        jobs,
        success: true,
    });
});

export const updateJob = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found.");
    }
    if (job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to edit this job.");
    }

    const {
        title,
        description,
        requirements,
        salary,
        location,
        jobType,
        experience,
        position,
    } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements.split(",").map((r) => r.trim());
    if (salary) job.salary = Number(salary);
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (experience) job.experienceLevel = experience;
    if (position) job.position = position;

    await job.save();

    return res.status(200).json({
        message: "Job updated successfully.",
        job,
        success: true,
    });
});

export const deleteJob = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found.");
    }
    if (job.created_by.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to delete this job.");
    }

    await job.deleteOne();

    return res.status(200).json({
        message: "Job deleted successfully.",
        success: true,
    });
});
