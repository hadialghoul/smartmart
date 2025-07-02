import express from "express"
const router = express.Router();
import {
  createInventoryData,
  getAllInventoryData,
  getInventoryDataById,
  updateInventoryData,
  deleteInventoryData,
} from "../controllers/mobInventoryDataController.js";

// POST /api/transactions - Create new transaction
router.post('/', createInventoryData);

// GET /api/transactions - Get all transactions
router.get('/', getAllInventoryData);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', getInventoryDataById);

// PUT /api/transactions/:id - Update transaction by ID
router.put('/:id', updateInventoryData);

// DELETE /api/transactions/:id - Delete transaction by ID
router.delete('/:id', deleteInventoryData);

export default router;