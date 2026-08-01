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
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/save-job/:id").post(isAuthenticated, toggleSaveJob);
router.route("/saved-jobs").get(isAuthenticated, getSavedJobs);

export default router;
