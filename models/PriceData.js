import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MobPriceTransaction from './MobPriceTransaction.js';

const PriceData = sequelize.define('PriceData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
   

  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MobPriceTransaction,
      key: 'id'
    }
  }
}, {
  tableName: 'mob_price_data',
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true // Use exact table name, don't pluralize
});

// Define associations
PriceData.belongsTo(MobPriceTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

MobPriceTransaction.hasMany(PriceData, {
  foreignKey: 'transaction_id',
  as: 'priceData'
});

export default PriceData;