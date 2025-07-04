import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Inventory Item', 'Raw Material', 'Bundle', 'Service', 'Digital Product', 'Asset'),
    allowNull: false
  },
  r_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  r_brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  r_family_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  r_unit_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vat: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  last_cost: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  avg_cost: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  sales_discount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  percent_discount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  main_image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  qty_left: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  qty_sold: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  qty_alert: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  availability: {
    type: DataTypes.ENUM('shown', 'hidden', 'deleted'),
    allowNull: false,
    defaultValue: 'shown'
  },
  opening_qty: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  r_store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_parent: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  qty_in_box: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 1
  },
  purchase_account: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sales_account: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  timestamps: false, // Since we're using custom created_at/updated_at fields
  indexes: [
    {
      fields: ['code']
    }
  ]
});

export default Product;