# Budget Planner Full-Stack Setup Guide

A full-stack Budget Planner application with a React + Vite + Tailwind CSS frontend and a Node.js + Express + PostgreSQL (NeonDB) backend.

## Project Structure

```
budget-planner/
├── client/          # React + Vite + Tailwind CSS v4
├── server/          # Node + Express + PostgreSQL (Neon)
└── README.md
```

---

## 1. Database Setup (Neon PostgreSQL)

1. Sign up/Log in at [neon.tech](https://neon.tech/).
2. Create a new project named `budget-planner`.
3. Open the **SQL Editor** in your Neon dashboard and execute the following SQL script to create the required tables:

```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  monthly_limit NUMERIC(10, 2) NOT NULL,
  month VARCHAR(7) NOT NULL, -- format: '2026-09'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

> **Note on `ON DELETE CASCADE`**: When a budget entry is deleted, all associated expenses are automatically removed by PostgreSQL.

4. Copy your connection string from **Dashboard → Connection Details**. Update `server/.env`:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx.neon.tech/dbname?sslmode=require
PORT=5000
```

---

## 2. Backend Setup (`server/`)

```bash
cd server
npm install
npm run dev
```

The Express server will start on [http://localhost:5000](http://localhost:5000).  
Test the health endpoint: [http://localhost:5000/api/health](http://localhost:5000/api/health) (returns `{"status": "ok"}`).

---

## 3. Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev
```

The React frontend (configured with `@tailwindcss/vite` and Tailwind v4) will start on [http://localhost:5173](http://localhost:5173).  
`client/.env` connects to the backend:

```env
VITE_API_URL=http://localhost:5000/api
```
