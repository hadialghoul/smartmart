import MobInventoryTransaction from '../models/MobInventoryTransaction.js';
import Store from '../models/Store.js';
import InventoryData from '../models/InventoryData.js';

// Create InventoryData
export const createInventoryData = async (req, res) => {
  try {
    const { name, status, system_qty, barcode, counted_qty, transaction_id, is_mobile } = req.body;
    
    // Validate required fields
    if (!name || !status || system_qty === undefined || counted_qty === undefined || !transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: name, status, system_qty, counted_qty, transaction_id'
      });
    }

    if (is_mobile === true) {
      // Note: You'll need to implement createInventoryTransaction function
      // createInventoryTransaction(username, datetime, item_number, branch_id, is_mobile);
    }

    // Validate data types
    if (isNaN(system_qty) || system_qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'System quantity must be a non-negative number'
      });
    }

    if (isNaN(counted_qty) || counted_qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Counted quantity must be a non-negative number'
      });
    }

    // Validate status (you can customize these values based on your requirements)
    const validStatuses = ['pending', 'counted', 'verified', 'completed'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if transaction exists
    const transaction = await MobInventoryTransaction.findByPk(transaction_id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found with the provided transaction_id'
      });
    }

    // Calculate difference
    const difference = parseInt(counted_qty) - parseInt(system_qty);

    // Create InventoryData record
    const inventoryData = await InventoryData.create({
      name,
      status: status.toLowerCase(),
      system_qty: parseInt(system_qty),
      barcode: barcode || null, // barcode is optional
      counted_qty: parseInt(counted_qty),
      difference,
      transaction_id
    });

    res.status(201).json({
      success: true,
      message: 'InventoryData created successfully',
      data: inventoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating InventoryData',
      error: error.message
    });
  }
};

// Get all InventoryData
export const getAllInventoryData = async (req, res) => {
  try {
    const { page = 1, limit = 10, transaction_id, status, name } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (transaction_id) {
      whereClause.transaction_id = transaction_id;
    }
    if (status) {
      whereClause.status = status.toLowerCase();
    }
    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` }; // Case-insensitive search
    }

    const inventoryData = await InventoryData.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MobInventoryTransaction,
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
      order: [['id', 'DESC']]
    });

    console.log('InventoryData:', inventoryData.rows);

    res.status(200).json({
      success: true,
      message: 'InventoryData retrieved successfully',
      data: {
        inventoryData: inventoryData.rows,
        pagination: {
          total: inventoryData.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(inventoryData.count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving InventoryData',
      error: error.message
    });
  }
};

// Get InventoryData by ID
export const getInventoryDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    const inventoryData = await InventoryData.findByPk(id, {
      include: [
        {
          model: MobInventoryTransaction,
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

    if (!inventoryData) {
      return res.status(404).json({
        success: false,
        message: 'InventoryData not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'InventoryData retrieved successfully',
      data: inventoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving InventoryData',
      error: error.message
    });
  }
};

// Update InventoryData
export const updateInventoryData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, system_qty, barcode, counted_qty, transaction_id } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Check if InventoryData exists
    const existingInventoryData = await InventoryData.findByPk(id);
    if (!existingInventoryData) {
      return res.status(404).json({
        success: false,
        message: 'InventoryData not found'
      });
    }

    // Validate data types if provided
    if (system_qty !== undefined && (isNaN(system_qty) || system_qty < 0)) {
      return res.status(400).json({
        success: false,
        message: 'System quantity must be a non-negative number'
      });
    }

    if (counted_qty !== undefined && (isNaN(counted_qty) || counted_qty < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Counted quantity must be a non-negative number'
      });
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['pending', 'counted', 'verified', 'completed'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    // Check if transaction exists (if transaction_id is being updated)
    if (transaction_id && transaction_id !== existingInventoryData.transaction_id) {
      const transaction = await MobInventoryTransaction.findByPk(transaction_id);
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
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (barcode !== undefined) updateData.barcode = barcode;
    if (system_qty !== undefined) updateData.system_qty = parseInt(system_qty);
    if (counted_qty !== undefined) updateData.counted_qty = parseInt(counted_qty);
    if (transaction_id !== undefined) updateData.transaction_id = transaction_id;

    // Calculate difference if quantities are being updated
    const newSystemQty = system_qty !== undefined ? parseInt(system_qty) : existingInventoryData.system_qty;
    const newCountedQty = counted_qty !== undefined ? parseInt(counted_qty) : existingInventoryData.counted_qty;
    updateData.difference = newCountedQty - newSystemQty;

    // Update InventoryData
    await existingInventoryData.update(updateData);

    // Fetch updated data with associations
    const updatedInventoryData = await InventoryData.findByPk(id, {
      include: [
        {
          model: MobInventoryTransaction,
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
      message: 'InventoryData updated successfully',
      data: updatedInventoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating InventoryData',
      error: error.message
    });
  }
};

// Delete InventoryData
export const deleteInventoryData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Check if InventoryData exists
    const inventoryData = await InventoryData.findByPk(id);
    if (!inventoryData) {
      return res.status(404).json({
        success: false,
        message: 'InventoryData not found'
      });
    }

    // Delete InventoryData
    await inventoryData.destroy();

    res.status(200).json({
      success: true,
      message: 'InventoryData deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting InventoryData',
      error: error.message
    });
  }
};

// Additional helper functions specific to inventory management

// Bulk update inventory counts
export const bulkUpdateInventoryCounts = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, counted_qty}
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and must not be empty'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, counted_qty } = update;
        
        if (!id || counted_qty === undefined) {
          errors.push({ id, error: 'ID and counted_qty are required' });
          continue;
        }

        const inventoryData = await InventoryData.findByPk(id);
        if (!inventoryData) {
          errors.push({ id, error: 'InventoryData not found' });
          continue;
        }

        const difference = parseInt(counted_qty) - inventoryData.system_qty;
        
        await inventoryData.update({
          counted_qty: parseInt(counted_qty),
          difference,
          status: 'counted'
        });

        results.push({ id, success: true });
      } catch (error) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk update completed',
      data: {
        successful: results,
        errors: errors,
        totalProcessed: updates.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update',
      error: error.message
    });
  }
};

// Get inventory summary by transaction
export const getInventorySummaryByTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    if (!transaction_id || isNaN(transaction_id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid transaction_id is required'
      });
    }

    const inventoryData = await InventoryData.findAll({
      where: { transaction_id },
      include: [
        {
          model: MobInventoryTransaction,
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

    if (!inventoryData.length) {
      return res.status(404).json({
        success: false,
        message: 'No inventory data found for this transaction'
      });
    }

    // Calculate summary statistics
    const summary = {
      totalItems: inventoryData.length,
      totalSystemQty: inventoryData.reduce((sum, item) => sum + item.system_qty, 0),
      totalCountedQty: inventoryData.reduce((sum, item) => sum + item.counted_qty, 0),
      totalDifference: inventoryData.reduce((sum, item) => sum + item.difference, 0),
      statusBreakdown: {},
      itemsWithDiscrepancies: inventoryData.filter(item => item.difference !== 0).length,
      transaction: inventoryData[0].transaction
    };

    // Calculate status breakdown
    inventoryData.forEach(item => {
      summary.statusBreakdown[item.status] = (summary.statusBreakdown[item.status] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      message: 'Inventory summary retrieved successfully',
      data: {
        summary,
        items: inventoryData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving inventory summary',
      error: error.message
    });
  }
};