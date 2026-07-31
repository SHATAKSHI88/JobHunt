import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";

export const register = asyncHandler(async (req, res) => {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
        throw new ApiError(400, "Something is missing");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid email address.");
    }
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long.");
    }
    if (!["student", "recruiter"].includes(role)) {
        throw new ApiError(400, "Invalid role.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email.");
    }

    let profilePhoto = "";
    // Resume/photo upload is optional at signup - don't crash if it's missing.
    if (req.file) {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        profilePhoto = cloudResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        fullname,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        profile: {
            profilePhoto,
        },
    });

    return res.status(201).json({
        message: "Account created successfully.",
        success: true,
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        throw new ApiError(400, "Something is missing");
    }

    let user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Incorrect email or password.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(400, "Incorrect email or password.");
    }

    if (role !== user.role) {
        throw new ApiError(400, "Account doesn't exist with current role.");
    }

    const tokenData = {
        userId: user._id,
        role: user.role,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "1d" });

    user = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
    };

    return res
        .status(200)
        .cookie("token", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
        })
        .json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true,
        });
});

export const logout = asyncHandler(async (req, res) => {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
        message: "Logged out successfully.",
        success: true,
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const userId = req.id; // set by isAuthenticated middleware
    let user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skills.split(",").map((s) => s.trim());

    // Resume upload is optional here too - only touch cloudinary if a file came in.
    if (req.file) {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        user.profile.resume = cloudResponse.secure_url;
        user.profile.resumeOriginalName = req.file.originalname;
    }

    await user.save();

    user = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
    };

    return res.status(200).json({
        message: "Profile updated successfully.",
        user,
        success: true,
    });
});

// --- Forgot / Reset Password ---

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required.");
    }

    const user = await User.findOne({ email });
    // Always respond the same way whether or not the user exists,
    // so this endpoint can't be used to check which emails are registered.
    if (!user) {
        return res.status(200).json({
            message: "If that email is registered, a reset link has been sent.",
            success: true,
        });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const sent = await sendEmail({
        to: user.email,
        subject: "Reset your JobHunt password",
        html: `
            <p>Hi ${user.fullname},</p>
            <p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
        `,
    });

    if (!sent) {
        // Don't leave a dangling reset token if we couldn't tell the user about it.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Could not send reset email. Please try again later.");
    }

    return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
        success: true,
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long.");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
        throw new ApiError(400, "Reset link is invalid or has expired.");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
        message: "Password has been reset successfully. You can now log in.",
        success: true,
    });
});
