/**
 * 数据列表路由
 * 根据记忆规范：上传的数据按时效性归类到73天内、30天内、30天以上，每个库再按国家细分
 */
const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { logDataOperation } = require('../utils/operationLogger');

const { DataLibrary } = models;

// 获取已发布的数据（资源中心专用）
router.get('/published', async (req, res) => {
  try {
    const { page = 1, limit = 20, country, validity, source } = req.query;
    
    // 只获取已发布且可用的数据
    const where = {
      publish_status: 'published',
      status: 'available',
      available_quantity: { [Op.gt]: 0 } // 只显示有库存的数据
    };
    
    if (country) {
      where.country = country;
    }
    if (validity) {
      where.validity = validity;
    }
    if (source) {
      where.source = { [Op.like]: `%${source}%` };
    }
    
    const { count, rows } = await DataLibrary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['publish_time', 'DESC']] // 按发布时间倒序
    });
    
    logger.info(`获取已发布数据: ${rows.length} 条，总计: ${count} 条`);
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取已发布数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取已发布数据失败',
      error: error.message
    });
  }
});

// 获取数据列表（根据记忆规范：按时效性分类）
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, country, validity, keyword } = req.query;
    
    const where = {};
    if (country) {
      where.country = country;
    }
    if (validity) {
      where.validity = validity; // within_3_days, within_30_days, over_30_days
    }
    if (keyword) {
      where[Op.or] = [
        { country: { [Op.like]: `%${keyword}%` } },
        { data_name: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await DataLibrary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['create_time', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取数据列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据列表失败',
      error: error.message
    });
  }
});

// 创建数据记录(数据上传)
router.post('/', async (req, res) => {
  try {
    const {
      country,
      countryCode,
      country_name,
      dataType,
      data_type,
      validity,
      validityDisplay,
      validity_name,
      source,
      availableQuantity,
      available_quantity,
      totalQuantity,
      total_quantity,
      operators,
      sellPrice,
      sell_price,
      costPrice,
      cost_price,
      remark,
      uploadBy,
      upload_by,
      fileName,
      filePath,
      fileSize,
      fileHash,
      fileId  // 新增：关联的文件ID
    } = req.body;

    // 数据验证
    if (!countryCode && !country) {
      return res.status(400).json({
        success: false,
        message: '国家代码或国家名称不能为空'
      });
    }

    // 时效性映射：将前端的 '3', '30', '30+' 转换为数据库的 validity
    let validityCode = validity;
    let validityName = validity_name || validityDisplay;
    
    if (validity === '3') {
      validityCode = '3';
      validityName = '3天内';
    } else if (validity === '30') {
      validityCode = '30';
      validityName = '30天内';
    } else if (validity === '30+') {
      validityCode = '30+';
      validityName = '30天以上';
    }

    const quantity = availableQuantity || available_quantity || totalQuantity || total_quantity || 0;

    // 处理 upload_by 字段：如果为空或非法值，设置为 NULL 以符合外键约束
    let uploadByValue = uploadBy || upload_by || null;
    // 如果是默认值 'admin' 或 'system'，且可能不存在于 users 表中，则设为 NULL
    if (uploadByValue === 'admin' || uploadByValue === 'system') {
      uploadByValue = null;
    }
    // 限制长度
    if (uploadByValue && uploadByValue.length > 50) {
      uploadByValue = uploadByValue.substring(0, 50);
    }

    // 创建数据记录
    const data = await DataLibrary.create({
      country: countryCode || country,
      country_name: country_name || country || '未知国家',
      data_type: dataType || data_type || '未知类型',
      validity: validityCode,
      validity_name: validityName,
      source: source || '数据上传',
      total_quantity: quantity,
      available_quantity: quantity,
      operators: operators || [],
      sell_price: sellPrice || sell_price || 0,
      cost_price: costPrice || cost_price || 0,
      remark: remark || '',
      file_name: fileName || null,
      file_path: filePath || null,
      file_size: fileSize || null,
      file_hash: fileHash || null,
      upload_time: Date.now(),
      upload_by: uploadByValue,
      publish_time: null,
      publish_status: 'pending',
      status: 'uploaded',
      create_time: Date.now(),
      file_id: fileId || null  // 保存文件ID关联
    });
    
    logger.info(`数据上传成功: ${data.country}-${data.data_type}-${data.validity}, 数量: ${data.available_quantity}`);
    
    // 记录操作日志
    await logDataOperation('上传', req, data.id, {
      country: data.country_name,
      dataType: data.data_type
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      data: data,
      message: '数据上传成功'
    });
  } catch (error) {
    logger.error('创建数据失败:', error);
    res.status(500).json({
      success: false,
      message: '创建数据失败',
      error: error.message
    });
  }
});

