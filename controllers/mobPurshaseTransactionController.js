import MobPurshaseTransaction from '../models/mobPurshaseTransaction.js';
import Store from '../models/Store.js';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/images');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the upload directory defined above
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
})

// CREATE - Add new transaction
export const createTransaction = async (req, res) => {
  try {
    // Handle file upload for image
    let image = null;
    if (req.file) {
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://brain-space-hr-module-backend.onrender.com"
        : "http://localhost:5000";
      image = `${baseUrl}/uploads/images/${req.file.filename}`;
    }
    
    const { username, date, item_number, branch_id } = req.body;

    // Validate required fields
    if (!username || !date || !item_number || !branch_id) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, date, item_number, branch_id'
      });
    }

    // Check if store exists
    const store = await Store.findByPk(branch_id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found with the provided branch_id'
      });
    }

    const transaction = await MobPurshaseTransaction.create({
      username,
      date,
      item_number,
      branch_id,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// READ - Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await MobPurshaseTransaction.findAll({
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'type', 'address']
      }],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// READ - Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await MobPurshaseTransaction.findByPk(id, {
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'type', 'address']
      }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// UPDATE - Update transaction by ID
export const updateTransaction = async (req, res) => {
  try {
    // Handle file upload for image
    let image = null;
    if (req.file) {
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://brain-space-hr-module-backend.onrender.com"
        : "http://localhost:5000";
      image = `${baseUrl}/uploads/images/${req.file.filename}`;
    }
    
    const { id } = req.params;
    const { username, date, item_number, branch_id } = req.body;

    const transaction = await MobPurshaseTransaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If branch_id is being updated, check if store exists
    if (branch_id && branch_id !== transaction.branch_id) {
      const store = await Store.findByPk(branch_id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found with the provided branch_id'
        });
      }
    }

    await transaction.update({
      username: username || transaction.username,
      date: date || transaction.date,
      item_number: item_number || transaction.item_number,
      branch_id: branch_id || transaction.branch_id,
      image: image || transaction.image
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

// DELETE - Delete transaction by ID
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await MobPurshaseTransaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.destroy();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};