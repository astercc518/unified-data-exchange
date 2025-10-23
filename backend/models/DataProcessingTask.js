/**
 * 数据处理任务模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DataProcessingTask = sequelize.define('DataProcessingTask', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    task_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '任务类型: add_code, remove_code, deduplicate, generate, merge, split'
    },
    task_name: {
      type: DataTypes.STRING(200),
      comment: '任务名称'
    },
    input_file_id: {
      type: DataTypes.INTEGER,
      comment: '输入文件ID'
    },
    input_file_name: {
      type: DataTypes.STRING(255),
      comment: '输入文件名'
    },
    output_file_id: {
      type: DataTypes.INTEGER,
      comment: '输出文件ID'
    },
    output_file_name: {
      type: DataTypes.STRING(255),
      comment: '输出文件名'
    },
    total_records: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '总记录数'
    },
    processed_records: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已处理记录数'
    },
    success_records: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '成功记录数'
    },
    failed_records: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '失败记录数'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态: pending, processing, completed, failed, cancelled'
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: '进度百分比'
    },
    params: {
      type: DataTypes.TEXT,
      comment: '任务参数(JSON)'
    },
    error_message: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    started_at: {
      type: DataTypes.DATE,
      comment: '开始时间'
    },
    completed_at: {
      type: DataTypes.DATE,
      comment: '完成时间'
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
    tableName: 'data_processing_tasks',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DataProcessingTask;
};
