import express from "express"
const router = express.Router();
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  upload,
} from "../controllers/mobPurshaseTransactionController.js";

// POST /api/transactions - Create new transaction
router.post('/',upload.single('image'), createTransaction);

// GET /api/transactions - Get all transactions
router.get('/', getAllTransactions);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', getTransactionById);

// PUT /api/transactions/:id - Update transaction by ID
router.put('/:id',upload.single('image'), updateTransaction);

// DELETE /api/transactions/:id - Delete transaction by ID
router.delete('/:id', deleteTransaction);

export default router;