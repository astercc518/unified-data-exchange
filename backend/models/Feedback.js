/**
 * 反馈记录模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '反馈ID'
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
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联订单ID'
    },
    feedback_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '反馈类型'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '反馈标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '反馈内容'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      comment: '状态：pending-待处理，processing-处理中，resolved-已解决'
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'normal',
      comment: '优先级：low-低，normal-普通，high-高，urgent-紧急'
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
    resolve_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '解决时间戳'
    },
    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '管理员回复'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'feedbacks',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return Feedback;
};