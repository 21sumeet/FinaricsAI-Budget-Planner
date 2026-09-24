import pool from "../db/pool.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

// Helper to validate month format YYYY-MM
const isValidMonthFormat = (monthStr) =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(monthStr);

export const createBudget = async (req, res, next) => {
  try {
    const { category, monthly_limit, month } = req.body;
    const userId = req.userId;
    if (!category || typeof category !== "string" || !category.trim()) {
      return sendError(res, "Category is required", 400);
    }

    const numericLimit = Number(monthly_limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      return sendError(res, "Monthly limit must be a positive number", 400);
    }

    if (!month || !isValidMonthFormat(month)) {
      return sendError(
        res,
        "Month must be in YYYY-MM format (e.g. 2026-09)",
        400,
      );
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, monthly_limit, month)
       VALUES ($1, $2, $3, $4)
       RETURNING id, category, monthly_limit::float AS monthly_limit, month, created_at`,
      [userId, category.trim(), numericLimit, month],
    );

    const newBudget = {
      ...result.rows[0],
      spent: 0,
      remaining: result.rows[0].monthly_limit,
    };

    return sendSuccess(res, newBudget, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllBudgets = async (req, res, next) => {
  const userId = req.userId;
  try {
    const query = `
      SELECT 
        b.id,
        b.category,
        b.monthly_limit::float AS monthly_limit,
        b.month,
        b.created_at,
        COALESCE(SUM(e.amount), 0)::float AS spent,
        (b.monthly_limit - COALESCE(SUM(e.amount), 0))::float AS remaining
      FROM budgets b
      LEFT JOIN expenses e ON b.id = e.budget_id
      WHERE b.user_id = $1
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

export const getBudgetById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const budgetId = Number(id);
    if (isNaN(budgetId)) {
      return sendError(res, "Invalid budget ID", 400);
    }

    const budgetQuery = `
      SELECT 
        b.id,
        b.category,
        b.monthly_limit::float AS monthly_limit,
        b.month,
        b.created_at,
        COALESCE(SUM(e.amount), 0)::float AS spent,
        (b.monthly_limit - COALESCE(SUM(e.amount), 0))::float AS remaining
      FROM budgets b
      LEFT JOIN expenses e ON b.id = e.budget_id
      WHERE b.id = $1 AND b.user_id = $2
      GROUP BY b.id
    `;
    const budgetResult = await pool.query(budgetQuery, [budgetId, userId]);

    if (budgetResult.rows.length === 0) {
      return sendError(res, "Budget not found", 404);
    }

    const expensesQuery = `
      SELECT id, budget_id, amount::float AS amount, description, date, created_at
      FROM expenses
      WHERE budget_id = $1
      ORDER BY date DESC, created_at DESC
    `;
    const expensesResult = await pool.query(expensesQuery, [budgetId]);

    const budgetData = {
      ...budgetResult.rows[0],
      expenses: expensesResult.rows,
    };

    return sendSuccess(res, budgetData);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const budgetId = Number(id);
    if (isNaN(budgetId)) {
      return sendError(res, "Invalid budget ID", 400);
    }

    const { category, monthly_limit, month } = req.body;

    if (!category || typeof category !== "string" || !category.trim()) {
      return sendError(res, "Category is required", 400);
    }

    const numericLimit = Number(monthly_limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      return sendError(res, "Monthly limit must be a positive number", 400);
    }

    if (!month || !isValidMonthFormat(month)) {
      return sendError(
        res,
        "Month must be in YYYY-MM format (e.g. 2026-09)",
        400,
      );
    }

    const updateQuery = `
      UPDATE budgets
      SET category = $1, monthly_limit = $2, month = $3
      WHERE id = $4 AND user_id = $5 RETURNING *
    `;
    const result = await pool.query(updateQuery, [
      category.trim(),
      numericLimit,
      month,
      budgetId,
      userId,
    ]);

    if (result.rows.length === 0) {
      return sendError(res, "Budget not found", 404);
    }

    // Return updated budget details with computed fields
    const getQuery = `
      SELECT 
        b.id,
        b.category,
        b.monthly_limit::float AS monthly_limit,
        b.month,
        b.created_at,
        COALESCE(SUM(e.amount), 0)::float AS spent,
        (b.monthly_limit - COALESCE(SUM(e.amount), 0))::float AS remaining
      FROM budgets b
      LEFT JOIN expenses e ON b.id = e.budget_id
      WHERE b.id = $1
      GROUP BY b.id
    `;
    const updatedResult = await pool.query(getQuery, [budgetId]);

    return sendSuccess(res, updatedResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const budgetId = Number(id);
    if (isNaN(budgetId)) {
      return sendError(res, "Invalid budget ID", 400);
    }

    const deleteQuery =
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id";
    const result = await pool.query(deleteQuery, [budgetId, userId]);

    if (result.rows.length === 0) {
      return sendError(res, "Budget not found", 404);
    }

    return sendSuccess(res, {
      message: "Budget deleted successfully",
      id: budgetId,
    });
  } catch (error) {
    next(error);
  }
};
