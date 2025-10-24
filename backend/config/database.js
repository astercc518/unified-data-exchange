/**
 * 数据库配置和连接
 */
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// 数据库配置 - 使用MariaDB进行永久存储
const dbConfig = {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'vue_admin_user',
  password: 'vue_admin_2024',
  database: 'vue_admin',
  
  // 日志配置
  logging: process.env.DB_LOGGING === 'true' ? 
    (msg) => logger.debug(msg) : false,
    
  // 其他配置
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true
  },
  
  // 连接池配置
  pool: {
    max: 20,        // 增加最大连接数
    min: 2,         // 保持最小连接数
    acquire: 60000, // 增加获取连接超时时间到60秒
    idle: 30000,    // 增加空闲超时到30秒
    evict: 60000    // 每60秒检查并清理空闲连接
  }
};

// 创建Sequelize实例
const sequelize = new Sequelize(dbConfig);

// 导入模型
const User = require('../models/User')(sequelize);
const Agent = require('../models/Agent')(sequelize);
const DataLibrary = require('../models/DataLibrary')(sequelize);
const Order = require('../models/Order')(sequelize);
const RechargeRecord = require('../models/RechargeRecord')(sequelize);
const Feedback = require('../models/Feedback')(sequelize);
const Favorite = require('../models/Favorite')(sequelize);
const OperationLog = require('../models/OperationLog')(sequelize);
const SystemConfig = require('../models/SystemConfig')(sequelize);
const DeliveryConfig = require('../models/DeliveryConfig')(sequelize);
const OrderData = require('../models/OrderData')(sequelize);
const CustomerDataFile = require('../models/CustomerDataFile')(sequelize);

// 导入短信模型
const SmsChannel = require('../models/SmsChannel')(sequelize);
const SmsTask = require('../models/SmsTask')(sequelize);
const SmsRecord = require('../models/SmsRecord')(sequelize);
const SmsStats = require('../models/SmsStats')(sequelize);
const SmsChannelCountry = require('../models/SmsChannelCountry')(sequelize);
const SmsSettlement = require('../models/SmsSettlement')(sequelize);
const SmsSettlementDetail = require('../models/SmsSettlementDetail')(sequelize);

// 导入新结算模型
const SmsAgentSettlement = require('../models/SmsAgentSettlement')(sequelize);
const SmsAgentSettlementDetail = require('../models/SmsAgentSettlementDetail')(sequelize);
const SmsChannelSettlement = require('../models/SmsChannelSettlement')(sequelize);
const SmsChannelSettlementDetail = require('../models/SmsChannelSettlementDetail')(sequelize);

