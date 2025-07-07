import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MobPriceList from './MobPriceList.js';
import Product from './Products.js';
import MobPriceTransaction from './MobPriceTransaction.js';


const PriceData = sequelize.define('PriceData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  item_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  price:{
    type: DataTypes.FLOAT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue:1,
    references: {
      model: 'mob_price_transaction',
      key: 'id'
    }
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'mob_price_data',
  timestamps: false,
  freezeTableName: true
});

// Define associations for PriceData
PriceData.belongsTo(MobPriceTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

PriceData.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

export default PriceData;