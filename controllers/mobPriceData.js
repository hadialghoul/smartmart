import MobPriceTransaction from '../models/MobPriceTransaction.js';
import Store from '../models/Store.js';
import PriceData from '../models/PriceData.js';

// Create PriceData
export const createPriceData = async (req, res) => {
  try {
    const { name, datetime, barcode, quantity, price, transaction_id } = req.body;
    
    // Validate required fields
    if (!name || !datetime || !quantity || !price || !transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: name, datetime, quantity, price, transaction_id'
      });
    }

    // Validate data types
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    // Check if transaction exists
    const transaction = await MobPriceTransaction.findByPk(transaction_id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found with the provided transaction_id'
      });
    }

    // Create PriceData record
    const priceData = await PriceData.create({
      name,
      datetime,
      barcode: barcode || null, // barcode is optional
      quantity: parseInt(quantity),
      price: parseFloat(price),
      transaction_id
    });

    res.status(201).json({
      success: true,
      message: 'PriceData created successfully',
      data: priceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating PriceData',
      error: error.message
    });
  }
};

// Get all PriceData
export const getAllPriceData = async (req, res) => {
  try {
    const { page = 1, limit = 10, transaction_id } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (transaction_id) {
      whereClause.transaction_id = transaction_id;
    }

    const priceData = await PriceData.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MobPriceTransaction,
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
console.log('PriceData:', priceData.rows);
    res.status(200).json({
      success: true,
      message: 'PriceData retrieved successfully',
      data: {
        priceData: priceData.rows,
        pagination: {
          total: priceData.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(priceData.count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving PriceData',
      error: error.message
    });
  }
};

// Get PriceData by ID
export const getPriceDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    const priceData = await PriceData.findByPk(id, {
      include: [
        {
          model: MobPriceTransaction,
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

    if (!priceData) {
      return res.status(404).json({
        success: false,
        message: 'PriceData not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'PriceData retrieved successfully',
      data: priceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving PriceData',
      error: error.message
    });
  }
};

// Update PriceData
export const updatePriceData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, datetime, barcode, quantity, price, transaction_id } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Check if PriceData exists
    const existingPriceData = await PriceData.findByPk(id);
    if (!existingPriceData) {
      return res.status(404).json({
        success: false,
        message: 'PriceData not found'
      });
    }

    // Validate data types if provided
    if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    // Check if transaction exists (if transaction_id is being updated)
    if (transaction_id && transaction_id !== existingPriceData.transaction_id) {
      const transaction = await MobPriceTransaction.findByPk(transaction_id);
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
    if (price !== undefined) updateData.price = parseFloat(price);
    if (transaction_id !== undefined) updateData.transaction_id = transaction_id;

    // Update PriceData
    await existingPriceData.update(updateData);

    // Fetch updated data with associations
    const updatedPriceData = await PriceData.findByPk(id, {
      include: [
        {
          model: MobPriceTransaction,
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
      message: 'PriceData updated successfully',
      data: updatedPriceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating PriceData',
      error: error.message
    });
  }
};

// Delete PriceData
export const deletePriceData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Check if PriceData exists
    const priceData = await PriceData.findByPk(id);
    if (!priceData) {
      return res.status(404).json({
        success: false,
        message: 'PriceData not found'
      });
    }

    // Delete PriceData
    await priceData.destroy();

    res.status(200).json({
      success: true,
      message: 'PriceData deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting PriceData',
      error: error.message
    });
  }
};