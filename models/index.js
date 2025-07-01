import sequelize from '../config/database.js';
import MobPriceTransaction from './MobPriceTransaction.js';
import Store from './Store.js';
import PriceData from './PriceData.js';
import PurshaseData from './PurshaseData.js';
import MobPurshaseTransaction from './MobPurshaseTransaction.js';

const models = {
  MobPriceTransaction,
  Store,
  PriceData,
  PurshaseData,
  MobPurshaseTransaction
};

// Define associations between Store and MobPriceTransaction
MobPriceTransaction.belongsTo(Store, {
  foreignKey: 'branch_id',
  as: 'store'
});

Store.hasMany(MobPriceTransaction, {
  foreignKey: 'branch_id',
  as: 'priceTransactions'
});

// Define associations between MobPriceTransaction and PriceData
PriceData.belongsTo(MobPriceTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

MobPriceTransaction.hasMany(PriceData, {
  foreignKey: 'transaction_id',
  as: 'priceData'
});

MobPurshaseTransaction.belongsTo(Store, {
  foreignKey: 'branch_id',
  as: 'store'
});

Store.hasMany(MobPurshaseTransaction, {
  foreignKey: 'branch_id',
  as: 'purshaseTransactions'
});

PurshaseData.belongsTo(MobPurshaseTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

MobPurshaseTransaction.hasMany(PurshaseData, {
  foreignKey: 'transaction_id',
  as: 'purshaseData'
});

const db = {
  sequelize,
  ...models,
};

export default db;