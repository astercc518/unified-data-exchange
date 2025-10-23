/**
 * 充值记录模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RechargeRecord = sequelize.define('RechargeRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '充值记录ID'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '客户名称'
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'customer',
      comment: '类型：customer-客户，agent-代理'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 5),
      allowNull: false,
      defaultValue: 0.00000,
      comment: '充值金额'
    },
    method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'system',
      comment: '充值方式：system-系统充值，initial-初始金额，manual-手动充值'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'success',
      comment: '状态：pending-待处理，success-成功，failed-失败'
    },
    create_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '充值时间戳'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'recharge_records',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return RechargeRecord;
};