// 定义模型关联
const setupAssociations = () => {
  // 客户和代理关联
  User.belongsTo(Agent, { foreignKey: 'agent_id', as: 'agent' });
  Agent.hasMany(User, { foreignKey: 'agent_id', as: 'customers' });
  
  // 订单关联
  Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  Order.belongsTo(DataLibrary, { foreignKey: 'data_id', as: 'data' });
  User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
  DataLibrary.hasMany(Order, { foreignKey: 'data_id', as: 'orders' });
  
  // 充值记录关联
  RechargeRecord.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  User.hasMany(RechargeRecord, { foreignKey: 'customer_id', as: 'rechargeRecords' });
  
  // 反馈关联
  Feedback.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  Feedback.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  User.hasMany(Feedback, { foreignKey: 'customer_id', as: 'feedbacks' });
  Order.hasMany(Feedback, { foreignKey: 'order_id', as: 'feedbacks' });
  
  // 数据上传者关联
  DataLibrary.belongsTo(User, { 
    foreignKey: 'upload_by', 
    targetKey: 'login_account', 
    as: 'uploader' 
  });
  
  // 收藏关联
  Favorite.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  Favorite.belongsTo(DataLibrary, { foreignKey: 'data_id', as: 'dataItem' });
  User.hasMany(Favorite, { foreignKey: 'customer_id', as: 'favorites' });
  DataLibrary.hasMany(Favorite, { foreignKey: 'data_id', as: 'favorites' });
  
  // 短信任务关联
  SmsTask.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  SmsTask.belongsTo(SmsChannel, { foreignKey: 'channel_id', as: 'channel' });
  User.hasMany(SmsTask, { foreignKey: 'customer_id', as: 'smsTasks' });
  SmsChannel.hasMany(SmsTask, { foreignKey: 'channel_id', as: 'tasks' });
  
  // 短信记录关联
  SmsRecord.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  SmsRecord.belongsTo(SmsTask, { foreignKey: 'task_id', as: 'task' });
  SmsRecord.belongsTo(SmsChannel, { foreignKey: 'channel_id', as: 'channel' });
  User.hasMany(SmsRecord, { foreignKey: 'customer_id', as: 'smsRecords' });
  SmsTask.hasMany(SmsRecord, { foreignKey: 'task_id', as: 'records' });
  SmsChannel.hasMany(SmsRecord, { foreignKey: 'channel_id', as: 'records' });
  
  // 短信统计关联
  SmsStats.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  User.hasMany(SmsStats, { foreignKey: 'customer_id', as: 'smsStats' });
  
  // 通道国家关联
  SmsChannelCountry.belongsTo(SmsChannel, { foreignKey: 'channel_id', as: 'channel' });
  SmsChannel.hasMany(SmsChannelCountry, { foreignKey: 'channel_id', as: 'countries' });
  
  // 结算关联
  SmsSettlement.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  SmsSettlement.belongsTo(SmsChannel, { foreignKey: 'channel_id', as: 'channel' });
  User.hasMany(SmsSettlement, { foreignKey: 'customer_id', as: 'settlements' });
  SmsChannel.hasMany(SmsSettlement, { foreignKey: 'channel_id', as: 'settlements' });
  
  // 结算明细关联
  SmsSettlementDetail.belongsTo(SmsSettlement, { foreignKey: 'settlement_id', as: 'settlement' });
  SmsSettlementDetail.belongsTo(SmsRecord, { foreignKey: 'record_id', as: 'record' });
  SmsSettlement.hasMany(SmsSettlementDetail, { foreignKey: 'settlement_id', as: 'details' });
  SmsRecord.hasOne(SmsSettlementDetail, { foreignKey: 'record_id', as: 'settlementDetail' });
  
  // 代理结算关联
  SmsAgentSettlement.belongsTo(Agent, { foreignKey: 'agent_id', as: 'agent' });
  Agent.hasMany(SmsAgentSettlement, { foreignKey: 'agent_id', as: 'agentSettlements' });
  
  SmsAgentSettlementDetail.belongsTo(SmsAgentSettlement, { foreignKey: 'settlement_id', as: 'settlement' });
  SmsAgentSettlementDetail.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
  SmsAgentSettlement.hasMany(SmsAgentSettlementDetail, { foreignKey: 'settlement_id', as: 'details' });
  
  // 通道结算关联
  SmsChannelSettlement.belongsTo(SmsChannel, { foreignKey: 'channel_id', as: 'channel' });
  SmsChannel.hasMany(SmsChannelSettlement, { foreignKey: 'channel_id', as: 'channelSettlements' });
  
  SmsChannelSettlementDetail.belongsTo(SmsChannelSettlement, { foreignKey: 'settlement_id', as: 'settlement' });
  SmsChannelSettlementDetail.belongsTo(SmsRecord, { foreignKey: 'record_id', as: 'record' });
  SmsChannelSettlement.hasMany(SmsChannelSettlementDetail, { foreignKey: 'settlement_id', as: 'details' });
};

setupAssociations();

// 数据库连接测试
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接验证成功');
    return true;
  } catch (error) {
    logger.error('数据库连接失败:', error);
    return false;
  }
};

// 数据库同步
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    logger.info('数据库同步完成');
    return true;
  } catch (error) {
    logger.error('数据库同步失败:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  models: {
    User,
    Agent,
    DataLibrary,
    Order,
    RechargeRecord,
    Feedback,
    Favorite,
    OperationLog,
    SystemConfig,
    DeliveryConfig,
    OrderData,
    CustomerDataFile,
    // 短信相关模型
    SmsChannel,
    SmsTask,
    SmsRecord,
    SmsStats,
    SmsChannelCountry,
    SmsSettlement,
    SmsSettlementDetail,
    // 新结算模型
    SmsAgentSettlement,
    SmsAgentSettlementDetail,
    SmsChannelSettlement,
    SmsChannelSettlementDetail
  },
  testConnection,
  syncDatabase
};