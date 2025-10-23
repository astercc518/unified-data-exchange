/**
 * 客户数据文件模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerDataFile = sequelize.define('CustomerDataFile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '文件ID'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    customer_account: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户账号'
    },
    customer_name: {
      type: DataTypes.STRING(100),
      comment: '客户名称/上传用户'
    },
    original_filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '原始文件名'
    },
    stored_filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '存储文件名（UUID）'
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '文件存储路径'
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '文件大小（字节）'
    },
    line_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '数据行数'
    },
    file_type: {
      type: DataTypes.STRING(10),
      defaultValue: 'txt',
      comment: '文件类型'
    },
    upload_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '上传时间戳'
    },
    expire_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '过期时间戳（上传后1个月）'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-有效 0-已删除'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '文件描述/备注'
    }
  }, {
    tableName: 'customer_data_files',
    timestamps: false,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['expire_time'] },
      { fields: ['status'] }
    ]
  });

  return CustomerDataFile;
};
