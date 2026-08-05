import express from "express";
import {
    login,
    logout,
    register,
    updateProfile,
    forgotPassword,
    resetPassword,
    toggleSaveJob,
    getSavedJobs,
    verifyEmail,
    resendVerification,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
import { authLimiter, resendLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.route("/register").post(authLimiter, singleUpload, register);
router.route("/login").post(authLimiter, login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/forgot-password").post(authLimiter, forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/save-job/:id").post(isAuthenticated, toggleSaveJob);
router.route("/saved-jobs").get(isAuthenticated, getSavedJobs);
router.route("/verify-email/:token").post(verifyEmail);
router.route("/resend-verification").post(isAuthenticated, resendLimiter, resendVerification);

export default router;
