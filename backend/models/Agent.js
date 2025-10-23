/**
 * 代理数据模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agent = sequelize.define('Agent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '代理ID'
    },
    agent_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '代理名称'
    },
    login_account: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '代理登录账号'
    },
    login_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '代理登录密码'
    },
    agent_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: '代理编码'
    },
    parent_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '上级代理ID'
    },
    level: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '代理级别'
    },
    commission: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: '佣金比例'
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所在地区'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱地址'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号码'
    },
    bind_users: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '绑定客户数'
    },
    total_commission: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: '总佣金'
    },
    monthly_commission: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: '月佣金'
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '国家代码(如：+86)'
    },
    country_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '国家名称'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-激活，0-停用'
    },
    create_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '创建时间戳'
    },
    update_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '更新时间戳'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'agents',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return Agent;
};