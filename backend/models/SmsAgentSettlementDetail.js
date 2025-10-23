/**
 * 代理结算明细模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsAgentSettlementDetail = sequelize.define('SmsAgentSettlementDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '代理结算ID'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    customer_name: {
      type: DataTypes.STRING(100),
      comment: '客户名称'
    },
    // 提交统计
    submitted_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '提交数'
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
    // 财务数据
    revenue: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '销售额'
    },
    cost: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '成本'
    },
    profit: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '利润'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'sms_agent_settlement_details',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
    indexes: [
      {
        fields: ['settlement_id']
      },
      {
        fields: ['customer_id']
      }
    ]
  });

  return SmsAgentSettlementDetail;
};