// 更新数据记录（根据记忆规范：购买后需自动减少库存）
router.put('/:id', async (req, res) => {
  try {
    const data = await DataLibrary.findByPk(req.params.id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }
    
    await data.update(req.body);
    
    logger.info(`数据更新成功: ${data.country}-${data.validity}`);
    
    // 记录操作日志
    await logDataOperation('更新', req, data.id, {
      country: data.country_name,
      dataType: data.data_type
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      data: data,
      message: '数据更新成功'
    });
  } catch (error) {
    logger.error('更新数据失败:', error);
    res.status(500).json({
      success: false,
      message: '更新数据失败',
      error: error.message
    });
  }
});

// 删除数据记录
router.delete('/:id', async (req, res) => {
  try {
    const data = await DataLibrary.findByPk(req.params.id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }
    
    const dataInfo = {
      country: data.country_name,
      dataType: data.data_type
    };
    
    await data.destroy();
    
    logger.info(`数据删除成功: ${data.country}-${data.validity}`);
    
    // 记录操作日志
    await logDataOperation('删除', req, req.params.id, dataInfo).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      message: '数据删除成功'
    });
  } catch (error) {
    logger.error('删除数据失败:', error);
    res.status(500).json({
      success: false,
      message: '删除数据失败',
      error: error.message
    });
  }
});

// 批量发布数据（注意：必须在 /:id/publish 之前定义）
router.post('/batch/publish', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要发布的数据ID列表'
      });
    }
    
    const publishTime = Date.now();
    const updateTime = Date.now();
    
    // 批量更新
    const [affectedCount] = await DataLibrary.update(
      {
        publish_status: 'published',
        publish_time: publishTime,
        status: 'available',
        update_time: updateTime
      },
      {
        where: {
          id: ids,
          publish_status: 'pending'
        }
      }
    );
    
    logger.info(`批量发布数据成功，共发布 ${affectedCount} 条数据`);
    
    // 记录操作日志
    await logDataOperation('批量发布', req, null, {
      count: affectedCount
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      count: affectedCount,
      message: `成功发布 ${affectedCount} 条数据`
    });
  } catch (error) {
    logger.error('批量发布数据失败:', error);
    res.status(500).json({
      success: false,
      message: '批量发布数据失败',
      error: error.message
    });
  }
});

// 发布数据（将待发布数据变为已发布）
router.post('/:id/publish', async (req, res) => {
  try {
    const data = await DataLibrary.findByPk(req.params.id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: '数据不存在'
      });
    }
    
    if (data.publish_status === 'published') {
      return res.json({
        success: true,
        data: data,
        message: '数据已经发布过了'
      });
    }
    
    // 更新发布状态
    await data.update({
      publish_status: 'published',
      publish_time: Date.now(),
      status: 'available',
      update_time: Date.now()
    });
    
    logger.info(`数据发布成功: ${data.country}-${data.data_type}-${data.validity}`);
    
    // 记录操作日志
    await logDataOperation('发布', req, data.id, {
      country: data.country_name,
      dataType: data.data_type
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      data: data,
      message: '数据发布成功'
    });
  } catch (error) {
    logger.error('发布数据失败:', error);
    res.status(500).json({
      success: false,
      message: '发布数据失败',
      error: error.message
    });
  }
});

