/**
 * 短信统计模型（用于缓存统计数据）
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsStats = sequelize.define('SmsStats', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stat_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '统计日期'
    },
    user_id: {
      type: DataTypes.INTEGER,
      comment: '用户ID（null表示全局统计）'
    },
    channel_id: {
      type: DataTypes.INTEGER,
      comment: '通道ID（null表示所有通道）'
    },
    country: {
      type: DataTypes.STRING(50),
      comment: '国家（null表示所有国家）'
    },
    total_sent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '总发送数'
    },
    success_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '成功数'
    },
    failed_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '失败数'
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '总费用'
    },
    success_rate: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '成功率（%）'
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
    tableName: 'sms_stats',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['stat_date', 'user_id', 'channel_id', 'country']
      }
    ]
  });

  return SmsStats;
};
