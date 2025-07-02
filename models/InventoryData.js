import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MobInventoryTransaction from './MobInventoryTransaction.js';

const InventoryData = sequelize.define('InventoryData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  system_qty: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  counted_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  difference: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   

  },
  
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MobInventoryTransaction,
      key: 'id'
    }
  }
}, {
  tableName: 'mob_inventory_data',
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true // Use exact table name, don't pluralize
});

// Define associations
InventoryData.belongsTo(MobInventoryTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

MobInventoryTransaction.hasMany(InventoryData, {
  foreignKey: 'transaction_id',
  as: 'inventoryData'
});

export default InventoryData;