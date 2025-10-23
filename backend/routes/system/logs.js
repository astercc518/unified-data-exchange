/**
 * 系统操作日志路由
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../../config/database');
const { Op } = require('sequelize');
const logger = require('../../utils/logger');

const { OperationLog } = models;

// 获取操作日志列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      operator, 
      startDate, 
      endDate,
      keyword 
    } = req.query;
    
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (operator) {
      where.operator = { [Op.like]: `%${operator}%` };
    }
    
    if (keyword) {
      where[Op.or] = [
        { operator: { [Op.like]: `%${keyword}%` } },
        { action: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (startDate && endDate) {
      where.create_time = {
        [Op.gte]: parseInt(startDate),
        [Op.lte]: parseInt(endDate)
      };
    }
    
    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['create_time', 'DESC']]
    });
    
    const formattedData = rows.map(log => {
      const data = log.toJSON();
      return {
        id: data.id,
        type: data.type,
        operator: data.operator,
        operatorType: data.operator_type,
        action: data.action,
        description: data.description,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        createTime: data.create_time,
        status: data.status
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
    logger.error('获取操作日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取操作日志失败',
      error: error.message
    });
  }
});

// 记录操作日志
router.post('/', async (req, res) => {
  try {
    const { 
      type, 
      operator, 
      operator_type, 
      action, 
      description, 
      ip_address, 
      user_agent,
      status = 'success'
    } = req.body;
    
    const log = await OperationLog.create({
      type,
      operator,
      operator_type,
      action,
      description,
      ip_address,
      user_agent,
      status,
      create_time: Date.now()
    });
    
    res.json({
      success: true,
      data: log,
      message: '操作日志记录成功'
    });
  } catch (error) {
    logger.error('记录操作日志失败:', error);
    res.status(500).json({
      success: false,
      message: '记录操作日志失败',
      error: error.message
    });
  }
});

// 清空操作日志（仅管理员）
router.delete('/clear', async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const deletedCount = await OperationLog.destroy({
      where: {
        create_time: { [Op.lt]: cutoffTime }
      }
    });
    
    logger.info(`清空${days}天前的操作日志，共删除${deletedCount}条记录`);
    
    res.json({
      success: true,
      data: { deletedCount },
      message: `成功清空${deletedCount}条历史日志`
    });
  } catch (error) {
    logger.error('清空操作日志失败:', error);
    res.status(500).json({
      success: false,
      message: '清空操作日志失败',
      error: error.message
    });
  }
});

module.exports = router;
