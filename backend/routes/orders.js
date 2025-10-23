/**
 * 订单管理路由
 * 根据记忆规范：订单管理需按订单状态分离为不同页面
 */
const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { logOrderOperation } = require('../utils/operationLogger');
const {
  authenticateToken,
  requireAdmin,
  requireAgentOrAdmin,
  verifyOrderAccess
} = require('../middleware/auth');
const DeliveryService = require('../services/deliveryService');

const { Order, User, DataLibrary, DeliveryConfig, OrderData } = models;

// 获取订单列表（根据记忆规范：按状态分类）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId, keyword } = req.query;
    
    const where = {};
    
    // 权限过滤: 根据用户类型过滤数据
    if (req.user.userType === 'agent') {
      // 代理: 查询该代理下所有客户的订单
      const customers = await User.findAll({
        where: { agent_id: req.user.userId },
        attributes: ['id']
      });
      const customerIds = customers.map(c => c.id);
      where.customer_id = { [Op.in]: customerIds };
      logger.info(`🔒 代理权限过滤: 客户IDs = [${customerIds.join(', ')}]`);
      
    } else if (req.user.userType === 'customer') {
      // 客户: 只能查看自己的订单
      where.customer_id = req.user.userId;
      logger.info(`🔒 客户权限过滤: customer_id = ${req.user.userId}`);
    }
    // admin: 不添加过滤条件,查看所有订单
    
    if (status) {
      // 根据记忆规范：待处理订单（pending、processing状态）
      if (status === 'pending') {
        where.status = { [Op.in]: ['pending', 'processing'] };
      } else if (status === 'completed') {
        // 已完成订单
        where.status = 'completed';
      } else {
        where.status = status;
      }
    }
    if (customerId && req.user.userType === 'admin') {
      // 只有管理员可以按customerId过滤
      where.customer_id = customerId;
    }
    if (keyword) {
      where[Op.or] = [
        { order_number: { [Op.like]: `%${keyword}%` } },
        { country: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['create_time', 'DESC']],
      include: [
        { model: User, as: 'customer', attributes: ['id', 'customer_name', 'login_account'] },
        { model: DataLibrary, as: 'data', attributes: ['id', 'country', 'validity'] }
      ]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
      error: error.message
    });
  }
});

// 创建订单
router.post('/', authenticateToken, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      order_number: `ORD${Date.now()}`,
      create_time: Date.now(),
      status: 'pending',
      delivery_status: 'not_delivered'
    });
    
    logger.info(`订单创建成功: ${order.order_number}`);
    
    // 记录操作日志
    await logOrderOperation('创建订单', req, order.id, order.order_number).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    logger.error('创建订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
});

// 购买数据创建订单（包含所有操作）
router.post('/purchase', authenticateToken, async (req, res) => {
  const transaction = await models.sequelize.transaction();
  
  try {
    const {
      customerId,
      customerName,
      dataId,
      country,
      dataType,
      validity,
      source,
      quantity,
      unitPrice,
      totalAmount,
      deliveryEmail,
      operators,
      remark
    } = req.body;

    // 1. 验证用户是否为客户
    if (req.user.userType !== 'customer') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: '只有客户可以购买数据'
      });
    }

    // 2. 获取客户信息
    const customer = await User.findByPk(customerId, { transaction });
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }

    // 3. 检查余额是否充足
    const currentBalance = parseFloat(customer.account_balance);
    if (currentBalance < totalAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `账户余额不足，当前余额: ${currentBalance} U，需要: ${totalAmount} U`
      });
    }

    // 4. 获取数据信息并检查库存
    const dataLibrary = await DataLibrary.findByPk(dataId, { transaction });
    if (!dataLibrary) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }

    if (dataLibrary.available_quantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `库存不足，当前可用: ${dataLibrary.available_quantity} 条，需要: ${quantity} 条`
      });
    }

    // 5. 生成订单号
    const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // 6. 创建订单
    const order = await Order.create({
      order_number: orderNo,
      customer_id: customerId,
      customer_name: customerName,
      data_id: dataId,
      country: country,
      country_name: country,
      data_type: dataType,
      validity: validity,
      validity_name: validity === '3' ? '3天内' : validity === '30' ? '30天内' : '30天以上',
      source: source,
      quantity: quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      delivery_email: deliveryEmail,
      operators: JSON.stringify(operators),
      status: 'pending',
      delivery_status: 'pending',
      remark: remark || '',
      create_time: Date.now(),
      update_time: Date.now()
    }, { transaction });

    logger.info(`✅ 订单创建成功: ${orderNo}`);

    // 7. 扣除客户余额
    const newBalance = currentBalance - totalAmount;
    await customer.update({
      account_balance: newBalance.toFixed(5),
      update_time: Date.now()
    }, { transaction });

    logger.info(`✅ 余额扣除成功: ${currentBalance} U -> ${newBalance} U`);

    // 8. 创建扣款记录
    const { RechargeRecord } = models;
    await RechargeRecord.create({
      customer_id: customerId,
      customer_name: customerName,
      amount: -totalAmount,
      type: 'deduct',
      method: 'purchase',
      status: 'success',
      remark: `购买数据扣款 - ${country} ${quantity}条`,
      create_time: Date.now()
    }, { transaction });

    logger.info(`✅ 扣款记录创建成功`);

    // 9. 减少数据库存
    const newAvailableQuantity = dataLibrary.available_quantity - quantity;
    await dataLibrary.update({
      available_quantity: newAvailableQuantity,
      update_time: Date.now()
    }, { transaction });

    logger.info(`✅ 库存更新成功: ${dataLibrary.available_quantity} -> ${newAvailableQuantity}`);

    // 10. 提交事务
    await transaction.commit();

    logger.info(`🎉 购买成功: 订单号=${orderNo}, 客户=${customerName}, 金额=${totalAmount} U`);
    
    // 记录操作日志
    await logOrderOperation('购买数据', req, order.id, orderNo).catch(err => 
      logger.error('记录日志失败:', err)
    );

    // 返回成功响应
    res.json({
      success: true,
      data: {
        id: order.id,
        orderNo: orderNo,
        totalAmount: totalAmount,
        newBalance: newBalance,
        quantity: quantity
      },
      message: '购买成功'
    });

  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    
    logger.error('❌ 购买失败:', error);
    res.status(500).json({
      success: false,
      message: '购买失败: ' + error.message,
      error: error.message
    });
  }
});

