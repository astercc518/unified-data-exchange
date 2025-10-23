/**
 * 短信任务模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsTask = sequelize.define('SmsTask', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    task_name: {
      type: DataTypes.STRING(100),
      comment: '任务名称'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '短信通道ID'
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '国家'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '短信内容'
    },
    char_count: {
      type: DataTypes.INTEGER,
      comment: '字符数'
    },
    total_numbers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '总号码数'
    },
    send_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'immediate',
      comment: '发送方式：immediate-立即发送 scheduled-定时发送'
    },
    scheduled_time: {
      type: DataTypes.DATE,
      comment: '定时发送时间'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态：pending-待发送 sending-发送中 completed-已完成 failed-失败 cancelled-已取消'
    },
    sent_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已发送数量'
    },
    success_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '成功数量'
    },
    failed_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '失败数量'
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '总费用'
    },
    start_time: {
      type: DataTypes.DATE,
      comment: '开始时间'
    },
    end_time: {
      type: DataTypes.DATE,
      comment: '结束时间'
    },
    error_message: {
      type: DataTypes.TEXT,
      comment: '错误信息'
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
    tableName: 'sms_tasks',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SmsTask;
};
