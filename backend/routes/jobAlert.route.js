import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createJobAlert, getMyJobAlerts, deleteJobAlert } from "../controllers/jobAlert.controller.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createJobAlert);
router.route("/").get(isAuthenticated, getMyJobAlerts);
router.route("/:id").delete(isAuthenticated, deleteJobAlert);

export default router;