// 更新订单状态
router.put('/:id', authenticateToken, verifyOrderAccess, async (req, res) => {
  try {
    const order = req.order;  // 从中间件注入的订单对象
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    await order.update(req.body);
    
    logger.info(`订单更新成功: ${order.order_number}`);
    
    // 记录操作日志
    await logOrderOperation('更新订单', req, order.id, order.order_number).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      data: order,
      message: '订单更新成功'
    });
  } catch (error) {
    logger.error('更新订单失败:', error);
    res.status(500).json({
      success: false,
      message: '更新订单失败',
      error: error.message
    });
  }
});

// 发货 - 仅代理和管理员可访问
router.post('/:id/deliver', authenticateToken, requireAgentOrAdmin, verifyOrderAccess, async (req, res) => {
  try {
    const order = req.order;  // 从中间件注入的订单对象
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    await order.update({
      delivery_status: 'delivered',
      delivery_time: Date.now(),
      delivery_data: req.body.deliveryData
    });
    
    logger.info(`订单发货成功: ${order.order_number}`);
    
    // 记录操作日志
    await logOrderOperation('订单发货', req, order.id, order.order_number).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      data: order,
      message: '订单发货成功'
    });
  } catch (error) {
    logger.error('订单发货失败:', error);
    res.status(500).json({
      success: false,
      message: '订单发货失败',
      error: error.message
    });
  }
});

// 审核订单 - 仅代理和管理员可访问
router.post('/:id/review', authenticateToken, requireAgentOrAdmin, verifyOrderAccess, async (req, res) => {
  try {
    const order = req.order;
    const { action, rejectReason } = req.body;  // action: 'approve' | 'reject'
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 验证订单状态
    if (order.status !== 'reviewing') {
      return res.status(400).json({
        success: false,
        message: '订单状态不是审核中,无法审核'
      });
    }
    
    // 执行审核
    if (action === 'approve') {
      await order.update({
        status: 'completed',
        delivery_status: 'pending',
        approve_time: Date.now()
      });
      
      logger.info(`✅ 订单审核通过: ${order.order_number}, 审核人: ${req.user.userType} ${req.user.userName}`);
      
      // 记录操作日志
      await logOrderOperation('审核订单-通过', req, order.id, order.order_number).catch(err => 
        logger.error('记录日志失败:', err)
      );
      
      res.json({
        success: true,
        message: '订单审核通过'
      });
      
    } else if (action === 'reject') {
      if (!rejectReason) {
        return res.status(400).json({
          success: false,
          message: '拒绝审核必须填写原因'
        });
      }
      
      await order.update({
        status: 'cancelled',
        reject_reason: rejectReason,
        reject_time: Date.now()
      });
      
      logger.info(`❌ 订单审核拒绝: ${order.order_number}, 原因: ${rejectReason}`);
      
      // 记录操作日志
      await logOrderOperation('审核订单-拒绝', req, order.id, order.order_number).catch(err => 
        logger.error('记录日志失败:', err)
      );
      
      res.json({
        success: true,
        message: '订单已拒绝'
      });
      
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的审核操作'
      });
    }
    
  } catch (error) {
    logger.error('审核订单失败:', error);
    res.status(500).json({
      success: false,
      message: '审核订单失败',
      error: error.message
    });
  }
});

