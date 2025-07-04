import express from "express"
const router = express.Router();
import {
  createPriceData,
  getAllPriceData,
  getPriceDataById,
  updatePriceData,
  deletePriceData,
  getPriceDataByTransactionId // add this import
} from "../controllers/mobPriceData.js";

// POST /api/transactions - Create new transaction
router.post('/', createPriceData);

// GET /api/transactions - Get all transactions
router.get('/', getAllPriceData);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', getPriceDataById);

// PUT /api/transactions/:id - Update transaction by ID
router.put('/:id', updatePriceData);

// DELETE /api/transactions/:id - Delete transaction by ID
router.delete('/:id', deletePriceData);

// GET /api/price-data/transaction/:transaction_id - Get all products in PriceData for a transaction
router.get('/transaction/:transaction_id', getPriceDataByTransactionId);

export default router;