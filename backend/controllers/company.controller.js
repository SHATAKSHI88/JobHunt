import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const registerCompany = asyncHandler(async (req, res) => {
    const { companyName } = req.body;
    if (!companyName) {
        throw new ApiError(400, "Company name is required.");
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
        throw new ApiError(400, "You can't register the same company twice.");
    }

    company = await Company.create({
        name: companyName,
        userId: req.id,
    });

    return res.status(201).json({
        message: "Company registered successfully.",
        company,
        success: true,
    });
});

export const getCompany = asyncHandler(async (req, res) => {
    const userId = req.id;
    const companies = await Company.find({ userId });
    return res.status(200).json({
        companies,
        success: true,
    });
});

export const getCompanyById = asyncHandler(async (req, res) => {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
        throw new ApiError(404, "Company not found.");
    }
    return res.status(200).json({
        company,
        success: true,
    });
});

export const updateCompany = asyncHandler(async (req, res) => {
    const { name, description, website, location } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
        throw new ApiError(404, "Company not found.");
    }
    // Only the recruiter who registered this company can edit it.
    if (company.userId.toString() !== req.id) {
        throw new ApiError(403, "You are not authorized to update this company.");
    }

    if (name) company.name = name;
    if (description) company.description = description;
    if (website) company.website = website;
    if (location) company.location = location;

    // Logo upload is optional on update - don't crash if no new file was sent.
    if (req.file) {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        company.logo = cloudResponse.secure_url;
    }

    await company.save();

    return res.status(200).json({
        message: "Company information updated.",
        company,
        success: true,
    });
});
