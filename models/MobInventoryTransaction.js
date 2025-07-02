import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Store from './Store.js';

const MobInventoryTransaction = sequelize.define('MobInventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ref: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  items: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
   variance: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING, // Changed from BOOLEAN to STRING for status
    allowNull: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Store,
      key: 'id'
    }
  },
  user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  synced_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'mob_inventory_transaction',
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true // Use exact table name, don't pluralize
});
// Define associations
MobInventoryTransaction.belongsTo(Store, {
  foreignKey: 'branch_id',
  as: 'store'
});

Store.hasMany(MobInventoryTransaction, {
  foreignKey: 'branch_id',
  as: 'inventoryTransactions'
});

export default MobInventoryTransaction;
