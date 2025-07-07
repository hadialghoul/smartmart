import MobPriceTransaction from '../models/MobPriceTransaction.js';
import Store from '../models/Store.js';
import PriceData from '../models/PriceData.js';
import User from '../models/User.js';
import Product from '../models/Products.js';

// Helper function to create transaction for mobile
const createMobileTransaction = async (userId, date, itemNumber, branchId) => {
  try {
    const transaction = await MobPriceTransaction.create({
      user_id: userId,
      date: date,
      item_number: itemNumber,
      branch_id: branchId,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date()
    });
    return transaction;
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
};

// Create PriceData
export const createPriceData = async (req, res) => {
  try {
    const { 
      product, 
      price, 
      quantity, 
      name, 
      barcode, 
      item_number,
      datetime,
      date,
      branch_id, 
      token, 
      transaction_id,
      product_id,
      expiary
    } = req.body;
    
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;

    // For mobile, allow multiple products from JSON and validate accordingly
    if (is_mobile && product) {
      let products = [];
      try {
        const parsed = typeof product === 'string' ? JSON.parse(product) : product;
        products = Array.isArray(parsed.product) ? parsed.product : [];
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product JSON format',
          error: e.message
        });
      }
      if (products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product array is empty'
        });
      }
      // Validate token and branch_id for mobile
      if (!token || !branch_id) {
        return res.status(400).json({
          success: false,
          message: 'Required fields are missing: token, branch_id'
        });
      }
      // Validate user and store
      const user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid token: user not found' });
      }
      const store = await Store.findByPk(branch_id);
      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found with the provided branch_id' });
      }
      // Create a single transaction for all products
      const mobileTransaction = await createMobileTransaction(
        user.id,
        date || new Date().toISOString().split('T')[0],
        products[0].item_number,
        branch_id
      );
      const transactionId = mobileTransaction.id;
      const createdProducts = [];
      for (const p of products) {
        if (!p.product_id || !p.item_number || !p.quantity || !p.price) {
          return res.status(400).json({
            success: false,
            message: 'Each product must have product_id, item_number, quantity, and price'
          });
        }
        if (isNaN(p.quantity) || p.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: `Quantity for product ${p.product_id} must be a positive number`
          });
        }
        if (isNaN(p.price) || p.price < 0) {
          return res.status(400).json({
            success: false,
            message: `Price for product ${p.product_id} must be a non-negative number`
          });
        }
        // Check if product exists before creating PriceData
        const productExists = await Product.findByPk(p.product_id);
        if (!productExists) {
          return res.status(404).json({
            success: false,
            message: `Product not found with the provided product_id: ${p.product_id}`
          });
        }
        const priceData = await PriceData.create({
          item_number: p.item_number,
          product_id: p.product_id,
          price: parseFloat(p.price),
          quantity: parseInt(p.quantity),
          expiary: p.expiary || null,
          branch_id: branch_id,
          transaction_id: transactionId,
          barcode: p.barcode || null
        });
        createdProducts.push(priceData);
      }
      return res.status(201).json({
        success: true,
        message: 'PriceData created successfully',
        transaction_id: transactionId,
        data: createdProducts
      });
    }

    // Validate required fields for web version
    if (!is_mobile && !product && (!name || !datetime || !quantity || !price || !transaction_id)) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: name, datetime, quantity, price, transaction_id'
      });
    }

    // Validate required fields for mobile version
    if (is_mobile && (!token || !quantity || !price || !item_number || !branch_id || !product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: token, quantity, price, item_number, branch_id, product_id'
      });
    }

    let user = null;
    let finalTransactionId = transaction_id;

    // Handle mobile authentication and transaction creation
    if (is_mobile) {
      user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: user not found'
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

      // Check if product exists
      const productExists = await Product.findByPk(product_id);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found with the provided product_id'
        });
      }

      // Create transaction for mobile
      const mobileTransaction = await createMobileTransaction(
        user.id,
        date || new Date().toISOString().split('T')[0],
        item_number,
        branch_id
      );
      finalTransactionId = mobileTransaction.id;
    }

    // Validate data types (only if not using product array)
    if (!product && (isNaN(quantity) || quantity <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    if (!product && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    // For web version, check if transaction exists
    if (!is_mobile) {
      const transaction = await MobPriceTransaction.findByPk(transaction_id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found with the provided transaction_id'
        });
      }
    }

    // Create single PriceData record
    const priceDataObj = {
      item_number: item_number || 1,
      product_id: product_id || 1,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      expiary: expiary || null,
      transaction_id: finalTransactionId,
      barcode: barcode || null
    };

    const priceData = await PriceData.create(priceDataObj);

    res.status(201).json({
      success: true,
      message: 'PriceData created successfully',
      data: priceData,
      ...(is_mobile && { transaction_id: finalTransactionId })
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
    const { page = 1, limit = 10, transaction_id, token } = req.query;
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;
    const offset = (page - 1) * limit;

    // Mobile authentication
    if (is_mobile && token) {
      const user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: user not found'
        });
      }
    }

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
        },
        {
          model: Product,
          as: 'product'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

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
    // Accept token from either body (POST) or query (GET)
    const token = req.body?.token || req.query?.token;
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Mobile authentication
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
        },
        {
          model: Product,
          as: 'product'
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

// Get all PriceData by transaction_id
export const getPriceDataByTransactionId = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    if (!transaction_id || isNaN(transaction_id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid transaction_id is required'
      });
    }
    const priceData = await PriceData.findAll({
      where: { transaction_id },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ],
      order: [['id', 'ASC']]
    });
    if (!priceData || priceData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No PriceData found for this transaction_id'
      });
    }
    res.status(200).json({
      success: true,
      message: 'PriceData for transaction retrieved successfully',
      data: priceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving PriceData by transaction_id',
      error: error.message
    });
  }
};

// Update PriceData
export const updatePriceData = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_number, product_id, price, quantity, expiary, transaction_id, token, barcode } = req.body;
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Mobile authentication
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

    // Check if product exists (if product_id is being updated)
    if (product_id && product_id !== existingPriceData.product_id) {
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found with the provided product_id'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (item_number !== undefined) updateData.item_number = item_number;
    if (product_id !== undefined) updateData.product_id = product_id;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (expiary !== undefined) updateData.expiary = expiary;
    if (transaction_id !== undefined) updateData.transaction_id = transaction_id;
    if (barcode !== undefined) updateData.barcode = barcode;

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
        },
        {
          model: Product,
          as: 'product'
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
    const { token } = req.body;
    const is_mobile = req.get("User-Agent")?.includes("Mozilla") ? false : true;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid ID is required'
      });
    }

    // Mobile authentication
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