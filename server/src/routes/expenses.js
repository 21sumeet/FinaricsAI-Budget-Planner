import express from "express";
import {
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";
import { requireAuth } from "../middleware/authmiddleware.js";

const router = express.Router();
router.use(requireAuth);

router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
