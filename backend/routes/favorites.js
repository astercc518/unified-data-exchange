/**
 * 收藏管理路由
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const { Favorite, DataLibrary, User } = models;

// 添加收藏
router.post('/', async (req, res) => {
  try {
    const { customer_id, data_id } = req.body;
    
    if (!customer_id || !data_id) {
      return res.status(400).json({
        success: false,
        message: '客户ID和数据ID不能为空'
      });
    }
    
    // 检查是否已收藏
    const existing = await Favorite.findOne({
      where: { customer_id, data_id }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过这条数据'
      });
    }
    
    // 获取数据详情
    const dataItem = await DataLibrary.findByPk(data_id);
    if (!dataItem) {
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }
    
    // 获取客户名称
    const customer = await User.findByPk(customer_id);
    
    // 创建收藏记录
    const favorite = await Favorite.create({
      customer_id,
      customer_name: customer ? customer.customer_name : '',
      data_id,
      country: dataItem.country,
      country_name: dataItem.country_name,
      data_type: dataItem.data_type,
      validity: dataItem.validity,
      available_quantity: dataItem.available_quantity,
      sell_price: dataItem.sell_price,
      create_time: Date.now()
    });
    
    res.json({
      success: true,
      data: favorite,
      message: '收藏成功'
    });
  } catch (error) {
    logger.error('添加收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '收藏失败',
      error: error.message
    });
  }
});

// 取消收藏
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const favorite = await Favorite.findByPk(id);
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在'
      });
    }
    
    await favorite.destroy();
    
    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    logger.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败',
      error: error.message
    });
  }
});

// 通过客户ID和数据ID取消收藏
router.delete('/by-data/:customerId/:dataId', async (req, res) => {
  try {
    const { customerId, dataId } = req.params;
    
    const favorite = await Favorite.findOne({
      where: {
        customer_id: customerId,
        data_id: dataId
      }
    });
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在'
      });
    }
    
    await favorite.destroy();
    
    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    logger.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败',
      error: error.message
    });
  }
});

// 获取客户的收藏列表
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Favorite.findAndCountAll({
      where: { customer_id: customerId },
      include: [{
        model: DataLibrary,
        as: 'dataItem',
        required: false
      }],
      limit: parseInt(limit),
      offset,
      order: [['create_time', 'DESC']]
    });
    
    // 格式化返回数据
    const formattedRows = rows.map(fav => {
      const favData = fav.toJSON();
      const dataItem = favData.dataItem;
      
      return {
        id: favData.id,
        customerId: favData.customer_id,
        customerName: favData.customer_name,
        dataId: favData.data_id,
        country: favData.country,
        countryName: favData.country_name,
        dataType: favData.data_type,
        validity: favData.validity,
        availableQuantity: dataItem ? dataItem.available_quantity : favData.available_quantity,
        sellPrice: dataItem ? parseFloat(dataItem.sell_price) : parseFloat(favData.sell_price),
        createTime: favData.create_time,
        // 附加最新数据信息
        currentData: dataItem ? {
          id: dataItem.id,
          availableQuantity: dataItem.available_quantity,
          sellPrice: parseFloat(dataItem.sell_price),
          status: dataItem.status
        } : null
      };
    });
    
    res.json({
      success: true,
      data: formattedRows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败',
      error: error.message
    });
  }
});

// 检查是否已收藏
router.get('/check/:customerId/:dataId', async (req, res) => {
  try {
    const { customerId, dataId } = req.params;
    
    const favorite = await Favorite.findOne({
      where: {
        customer_id: customerId,
        data_id: dataId
      }
    });
    
    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite ? favorite.id : null
      }
    });
  } catch (error) {
    logger.error('检查收藏状态失败:', error);
    res.status(500).json({
      success: false,
      message: '检查收藏状态失败',
      error: error.message
    });
  }
});

// 获取代理下所有客户的收藏数据（按一周内利润率排序）
router.get('/agent/:agentId/top-profit', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 5 } = req.query;
    
    // 获取该代理下的所有客户
    const customers = await User.findAll({
      where: { agent_id: agentId },
      attributes: ['id']
    });
    
    const customerIds = customers.map(c => c.id);
    
    if (customerIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }
    
    // 获取一周前的时间戳
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // 获取这些客户的收藏数据
    const favorites = await Favorite.findAll({
      where: {
        customer_id: { [Op.in]: customerIds },
        create_time: { [Op.gte]: oneWeekAgo }
      },
      include: [{
        model: DataLibrary,
        as: 'dataItem',
        required: true
      }]
    });
    
    // 计算利润率并排序
    const profitData = favorites.map(fav => {
      const dataItem = fav.dataItem;
      const sellPrice = parseFloat(dataItem.sell_price) || 0;
      const costPrice = parseFloat(dataItem.cost_price) || 0;
      const profitMargin = costPrice > 0 ? ((sellPrice - costPrice) / costPrice * 100) : 0;
      
      return {
        favoriteId: fav.id,
        customerId: fav.customer_id,
        customerName: fav.customer_name,
        dataId: fav.data_id,
        country: dataItem.country_name,
        dataType: dataItem.data_type,
        validity: dataItem.validity_name,
        availableQuantity: dataItem.available_quantity,
        sellPrice,
        costPrice,
        profitMargin: profitMargin.toFixed(2),
        createTime: fav.create_time
      };
    });
    
    // 按利润率降序排序
    profitData.sort((a, b) => parseFloat(b.profitMargin) - parseFloat(a.profitMargin));
    
    // 取前N条
    const topData = profitData.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: topData,
      total: topData.length
    });
  } catch (error) {
    logger.error('获取代理收藏数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取代理收藏数据失败',
      error: error.message
    });
  }
});

module.exports = router;
