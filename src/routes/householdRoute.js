import express from "express";
import {
  createHousehold,
} from "../controllers/householdController.js";

const router = express.Router();

router.post("/", createHousehold);

export default router;