// 获取订阅中心数据（基于已购买订单和收藏）
router.get('/subscription/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    logger.info(`获取客户 ${customerId} 的订阅数据...`);
    
    // 1. 获取用户已购买订单关联的数据ID
    const { Order, Favorite } = models;
    const purchasedOrders = await Order.findAll({
      where: { 
        customer_id: customerId,
        status: 'completed'
      },
      attributes: ['data_id'],
      group: ['data_id']
    });
    
    const purchasedDataIds = purchasedOrders.map(order => order.data_id);
    logger.info(`找到 ${purchasedDataIds.length} 种已购买的数据`);
    
    // 2. 获取用户收藏的数据ID
    const favorites = await Favorite.findAll({
      where: { customer_id: customerId },
      attributes: ['data_id']
    });
    
    const favoriteDataIds = favorites.map(fav => fav.data_id);
    logger.info(`找到 ${favoriteDataIds.length} 个收藏数据`);
    
    // 3. 如果有已购买的数据，获取这些数据的国家和类型，推荐相似数据
    let similarDataConditions = [];
    if (purchasedDataIds.length > 0) {
      const purchasedData = await DataLibrary.findAll({
        where: {
          id: { [Op.in]: purchasedDataIds }
        },
        attributes: ['country', 'validity']
      });
      
      // 提取唯一的国家和时效性组合
      const uniqueCombinations = new Set();
      purchasedData.forEach(data => {
        uniqueCombinations.add(JSON.stringify({ country: data.country, validity: data.validity }));
      });
      
      // 构建相似数据查询条件
      Array.from(uniqueCombinations).forEach(combo => {
        const { country, validity } = JSON.parse(combo);
        similarDataConditions.push({ country, validity });
      });
    }
    
    // 4. 构建查询条件：收藏的数据 OR 相似的数据（相同国家和时效性）
    const whereConditions = [];
    
    // 添加收藏的数据条件
    if (favoriteDataIds.length > 0) {
      whereConditions.push({
        id: { [Op.in]: favoriteDataIds }
      });
    }
    
    // 添加相似数据条件（排除已购买的数据本身）
    if (similarDataConditions.length > 0) {
      whereConditions.push({
        [Op.or]: similarDataConditions,
        id: { [Op.notIn]: purchasedDataIds.length > 0 ? purchasedDataIds : [0] }
      });
    }
    
    // 如果既没有收藏也没有购买记录，返回空列表
    if (whereConditions.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        message: '暂无订阅数据'
      });
    }
    
    // 5. 查询符合条件的可用数据
    const { count, rows } = await DataLibrary.findAndCountAll({
      where: {
        [Op.or]: whereConditions,
        publish_status: 'published',
        status: 'available',
        available_quantity: { [Op.gt]: 0 }
      },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['publish_time', 'DESC']]
    });
    
    // 6. 标记数据来源（推荐 / 收藏）
    const enrichedData = rows.map(item => {
      const isFavorited = favoriteDataIds.includes(item.id);
      const isSimilar = similarDataConditions.some(
        cond => cond.country === item.country && cond.validity === item.validity
      );
      
      return {
        ...item.toJSON(),
        subscriptionSource: isFavorited && isSimilar
          ? 'both' 
          : isFavorited 
            ? 'favorite' 
            : 'purchased',
        isFavorited,
        isPurchasedType: isSimilar
      };
    });
    
    logger.info(`订阅中心返回 ${enrichedData.length} 条数据，总计: ${count} 条`);
    
    res.json({
      success: true,
      data: enrichedData,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取订阅数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订阅数据失败',
      error: error.message
    });
  }
});

module.exports = router;