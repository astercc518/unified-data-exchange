/**
 * 数据迁移路由
 * 提供从localStorage到数据库的数据迁移功能
 */

const express = require('express');
const router = express.Router();
const { sequelize, models } = require('../config/database');
const logger = require('../utils/logger');
const { validateMigrationData } = require('../utils/validation');

const { User, Agent, DataLibrary, Order, RechargeRecord } = models;

/**
 * 测试数据库连接
 * GET /api/migrate/test-connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // 获取表信息
    const tables = await sequelize.getQueryInterface().showAllTables();
    
    // 获取每个表的记录数
    const statistics = {};
    for (const table of tables) {
      try {
        const count = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${table}`,
          { type: sequelize.QueryTypes.SELECT }
        );
        statistics[table] = count[0].count;
      } catch (error) {
        statistics[table] = 0;
      }
    }
    
    res.json({
      success: true,
      message: '数据库连接成功',
      database: sequelize.config.database,
      dialect: sequelize.config.dialect,
      tables: tables,
      statistics: statistics
    });
  } catch (error) {
    logger.error('数据库连接测试失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

/**
 * 从localStorage迁移数据到数据库
 * POST /api/migrate/from-localstorage
 */
router.post('/from-localstorage', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userList = [], agentList = [], dataLibrary = [], orderList = [], rechargeRecords = [] } = req.body;
    
    logger.info('开始数据迁移:', {
      users: userList.length,
      agents: agentList.length,
      dataLibrary: dataLibrary.length,
      orders: orderList.length,
      rechargeRecords: rechargeRecords.length
    });
    
    // 验证数据格式
    const validation = validateMigrationData({
      userList,
      agentList,
      dataLibrary,
      orderList,
      rechargeRecords
    });
    
    if (!validation.valid) {
      throw new Error(`数据格式验证失败: ${validation.errors.join(', ')}`);
    }
    
    // 迁移统计
    const migrationStats = {
      agents: { total: agentList.length, success: 0, failed: 0, skipped: 0 },
      users: { total: userList.length, success: 0, failed: 0, skipped: 0 },
      dataLibrary: { total: dataLibrary.length, success: 0, failed: 0, skipped: 0 },
      orders: { total: orderList.length, success: 0, failed: 0, skipped: 0 },
      rechargeRecords: { total: rechargeRecords.length, success: 0, failed: 0, skipped: 0 }
    };
    
    // 1. 迁移代理数据（必须先迁移，因为用户依赖代理）
    for (const agentData of agentList) {
      try {
        const [agent, created] = await Agent.findOrCreate({
          where: { login_account: agentData.loginAccount || agentData.login_account },
          defaults: {
            login_password: agentData.loginPassword || agentData.login_password,
            agent_name: agentData.agentName || agentData.agent_name,
            contact_person: agentData.contactPerson || agentData.contact_person,
            contact_phone: agentData.contactPhone || agentData.contact_phone,
            contact_email: agentData.contactEmail || agentData.contact_email,
            commission_rate: agentData.commissionRate || agentData.commission_rate || 0,
            status: agentData.status !== undefined ? agentData.status : 1,
            remark: agentData.remark || '',
            create_time: agentData.createTime || Date.now()
          },
          transaction
        });
        
        if (created) {
          migrationStats.agents.success++;
          logger.info(`代理创建成功: ${agent.login_account}`);
        } else {
          migrationStats.agents.skipped++;
          logger.info(`代理已存在: ${agent.login_account}`);
        }
      } catch (error) {
        migrationStats.agents.failed++;
        logger.error(`代理迁移失败:`, error.message);
      }
    }
    
    // 2. 迁移用户数据
    for (const userData of userList) {
      try {
        const agentAccount = userData.agentId || userData.agent_id;
        let agentId = null;
        
        if (agentAccount) {
          const agent = await Agent.findOne({
            where: { login_account: agentAccount },
            transaction
          });
          agentId = agent ? agent.id : null;
        }
        
        const [user, created] = await User.findOrCreate({
          where: { login_account: userData.loginAccount || userData.login_account },
          defaults: {
            login_password: userData.loginPassword || userData.login_password,
            customer_name: userData.customerName || userData.customer_name,
            contact_person: userData.contactPerson || userData.contact_person,
            contact_phone: userData.contactPhone || userData.contact_phone,
            contact_email: userData.contactEmail || userData.contact_email,
            account_balance: userData.accountBalance || userData.account_balance || 0,
            agent_id: agentId,
            status: userData.status !== undefined ? userData.status : 1,
            remark: userData.remark || '',
            create_time: userData.createTime || Date.now()
          },
          transaction
        });
        
        if (created) {
          migrationStats.users.success++;
          logger.info(`用户创建成功: ${user.login_account}`);
        } else {
          migrationStats.users.skipped++;
          logger.info(`用户已存在: ${user.login_account}`);
        }
      } catch (error) {
        migrationStats.users.failed++;
        logger.error(`用户迁移失败:`, error.message);
      }
    }
    
    // 3. 迁移数据列表
    for (const dataItem of dataLibrary) {
      try {
        // 处理时效性字段
        let validity = 'within_30_days'; // 默认值
        if (dataItem.validity) {
          validity = dataItem.validity;
        } else if (dataItem.dataType) {
          // 兼容旧格式
          const typeMap = {
            '3天内': 'within_3_days',
            '30天内': 'within_30_days',
            '30天以上': 'over_30_days'
          };
          validity = typeMap[dataItem.dataType] || 'within_30_days';
        }
        
        const [data, created] = await DataLibrary.findOrCreate({
          where: {
            country: dataItem.country,
            validity: validity,
            upload_by: dataItem.uploadBy || dataItem.upload_by
          },
          defaults: {
            data_name: dataItem.dataName || dataItem.data_name || `${dataItem.country}-数据`,
            operators: dataItem.operators || {},
            available_quantity: dataItem.availableQuantity || dataItem.available_quantity || 0,
            price_per_unit: dataItem.pricePerUnit || dataItem.price_per_unit || 0,
            remark: dataItem.remark || '',
            upload_by: dataItem.uploadBy || dataItem.upload_by,
            create_time: dataItem.createTime || Date.now()
          },
          transaction
        });
        
        if (created) {
          migrationStats.dataLibrary.success++;
          logger.info(`数据创建成功: ${data.country}-${validity}`);
        } else {
          migrationStats.dataLibrary.skipped++;
          logger.info(`数据已存在: ${data.country}-${validity}`);
        }
      } catch (error) {
        migrationStats.dataLibrary.failed++;
        logger.error(`数据迁移失败:`, error.message);
      }
    }
    
    // 4. 迁移订单数据
    for (const orderData of orderList) {
      try {
        // 查找客户ID
        const customer = await User.findOne({
          where: { login_account: orderData.customerAccount || orderData.customer_account },
          transaction
        });
        
        if (!customer) {
          throw new Error(`客户不存在: ${orderData.customerAccount}`);
        }
        
        const [order, created] = await Order.findOrCreate({
          where: { order_number: orderData.orderNumber || orderData.order_number },
          defaults: {
            customer_id: customer.id,
            data_id: orderData.dataId || orderData.data_id,
            country: orderData.country,
            data_type: orderData.dataType || orderData.data_type,
            operators: orderData.operators || {},
            quantity: orderData.quantity || 0,
            unit_price: orderData.unitPrice || orderData.unit_price || 0,
            total_price: orderData.totalPrice || orderData.total_price || 0,
            status: orderData.status || 'pending',
            delivery_status: orderData.deliveryStatus || orderData.delivery_status || 'not_delivered',
            remark: orderData.remark || '',
            create_time: orderData.createTime || Date.now()
          },
          transaction
        });
        
        if (created) {
          migrationStats.orders.success++;
          logger.info(`订单创建成功: ${order.order_number}`);
        } else {
          migrationStats.orders.skipped++;
          logger.info(`订单已存在: ${order.order_number}`);
        }
      } catch (error) {
        migrationStats.orders.failed++;
        logger.error(`订单迁移失败:`, error.message);
      }
    }
    
    // 5. 迁移充值记录
    for (const rechargeData of rechargeRecords) {
      try {
        // 查找客户ID
        const customer = await User.findOne({
          where: { login_account: rechargeData.customerAccount || rechargeData.customer_account },
          transaction
        });
        
        if (!customer) {
          throw new Error(`客户不存在: ${rechargeData.customerAccount}`);
        }
        
        const [recharge, created] = await RechargeRecord.findOrCreate({
          where: {
            customer_id: customer.id,
            create_time: rechargeData.createTime || Date.now()
          },
          defaults: {
            recharge_amount: rechargeData.rechargeAmount || rechargeData.recharge_amount || 0,
            payment_method: rechargeData.paymentMethod || rechargeData.payment_method || 'other',
            transaction_number: rechargeData.transactionNumber || rechargeData.transaction_number || '',
            status: rechargeData.status || 'completed',
            remark: rechargeData.remark || '',
            operator: rechargeData.operator || 'system',
            create_time: rechargeData.createTime || Date.now()
          },
          transaction
        });
        
        if (created) {
          migrationStats.rechargeRecords.success++;
          logger.info(`充值记录创建成功: ${customer.login_account}`);
        } else {
          migrationStats.rechargeRecords.skipped++;
          logger.info(`充值记录已存在: ${customer.login_account}`);
        }
      } catch (error) {
        migrationStats.rechargeRecords.failed++;
        logger.error(`充值记录迁移失败:`, error.message);
      }
    }
    
    // 提交事务
    await transaction.commit();
    
    logger.info('数据迁移完成:', migrationStats);
    
    // 计算总计
    const totalSuccess = Object.values(migrationStats).reduce((sum, stat) => sum + stat.success, 0);
    const totalFailed = Object.values(migrationStats).reduce((sum, stat) => sum + stat.failed, 0);
    const totalSkipped = Object.values(migrationStats).reduce((sum, stat) => sum + stat.skipped, 0);
    
    res.json({
      success: true,
      message: '数据迁移完成',
      statistics: migrationStats,
      summary: {
        total: totalSuccess + totalFailed + totalSkipped,
        success: totalSuccess,
        failed: totalFailed,
        skipped: totalSkipped
      }
    });
    
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    
    logger.error('数据迁移失败:', error);
    
    res.status(500).json({
      success: false,
      message: '数据迁移失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * 清空数据库（危险操作，仅开发环境）
 * POST /api/migrate/clear-database
 */
router.post('/clear-database', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: '生产环境禁止清空数据库'
    });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    // 清空所有表
    await RechargeRecord.destroy({ where: {}, transaction });
    await Order.destroy({ where: {}, transaction });
    await DataLibrary.destroy({ where: {}, transaction });
    await User.destroy({ where: {}, transaction });
    await Agent.destroy({ where: {}, transaction });
    
    await transaction.commit();
    
    logger.info('数据库已清空');
    
    res.json({
      success: true,
      message: '数据库已清空'
    });
  } catch (error) {
    await transaction.rollback();
    
    logger.error('清空数据库失败:', error);
    
    res.status(500).json({
      success: false,
      message: '清空数据库失败',
      error: error.message
    });
  }
});

module.exports = router;
