# Budget Planner — Full-Stack Finance Application

A full-stack CRUD application for managing category budgets and logging expenses against monthly limits. Built with a React + Vite + Tailwind CSS frontend and a Node.js + Express + PostgreSQL (NeonDB) backend.

![GitHub commit activity](https://img.shields.io/github/last-commit/21sumeet/FinaricsAI-Budget-Planner)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐        REST / JSON        ┌──────────────────┐        SQL        ┌──────────────────┐
│   React Client  │  <--------------------->  │  Express Server  │  <------------->  │ Neon PostgreSQL  │
│ (Vite + Tailwind│        fetch API          │    (Node.js)     │      pg pool     │    (Cloud DB)    │
└─────────────────┘                           └──────────────────┘                   └──────────────────┘
```

- **Stateless Server**: All application state resides in PostgreSQL.
- **Relational Data Model**: 1-to-Many (`Budget ──< Expenses`) with `ON DELETE CASCADE`.
- **Derived Real-Time Calculations**: `spent` and `remaining` amounts are calculated dynamically in SQL queries (`SUM(expenses.amount)`) so figures never fall out of sync.

---

## 🛠️ Tech Stack & Justifications

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS v4 | Rapid development server, zero config overhead, utility-first CSS styling without separate stylesheets. |
| **Backend** | Node.js + Express (ES Modules) | Minimalist, unopinionated framework with explicit middleware pipeline and clear route definitions. |
| **Database** | PostgreSQL (NeonDB) | Production-grade relational database with real foreign keys and constraints, hosted serverlessly. |
| **Database Driver** | `pg` (`pg.Pool`) | Direct SQL queries using node-postgres to keep query logic transparent and explainable without ORM abstractions. |

---

## 📁 Repository Structure

```
budget-planner/
├── client/                      # React Frontend Application
│   ├── src/
│   │   ├── api/client.js        # Centralized fetch API wrapper
│   │   ├── components/
│   │   │   ├── BudgetCard.jsx   # Budget category card with progress bar
│   │   │   ├── BudgetForm.jsx   # Modal form for Create / Edit budget
│   │   │   ├── ExpenseForm.jsx  # Expense logger with over_budget warning
│   │   │   ├── ExpenseList.jsx  # Table list with inline expense editing
│   │   │   └── ConfirmModal.jsx # Custom confirmation modal for deletions
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Overview dashboard with total metrics
│   │   │   └── BudgetDetail.jsx # Drill-down expense detail view
│   │   ├── App.jsx              # Lightweight state-driven view navigation
│   │   ├── index.css            # Tailwind CSS imports
│   │   └── main.jsx
│   ├── .env.example
│   └── vite.config.js
│
├── server/                      # Express Backend API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── budgetController.js   # Budget CRUD logic & SQL aggregation
│   │   │   └── expenseController.js  # Expense CRUD & over_budget calculation
│   │   ├── db/
│   │   │   ├── pool.js               # PostgreSQL connection pool
│   │   │   ├── schema.sql            # Table DDL definitions
│   │   │   └── initDb.js             # Automatic DB schema initializer
│   │   ├── routes/
│   │   │   ├── budgets.js            # Budget routes & nested expense creation
│   │   │   └── expenses.js           # Direct expense mutations (PUT/DELETE)
│   │   ├── utils/responseHelper.js   # Uniform JSON success/error envelopes
│   │   ├── app.js                    # Express app setup & error middleware
│   │   └── server.js                 # Server entry point
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+` installed
- **PostgreSQL Database**: A Neon PostgreSQL connection string (from [neon.tech](https://neon.tech/))

---

### 2. Backend Setup (`server/`)

1. Navigate to `server` and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create environment configuration file `server/.env`:
   ```bash
   cp .env.example .env
   ```

   Update `server/.env` with your Neon database URL:
   ```env
   DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxxx.neon.tech/neondb?sslmode=require
   PORT=5000
   ```

3. Initialize Database Tables automatically:
   ```bash
   npm run db:init
   ```
   *Executes `src/db/schema.sql` to create `budgets` and `expenses` tables.*

4. Start Backend Server:
   ```bash
   npm run dev
   ```
   The backend API will run at **http://localhost:5000**. Verify health check at [http://localhost:5000/api/health](http://localhost:5000/api/health).

---

### 3. Frontend Setup (`client/`)

1. Open a new terminal, navigate to `client`, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Create environment configuration file `client/.env`:
   ```bash
   cp .env.example .env
   ```

   `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start Frontend Development Server:
   ```bash
   npm run dev
   ```
   The React application will open at **http://localhost:5173**.

---

## 📡 API Reference

All API responses follow a uniform JSON structure:
- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "error": "Error description message" }`

### Budget Endpoints (`/api/budgets`)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/budgets` | Create a new budget | `{ "category": "Groceries", "monthly_limit": 5000, "month": "2026-09" }` |
| `GET` | `/api/budgets` | List all budgets with computed `spent` & `remaining` | None |
| `GET` | `/api/budgets/:id` | Get single budget detail + expense list | None |
| `PUT` | `/api/budgets/:id` | Update category, monthly_limit, or month | `{ "category": "Groceries", "monthly_limit": 6000, "month": "2026-09" }` |
| `DELETE` | `/api/budgets/:id` | Delete budget (cascades to expenses) | None |

### Expense Endpoints (`/api/expenses` & `/api/budgets/:id/expenses`)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/budgets/:id/expenses` | Log an expense against a budget | `{ "amount": 450, "description": "Supermarket", "date": "2026-09-22" }` |
| `GET` | `/api/budgets/:id/expenses` | List expenses for a budget | None |
| `PUT` | `/api/expenses/:id` | Update expense amount, description, date | `{ "amount": 500, "description": "Updated Supermarket" }` |
| `DELETE` | `/api/expenses/:id` | Delete an expense | None |

> **Note on `over_budget` Flag**: Creating an expense that causes total spending to exceed `monthly_limit` returns HTTP 201 with `"over_budget": true` in the response payload.

---

## 🎯 Key Architectural Decisions

1. **Computed vs. Stored State**:
   `spent` and `remaining` values are calculated at query time using SQL `LEFT JOIN expenses` and `SUM(expenses.amount)`. This guarantees mathematical consistency and prevents stored aggregate values from drifting out of sync.

2. **HTTP `PUT` Resource Semantics**:
   `PUT /api/budgets/:id` requires all budget fields (`category`, `monthly_limit`, `month`) as it represents a full replacement of the resource, matching the frontend edit modal state.

3. **Query Optimization vs. Readability**:
   `getBudgetById` separates budget aggregation and expense listing into two clean SQL queries to maintain query readability and prevent data duplication across join rows.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
