/**
 * 充值记录路由
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { logOperation } = require('../utils/operationLogger');

const { RechargeRecord, User } = models;

// 获取充值记录列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, customerId, status, keyword } = req.query;
    
    const where = {};
    if (customerId) {
      where.customer_id = customerId;
    }
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where[Op.or] = [
        { transaction_number: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await RechargeRecord.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['create_time', 'DESC']],
      include: [
        { model: User, as: 'customer', attributes: ['id', 'customer_name', 'login_account'] }
      ]
    });
    
    // 转换字段名：下划线转驼峰
    const formattedData = rows.map(record => {
      const data = record.toJSON();
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        type: data.type,
        amount: data.amount,
        method: data.method,
        status: data.status,
        createTime: data.create_time,
        remark: data.remark
      };
    });
    
    res.json({
      success: true,
      data: formattedData,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取充值记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取充值记录失败',
      error: error.message
    });
  }
});

// 创建充值记录（自动更新用户余额）
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customer_id, customer_name, amount, method, remark } = req.body;
    
    // 如果没有提供客户名称，从数据库查询
    let customerName = customer_name;
    if (!customerName) {
      const user = await User.findByPk(customer_id, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: '客户不存在'
        });
      }
      customerName = user.customer_name;
    }
    
    // 创建充值记录
    const recharge = await RechargeRecord.create({
      customer_id,
      customer_name: customerName,
      type: 'customer',
      amount: parseFloat(amount),
      method: method || 'system',
      status: 'success',
      remark: remark || '',
      create_time: Date.now()
    }, { transaction });
    
    // 更新用户余额（只在金额大于0时更新，负数由扣款单独处理）
    if (parseFloat(amount) !== 0) {
      const user = await User.findByPk(customer_id, { transaction });
      if (user) {
        const newBalance = parseFloat(user.account_balance) + parseFloat(amount);
        await user.update({
          account_balance: newBalance,
          update_time: Date.now()
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    logger.info(`充值成功: 客户${customer_id}, 金额${amount}`);
    
    // 记录操作日志
    await logOperation({
      action: '客户充值',
      description: `客户 ${customerName} 充值 ${amount} U`,
      req,
      status: 'success'
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      data: recharge,
      message: '充值成功'
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('创建充值记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建充值记录失败',
      error: error.message
    });
  }
});

module.exports = router;