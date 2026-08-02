import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { jdUpload } from "../middlewares/multer.js";
import {
    getAdminJobs,
    getAllJobs,
    getFilterOptions,
    getJobById,
    postJob,
    updateJob,
    deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, jdUpload, postJob);
// Browsing is public — like a real job board, anyone can look without an
// account. Only posting/managing jobs requires being logged in as a recruiter.
router.route("/get").get(getAllJobs);
router.route("/filters").get(getFilterOptions);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/update/:id").put(isAuthenticated, jdUpload, updateJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);

export default router;
