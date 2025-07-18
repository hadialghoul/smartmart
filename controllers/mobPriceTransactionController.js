import MobPriceTransaction from '../models/MobPriceTransaction.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import PriceData from '../models/PriceData.js';

// CREATE - Add new transaction
export const createTransaction = async (req, res) => {
  try {
    const { user_name, user_id, date, item_number, branch_id, token } = req.body;
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;

    let finalUserId = user_id;

    // If token is provided (web or mobile), use it to find the user
    if (token) {
      const user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: user not found'
        });
      }
      finalUserId = user.id;
    }

    // Validate required fields
    if (!date || !item_number || !branch_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: date, item_number, branch_id'
      });
    }

    // For web version, require user_name or user_id if no token
    if (!is_mobile && !token && !user_name && !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Either token, user_name or user_id is required for web requests'
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

    // If user_name is provided but no user_id and no token, find the user
    if (user_name && !finalUserId) {
      const user = await User.findOne({ where: { user_name } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with the provided user_name'
        });
      }
      finalUserId = user.id;
    }

    const transaction = await MobPriceTransaction.create({
      user_id: finalUserId,
      date,
      item_number,
      branch_id,
      created_by: finalUserId,
      created_at: new Date(),
      updated_at: new Date()
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
    const { page = 1, limit = 10, user_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Add user_id filter if provided
    if (user_id) {
      whereClause.user_id = user_id;
    }

    const transactions = await MobPriceTransaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'type', 'address']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_name', 'email_address'],
          foreignKey: 'user_id'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions: transactions.rows,
        pagination: {
          total: transactions.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(transactions.count / limit)
        }
      }
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

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }
    
    const transaction = await MobPriceTransaction.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'type', 'address']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_name', 'email_address'],
          foreignKey: 'user_id'
        }
      ]
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
    const { user_name, user_id, date, item_number, branch_id, token } = req.body;
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    let authenticatedUserId = null;

    // Handle mobile authentication
    if (is_mobile) {
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required for mobile requests'
        });
      }
      
      const user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: user not found'
        });
      }
      authenticatedUserId = user.id;
    }

    const transaction = await MobPriceTransaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // For mobile, ensure user can only update their own transactions
    if (is_mobile && transaction.user_id !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own transactions'
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

    // Handle user_id update if user_name is provided
    let finalUserId = user_id || transaction.user_id;
    if (user_name && !user_id) {
      const user = await User.findOne({ where: { user_name } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with the provided user_name'
        });
      }
      finalUserId = user.id;
    }

    const updateData = {
      user_id: finalUserId,
      date: date || transaction.date,
      item_number: item_number || transaction.item_number,
      branch_id: branch_id || transaction.branch_id,
      updated_by: authenticatedUserId || finalUserId,
      updated_at: new Date()
    };

    await transaction.update(updateData);

    // Fetch updated transaction with associations
    const updatedTransaction = await MobPriceTransaction.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'type', 'address']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_name', 'email_address'],
          foreignKey: 'user_id'
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
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

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }
    
    const transaction = await MobPriceTransaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if there are associated PriceData records
    const associatedPriceData = await PriceData.findAll({
      where: { transaction_id: id }
    });

    if (associatedPriceData.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete transaction with associated price data. Delete price data first.'
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