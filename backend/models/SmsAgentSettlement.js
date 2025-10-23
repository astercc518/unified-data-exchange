/**
 * 代理月度结算模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsAgentSettlement = sequelize.define('SmsAgentSettlement', {
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
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '代理ID'
    },
    // 提交统计（按提交计费）
    total_submitted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '总提交数（含成功和失败）'
    },
    total_success: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '成功数'
    },
    total_failed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '失败数'
    },
    success_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: '成功率 %'
    },
    // 财务统计
    total_revenue: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总销售额（客户支付）'
    },
    total_cost: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总成本（通道费用）'
    },
    total_profit: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '总利润'
    },
    profit_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: '利润率 %'
    },
    // 代理佣金
    agent_commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: '代理佣金比例 %'
    },
    agent_commission: {
      type: DataTypes.DECIMAL(15, 4),
      defaultValue: 0,
      comment: '代理佣金金额'
    },
    // 客户统计
    customer_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '活跃客户数'
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
    tableName: 'sms_agent_settlements',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['settlement_month']
      },
      {
        fields: ['agent_id']
      },
      {
        fields: ['settlement_status']
      },
      {
        unique: true,
        fields: ['agent_id', 'settlement_month']
      }
    ]
  });

  return SmsAgentSettlement;
};
