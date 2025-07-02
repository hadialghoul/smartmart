import express from "express"
const router = express.Router();
import {
  createInventoryTransaction,
  getAllInventoryTransactions,
  getInventoryTransactionById,
  updateInventoryTransaction,
  deleteInventoryTransaction,
} from "../controllers/mobInventoryTransactionController.js";

// POST /api/transactions - Create new transaction
router.post('/', createInventoryTransaction);

// GET /api/transactions - Get all transactions
router.get('/', getAllInventoryTransactions);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', getInventoryTransactionById);

// PUT /api/transactions/:id - Update transaction by ID
router.put('/:id', updateInventoryTransaction);

// DELETE /api/transactions/:id - Delete transaction by ID
router.delete('/:id', deleteInventoryTransaction);

export default router;