// 客户发货接口 - 所有客户可访问自己的订单
router.post('/:id/customer-deliver', authenticateToken, verifyOrderAccess, async (req, res) => {
  try {
    const order = req.order;
    const { delivery_method, delivery_address } = req.body;
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 验证订单状态
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '订单未完成，无法发货'
      });
    }
    
    if (order.delivery_status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: '订单已发货，请勿重复发货'
      });
    }
    
    // 验证发货方式
    if (!['email', 'tgbot'].includes(delivery_method)) {
      return res.status(400).json({
        success: false,
        message: '无效的发货方式'
      });
    }
    
    if (!delivery_address) {
      return res.status(400).json({
        success: false,
        message: '请提供发货地址'
      });
    }
    
    // 获取发货配置
    const deliveryConfig = await DeliveryConfig.findOne({
      where: {
        config_type: delivery_method,
        status: 1
      }
    });
    
    if (!deliveryConfig) {
      return res.status(400).json({
        success: false,
        message: `${delivery_method === 'email' ? '邮箱' : 'TGBot'}发货功能未启用，请联系管理员`
      });
    }
    
    // 提取订单数据
    const orderDataResult = await DeliveryService.extractOrderData(order.id, OrderData);
    
    // 准备订单数据
    const orderDataForDelivery = {
      orderNumber: order.order_number,
      country: order.country_name,
      validityName: order.validity_name,
      quantity: order.quantity,
      dataContent: orderDataResult ? orderDataResult.dataContent : null
    };
    
    // 执行发货
    let deliveryResult;
    if (delivery_method === 'email') {
      deliveryResult = await DeliveryService.sendByEmail(
        orderDataForDelivery,
        deliveryConfig.config_data,
        delivery_address
      );
    } else if (delivery_method === 'tgbot') {
      deliveryResult = await DeliveryService.sendByTGBot(
        orderDataForDelivery,
        deliveryConfig.config_data,
        delivery_address
      );
    }
    
    // 更新订单状态
    await order.update({
      delivery_status: 'delivered',
      delivery_method,
      delivery_address,
      delivery_time: Date.now(),
      update_time: Date.now()
    });
    
    logger.info(`✅ 客户发货成功: ${order.order_number}, 方式: ${delivery_method}`);
    
    // 记录操作日志
    await logOrderOperation('客户发货', req, order.id, order.order_number).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      message: '发货成功',
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        deliveryMethod: delivery_method,
        deliveryAddress: delivery_address,
        deliveryTime: Date.now()
      }
    });
    
  } catch (error) {
    logger.error('客户发货失败:', error);
    res.status(500).json({
      success: false,
      message: `发货失败: ${error.message}`,
      error: error.message
    });
  }
});

// TGBot订单验证接口 - 用于TGBot发送订单号时验证
router.post('/verify-tgbot-order', async (req, res) => {
  try {
    const { order_number, chat_id } = req.body;
    
    if (!order_number || !chat_id) {
      return res.status(400).json({
        success: false,
        message: '请提供订单号和Chat ID'
      });
    }
    
    // 查找订单
    const order = await Order.findOne({
      where: { order_number }
    });
    
    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 验证订单状态
    if (order.status !== 'completed') {
      return res.json({
        success: false,
        message: '订单未完成，不能发货'
      });
    }
    
    if (order.delivery_status !== 'pending') {
      return res.json({
        success: false,
        message: '订单已发货，请勿重复发货'
      });
    }
    
    // 获取TGBot配置
    const tgbotConfig = await DeliveryConfig.findOne({
      where: {
        config_type: 'tgbot',
        status: 1
      }
    });
    
    if (!tgbotConfig) {
      return res.json({
        success: false,
        message: 'TGBot发货功能未启用'
      });
    }
    
    // 提取订单数据
    const orderDataResult = await DeliveryService.extractOrderData(order.id, OrderData);
    
    // 准备订单数据
    const orderDataForDelivery = {
      orderNumber: order.order_number,
      country: order.country_name,
      validityName: order.validity_name,
      quantity: order.quantity,
      dataContent: orderDataResult ? orderDataResult.dataContent : null
    };
    
    // 执行TGBot发货
    const deliveryResult = await DeliveryService.sendByTGBot(
      orderDataForDelivery,
      tgbotConfig.config_data,
      chat_id
    );
    
    // 更新订单状态
    await order.update({
      delivery_status: 'delivered',
      delivery_method: 'tgbot',
      delivery_address: chat_id,
      delivery_time: Date.now(),
      update_time: Date.now()
    });
    
    logger.info(`✅ TGBot验证发货成功: ${order.order_number}, ChatID: ${chat_id}`);
    
    res.json({
      success: true,
      message: '发货成功，请查收数据',
      data: {
        orderNumber: order.order_number,
        quantity: order.quantity
      }
    });
    
  } catch (error) {
    logger.error('TGBot验证发货失败:', error);
    res.status(500).json({
      success: false,
      message: `发货失败: ${error.message}`
    });
  }
});

module.exports = router;