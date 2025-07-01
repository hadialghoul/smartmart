import MobPriceTransaction from '../models/MobPriceTransaction.js';
import Store from '../models/Store.js';
import PriceData from '../models/PriceData.js';

// CREATE - Add new transaction
export const createTransaction = async (req, res) => {
  try {
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

    const transaction = await MobPriceTransaction.create({
      username,
      date,
      item_number,
      branch_id
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
    const transactions = await MobPriceTransaction.findAll({
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
    
    const transaction = await MobPriceTransaction.findByPk(id, {
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
    const { id } = req.params;
    const { username, date, item_number, branch_id } = req.body;

    const transaction = await MobPriceTransaction.findByPk(id);
    
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
      branch_id: branch_id || transaction.branch_id
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
    
    const transaction = await MobPriceTransaction.findByPk(id);
    
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


