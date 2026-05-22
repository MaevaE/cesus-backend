import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoute.js";
import householdRoutes from "./routes/householdRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;