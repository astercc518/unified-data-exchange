/**
 * 操作日志模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OperationLog = sequelize.define('OperationLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '日志ID'
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '日志类型：login-登录，operation-操作'
    },
    operator: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作人账号'
    },
    operator_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '操作人类型：admin-管理员，agent-代理，customer-客户'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作动作'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '操作描述'
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用户代理'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'success',
      comment: '状态：success-成功，failed-失败'
    },
    create_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '创建时间戳'
    }
  }, {
    tableName: 'operation_logs',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      { fields: ['type'] },
      { fields: ['operator'] },
      { fields: ['create_time'] }
    ]
  });

  return OperationLog;
};
