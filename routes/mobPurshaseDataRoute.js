import express from "express"
const router = express.Router();
import {
  createPurshaseData, // FIXED: function names
  getAllPurshaseData,
  getPurshaseDataById,
  updatePurshaseData,
  deletePurshaseData,
} from "../controllers/mobPurshaseDataController.js";

router.post('/', createPurshaseData);
router.get('/', getAllPurshaseData);
router.get('/:id', getPurshaseDataById);
router.put('/:id', updatePurshaseData);
router.delete('/:id', deletePurshaseData);

export default router;