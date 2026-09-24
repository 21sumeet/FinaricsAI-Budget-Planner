import pool from "../db/pool.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const createExpense = async (req, res, next) => {
  try {
    const userId = req.userId;
    const budgetId = Number(req.params.id);
    if (isNaN(budgetId)) {
      return sendError(res, "Invalid budget ID", 400);
    }

    // 1. Verify budget exists and fetch monthly limit
    const budgetCheck = await pool.query(
      "SELECT monthly_limit::float AS monthly_limit FROM budgets WHERE id = $1 AND user_id = $2",
      [budgetId, userId],
    );

    if (budgetCheck.rows.length === 0) {
      return sendError(res, "Budget not found", 404);
    }

    const monthlyLimit = budgetCheck.rows[0].monthly_limit;
    const { amount, description, date } = req.body;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return sendError(res, "Amount must be a positive number", 400);
    }

    const cleanDescription =
      description && typeof description === "string"
        ? description.trim()
        : null;

    // 2. Insert expense record
    const insertQuery = `
      INSERT INTO expenses (budget_id, amount, description, date)
      VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
      RETURNING id, budget_id, amount::float AS amount, description, date, created_at
    `;
    const insertResult = await pool.query(insertQuery, [
      budgetId,
      numericAmount,
      cleanDescription,
      date || null,
    ]);

    const newExpense = insertResult.rows[0];

    // 3. Compute total expenses for this budget to check over_budget flag
    const totalQuery =
      "SELECT COALESCE(SUM(amount), 0)::float AS total_spent FROM expenses WHERE budget_id = $1";
    const totalResult = await pool.query(totalQuery, [budgetId]);
    const totalSpent = totalResult.rows[0].total_spent;

    const over_budget = totalSpent > monthlyLimit;

    const responsePayload = {
      ...newExpense,
      over_budget,
    };

    return sendSuccess(res, responsePayload, 201);
  } catch (error) {
    next(error);
  }
};

export const getExpensesForBudget = async (req, res, next) => {
  try {
    const userId = req.userId;
    const budgetId = Number(req.params.id);
    if (isNaN(budgetId)) {
      return sendError(res, "Invalid budget ID", 400);
    }

    // Verify budget exists
    const budgetCheck = await pool.query(
      "SELECT id FROM budgets WHERE id = $1 AND user_id = $2",
      [budgetId, userId],
    );
    if (budgetCheck.rows.length === 0) {
      return sendError(res, "Budget not found", 404);
    }

    const query = `
      SELECT id, budget_id, amount::float AS amount, description, date, created_at
      FROM expenses
      WHERE budget_id = $1
      ORDER BY date DESC, created_at DESC
    `;
    const result = await pool.query(query, [budgetId]);
    return sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const userId = req.userId;
    const expenseId = Number(req.params.id);
    if (isNaN(expenseId)) {
      return sendError(res, "Invalid expense ID", 400);
    }

    const { amount, description, date } = req.body;

    let numericAmount = null;
    if (amount !== undefined) {
      numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return sendError(res, "Amount must be a positive number", 400);
      }
    }

    const cleanDescription =
      description !== undefined
        ? description
          ? String(description).trim()
          : null
        : undefined;

    // Check expense existence
    const existingCheck = await pool.query(
      `SELECT e.* FROM expenses e
      JOIN budgets b ON e.budget_id = b.id
      WHERE e.id = $1 AND b.user_id = $2`,
      [expenseId, userId],
    );
    if (existingCheck.rows.length === 0) {
      return sendError(res, "Expense not found", 404);
    }

    const currentExpense = existingCheck.rows[0];
    const finalAmount =
      numericAmount !== null ? numericAmount : currentExpense.amount;
    const finalDescription =
      cleanDescription !== undefined
        ? cleanDescription
        : currentExpense.description;
    const finalDate = date || currentExpense.date;

    const updateQuery = `
      UPDATE expenses
      SET amount = $1, description = $2, date = $3
      WHERE id = $4
      RETURNING id, budget_id, amount::float AS amount, description, date, created_at
    `;
    const result = await pool.query(updateQuery, [
      finalAmount,
      finalDescription,
      finalDate,
      expenseId,
    ]);

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.userId;
    const expenseId = Number(req.params.id);
    if (isNaN(expenseId)) {
      return sendError(res, "Invalid expense ID", 400);
    }

    const deleteQuery = `
    DELETE FROM expenses
    WHERE id = $1
    AND budget_id IN (SELECT id FROM budgets WHERE user_id = $2)
    RETURNING id, budget_id
  `;
    const result = await pool.query(deleteQuery, [expenseId, userId]);

    if (result.rows.length === 0) {
      return sendError(res, "Expense not found", 404);
    }

    return sendSuccess(res, {
      message: "Expense deleted successfully",
      id: expenseId,
      budget_id: result.rows[0].budget_id,
    });
  } catch (error) {
    next(error);
  }
};
