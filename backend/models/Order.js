/**
 * 订单数据模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '订单ID'
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单编号'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '客户名称'
    },
    data_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '数据ID'
    },
    country: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '国家代码'
    },
    country_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '国家名称'
    },
    validity: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '时效性分类'
    },
    validity_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '时效性名称'
    },
    operators: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '选择的运营商(JSON格式存储)',
      get() {
        const value = this.getDataValue('operators')
        if (!value) return null
        try {
          return JSON.parse(value)
        } catch (error) {
          console.error('JSON解析错误:', error)
          return null
        }
      },
      set(value) {
        this.setDataValue('operators', JSON.stringify(value))
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '购买数量'
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false,
      defaultValue: 0.00000,
      comment: '单价'
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: '总金额'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      comment: '状态：pending-待处理，processing-处理中，completed-已完成，cancelled-已取消'
    },
    delivery_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      comment: '发货状态：pending-待发货，delivered-已发货'
    },
    delivery_method: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '发货方式：email-邮箱，tgbot-TGBot'
    },
    delivery_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '发货地址（邮箱地址或TG ChatID）'
    },
    order_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '下单时间戳'
    },
    delivery_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '发货时间戳'
    },
    complete_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '完成时间戳'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
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
    }
  }, {
    tableName: 'orders',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return Order;
};