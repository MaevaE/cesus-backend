import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import individualRoutes from "./routes/individualRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/individuals", individualRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;