/**
 * 通道月度结算模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsChannelSettlement = sequelize.define('SmsChannelSettlement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlement_month: {
      type: DataTypes.STRING(7),
      allowNull: false,
      comment: '结算月份 YYYY-MM'
    },
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '通道ID'
    },
    country: {
      type: DataTypes.STRING(50),
      comment: '国家（可选，按国家细分）'
    },
    // 发送统计（只统计成功的）
    total_success: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '成功发送数'
    },
    total_submitted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '总提交数'
    },
    success_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: '成功率 %'
    },
    // 成本统计
    total_cost: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总成本'
    },
    avg_cost_price: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      comment: '平均成本单价'
    },
    // 结算状态
    settlement_status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'paid', 'cancelled'),
      defaultValue: 'pending',
      comment: '结算状态'
    },
    settlement_date: {
      type: DataTypes.DATEONLY,
      comment: '结算日期'
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      comment: '支付日期'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'sms_channel_settlements',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['settlement_month']
      },
      {
        fields: ['channel_id']
      },
      {
        fields: ['country']
      },
      {
        fields: ['settlement_status']
      },
      {
        unique: true,
        fields: ['channel_id', 'settlement_month', 'country']
      }
    ]
  });

  return SmsChannelSettlement;
};
