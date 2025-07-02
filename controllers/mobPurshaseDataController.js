import MobPurshaseTransaction from '../models/MobPurshaseTransaction.js';
import Store from '../models/Store.js';
import PurshaseData from "../models/PurshaseData.js";
import User from '../models/User.js';

// Create PurshaseData
export const createPurshaseData = async (req, res) => {
  try {
    const { name, datetime, barcode, quantity, cost, transaction_id, is_mobile, token, item_number, branch_id } = req.body;
    let user = null;
    if (is_mobile === true) {
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required for mobile requests'
        });
      }
      user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: user not found'
        });
      }
      // You can now use user.id or other user info as needed
      // createTransaction(user.username, datetime, item_number, branch_id, is_mobile);
    }
    
    // Validate required fields
    if (!name || !datetime || !quantity || !cost || !transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: name, datetime, quantity, cost, transaction_id'
      });
    }

    // Validate data types - FIXED: quantity validation message
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity must be a positive number'
      });
    }

    if (isNaN(cost) || cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'cost must be a non-negative number'
      });
    }

    // Check if transaction exists
    const transaction = await MobPurshaseTransaction.findByPk(transaction_id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found with the provided transaction_id'
      });
    }

    // Create PurshaseData record
    const purshaseData = await PurshaseData.create({
      name,
      datetime,
      barcode: barcode || null,
      quantity: parseInt(quantity),
      cost: parseFloat(cost),
      transaction_id
    });

    res.status(201).json({
      success: true,
      message: 'PurshaseData created successfully',
      data: purshaseData // FIXED: return actual data instead of model class
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating PurshaseData', // FIXED: consistent message
      error: error.message
    });
  }
};

// Get all PurshaseData
export const getAllPurshaseData = async (req, res) => {
  try {
    const { page = 1, limit = 10, transaction_id } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (transaction_id) {
      whereClause.transaction_id = transaction_id;
    }

    const purshaseData = await PurshaseData.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MobPurshaseTransaction,
          as: 'transaction',
          include: [
            {
              model: Store,
              as: 'store'
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['datetime', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'PurshaseData retrieved successfully',
      data: {
        purshaseData: purshaseData.rows,
        pagination: {
          total: purshaseData.count, // FIXED: use purshaseData instead of priceData
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(purshaseData.count / limit) // FIXED: use purshaseData
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving PurshaseData',
      error: error.message
    });
  }
};

// Get PurshaseData by ID
export const getPurshaseDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: user not found'
      });
    }

    const purshaseData = await PurshaseData.findByPk(id, {
      include: [
        {
          model: MobPurshaseTransaction,
          as: 'transaction',
          include: [
            {
              model: Store,
              as: 'store'
            }
          ]
        }
      ]
    });

    if (!purshaseData) { // FIXED: use purshaseData instead of PurshaseData
      return res.status(404).json({
        success: false,
        message: 'PurshaseData not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'PurshaseData retrieved successfully',
      data: purshaseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving PurshaseData',
      error: error.message
    });
  }
};

// Update PurshaseData
export const updatePurshaseData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, datetime, barcode, quantity, cost, transaction_id, token } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: user not found'
      });
    }

    // Check if PurshaseData exists
    const existingPurshaseData = await PurshaseData.findByPk(id);
    if (!existingPurshaseData) {
      return res.status(404).json({
        success: false,
        message: 'PurshaseData not found'
      });
    }

    // Validate data types if provided
    if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    if (cost !== undefined && (isNaN(cost) || cost < 0)) {
      return res.status(400).json({
        success: false,
        message: 'cost must be a non-negative number'
      });
    }

    // Check if transaction exists (if transaction_id is being updated)
    if (transaction_id && transaction_id !== existingPurshaseData.transaction_id) {
      const transaction = await MobPurshaseTransaction.findByPk(transaction_id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found with the provided transaction_id'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (datetime !== undefined) updateData.datetime = datetime;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (transaction_id !== undefined) updateData.transaction_id = transaction_id;

    // Update PurshaseData
    await existingPurshaseData.update(updateData);

    // Fetch updated data with associations
    const updatedPurshaseData = await PurshaseData.findByPk(id, {
      include: [
        {
          model: MobPurshaseTransaction,
          as: 'transaction',
          include: [
            {
              model: Store,
              as: 'store'
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'PurshaseData updated successfully',
      data: updatedPurshaseData // FIXED: use updatedPurshaseData instead of updatedPriceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating PurshaseData',
      error: error.message
    });
  }
};

// Delete PurshaseData
export const deletePurshaseData = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: user not found'
      });
    }

    // Check if PurshaseData exists
    const purshaseData = await PurshaseData.findByPk(id);
    if (!purshaseData) {
      return res.status(404).json({
        success: false,
        message: 'PurshaseData not found' // FIXED: consistent message
      });
    }

    // Delete PurshaseData
    await purshaseData.destroy();

    res.status(200).json({
      success: true,
      message: 'PurshaseData deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting PurshaseData',
      error: error.message
    });
  }
};