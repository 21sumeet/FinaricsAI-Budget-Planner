-- Database Schema for Budget Planner

-- 1. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  monthly_limit NUMERIC(10, 2) NOT NULL CHECK (monthly_limit > 0),
  month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
