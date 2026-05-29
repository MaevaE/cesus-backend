import express from "express";
import { getDashboardStats } from "./dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;