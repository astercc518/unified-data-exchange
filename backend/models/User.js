/**
 * 客户数据模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '客户ID'
    },
    login_account: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '登录账号'
    },
    login_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '登录密码'
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '客户名称'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '邮箱地址'
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '所属代理ID'
    },
    agent_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所属代理名称'
    },
    sale_price_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.00,
      comment: '销售价比例'
    },
    account_balance: {
      type: DataTypes.DECIMAL(15, 5),
      defaultValue: 0.00000,
      comment: '账户余额'
    },
    overdraft_amount: {
      type: DataTypes.DECIMAL(15, 5),
      defaultValue: 0.00000,
      comment: '透支金额'
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
    tableName: 'users',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return User;
};