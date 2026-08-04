import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getMyNotifications);
router.route("/:id/read").post(isAuthenticated, markNotificationRead);
router.route("/read-all").post(isAuthenticated, markAllNotificationsRead);

export default router;
