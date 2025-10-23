/**
 * 短信结算模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsSettlement = sequelize.define('SmsSettlement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlement_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '结算日期'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '通道ID'
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '国家'
    },
    total_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '总发送数'
    },
    success_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '成功数'
    },
    failed_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '失败数'
    },
    total_cost: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总成本'
    },
    total_revenue: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总销售额'
    },
    total_profit: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总利润'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '成本价/条'
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '销售价/条'
    },
    settlement_status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending',
      comment: '结算状态'
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
    tableName: 'sms_settlements',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['settlement_date']
      },
      {
        fields: ['customer_id']
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
        fields: ['settlement_date', 'customer_id', 'channel_id', 'country']
      }
    ]
  });

  return SmsSettlement;
};
