/**
 * 结算明细模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsSettlementDetail = sequelize.define('SmsSettlementDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '结算ID'
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '发送记录ID'
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '手机号'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '成本'
    },
    revenue: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '销售额'
    },
    profit: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '利润'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '状态'
    },
    sent_at: {
      type: DataTypes.DATE,
      comment: '发送时间'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'sms_settlement_details',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['settlement_id']
      },
      {
        fields: ['record_id']
      }
    ]
  });

  return SmsSettlementDetail;
};
