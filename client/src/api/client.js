const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "budget_planner_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok || result.success === false) {
    const errorMsg = result.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMsg);
  }

  return result.data;
}

export const api = {
  //Auth api
  register: (email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Budget API
  getBudgets: () => request("/budgets"),
  getBudgetById: (id) => request(`/budgets/${id}`),
  createBudget: (data) =>
    request("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBudget: (id, data) =>
    request(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBudget: (id) =>
    request(`/budgets/${id}`, {
      method: "DELETE",
    }),

  // Expense API
  getExpensesForBudget: (budgetId) => request(`/budgets/${budgetId}/expenses`),
  createExpense: (budgetId, data) =>
    request(`/budgets/${budgetId}/expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateExpense: (id, data) =>
    request(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteExpense: (id) =>
    request(`/expenses/${id}`, {
      method: "DELETE",
    }),
};
