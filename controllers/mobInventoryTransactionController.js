import MobInventoryTransaction from '../models/MobInventoryTransaction.js';
import Store from '../models/Store.js';

// CREATE - Add new inventory transaction
export const createInventoryTransaction = async (req, res) => {
  try {
    const { ref, date, items, variance, status, branch_id, user, synced_by } = req.body;

    // Validate required fields
    if (!ref || !date || !items || !branch_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: ref, date, items, branch_id'
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

    const inventoryTransaction = await MobInventoryTransaction.create({
      ref,
      date,
      items,
      variance,
      status,
      branch_id,
      user,
      synced_by
    });

    res.status(201).json({
      success: true,
      message: 'Inventory transaction created successfully',
      data: inventoryTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating inventory transaction',
      error: error.message
    });
  }
};

// READ - Get all inventory transactions
export const getAllInventoryTransactions = async (req, res) => {
  try {
    const inventoryTransactions = await MobInventoryTransaction.findAll({
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'type', 'address']
      }],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Inventory transactions retrieved successfully',
      count: inventoryTransactions.length,
      data: inventoryTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory transactions',
      error: error.message
    });
  }
};

// READ - Get inventory transaction by ID
export const getInventoryTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventoryTransaction = await MobInventoryTransaction.findByPk(id, {
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'type', 'address']
      }]
    });

    if (!inventoryTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Inventory transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory transaction retrieved successfully',
      data: inventoryTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory transaction',
      error: error.message
    });
  }
};

// READ - Get inventory transactions by branch_id
export const getInventoryTransactionsByBranch = async (req, res) => {
  try {
    const { branch_id } = req.params;
    
    const inventoryTransactions = await MobInventoryTransaction.findAll({
      where: { branch_id },
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'type', 'address']
      }],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Inventory transactions retrieved successfully',
      count: inventoryTransactions.length,
      data: inventoryTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory transactions by branch',
      error: error.message
    });
  }
};

// READ - Get inventory transactions by user
export const getInventoryTransactionsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const inventoryTransactions = await MobInventoryTransaction.findAll({
      where: { user: user_id },
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'type', 'address']
      }],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Inventory transactions retrieved successfully',
      count: inventoryTransactions.length,
      data: inventoryTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory transactions by user',
      error: error.message
    });
  }
};

// UPDATE - Update inventory transaction by ID
export const updateInventoryTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { ref, date, items, variance, status, branch_id, user, synced_by } = req.body;

    const inventoryTransaction = await MobInventoryTransaction.findByPk(id);
    
    if (!inventoryTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Inventory transaction not found'
      });
    }

    // If branch_id is being updated, check if store exists
    if (branch_id && branch_id !== inventoryTransaction.branch_id) {
      const store = await Store.findByPk(branch_id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found with the provided branch_id'
        });
      }
    }

    await inventoryTransaction.update({
      ref: ref || inventoryTransaction.ref,
      date: date || inventoryTransaction.date,
      items: items !== undefined ? items : inventoryTransaction.items,
      variance: variance !== undefined ? variance : inventoryTransaction.variance,
      status: status !== undefined ? status : inventoryTransaction.status,
      branch_id: branch_id || inventoryTransaction.branch_id,
      user: user !== undefined ? user : inventoryTransaction.user,
      synced_by: synced_by !== undefined ? synced_by : inventoryTransaction.synced_by
    });

    res.status(200).json({
      success: true,
      message: 'Inventory transaction updated successfully',
      data: inventoryTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory transaction',
      error: error.message
    });
  }
};

// UPDATE - Update transaction status
export const updateInventoryTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, synced_by } = req.body;

    const inventoryTransaction = await MobInventoryTransaction.findByPk(id);
    
    if (!inventoryTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Inventory transaction not found'
      });
    }

    await inventoryTransaction.update({
      status: status !== undefined ? status : inventoryTransaction.status,
      synced_by: synced_by !== undefined ? synced_by : inventoryTransaction.synced_by
    });

    res.status(200).json({
      success: true,
      message: 'Inventory transaction status updated successfully',
      data: inventoryTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory transaction status',
      error: error.message
    });
  }
};

// DELETE - Delete inventory transaction by ID
export const deleteInventoryTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventoryTransaction = await MobInventoryTransaction.findByPk(id);
    
    if (!inventoryTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Inventory transaction not found'
      });
    }

    await inventoryTransaction.destroy();

    res.status(200).json({
      success: true,
      message: 'Inventory transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory transaction',
      error: error.message
    });
  }
};

// DELETE - Delete multiple inventory transactions by IDs
export const deleteMultipleInventoryTransactions = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transaction IDs'
      });
    }

    const deletedCount = await MobInventoryTransaction.destroy({
      where: {
        id: ids
      }
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} inventory transactions deleted successfully`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory transactions',
      error: error.message
    });
  }
};