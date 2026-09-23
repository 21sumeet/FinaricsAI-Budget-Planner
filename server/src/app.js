import express from "express";
import cors from "cors";
import budgetRoutes from "./routes/budgets.js";
import expenseRoutes from "./routes/expenses.js";
import authRoutes from "./routes/auth.js";
import { sendError } from "./utils/responseHelper.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 404 handler
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.url} not found`, 404);
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  const message = err.message || "Internal Server Error";
  return sendError(res, message, 500);
});

export default app;
