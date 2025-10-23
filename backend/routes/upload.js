/**
 * 文件上传路由
 * 处理数据文件上传和存储
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { models } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();
const { DataLibrary } = models;

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 按日期创建子目录
    const dateStr = new Date().toISOString().split('T')[0];
    const dateDirPath = path.join(uploadDir, dateStr);
    
    if (!fs.existsSync(dateDirPath)) {
      fs.mkdirSync(dateDirPath, { recursive: true });
    }
    
    cb(null, dateDirPath);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}_${randomStr}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许文本文件
  const allowedMimes = ['text/plain', 'application/octet-stream'];
  const allowedExts = ['.txt'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 .txt 格式的文件'), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  }
});

// 计算文件MD5哈希
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// 计算文件行数
function calculateFileLines(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        const lines = data.split('\n').filter(line => line.trim().length > 0);
        resolve(lines.length);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 文件上传接口
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const file = req.file;
    const filePath = file.path;
    
    // 计算文件哈希和行数
    const [fileHash, lineCount] = await Promise.all([
      calculateFileHash(filePath),
      calculateFileLines(filePath)
    ]);

    // 返回文件信息
    const fileInfo = {
      originalName: file.originalname,
      filename: file.filename,
      path: filePath,
      size: file.size,
      hash: fileHash,
      lines: lineCount,
      uploadTime: Date.now()
    };

    logger.info(`文件上传成功: ${file.originalname}, 行数: ${lineCount}`);

    res.json({
      success: true,
      data: fileInfo,
      message: '文件上传成功'
    });

  } catch (error) {
    logger.error('文件上传失败:', error);
    
    // 清理上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
});

// 创建数据记录（带文件信息）
router.post('/create-with-file', async (req, res) => {
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
      operators,
      sellPrice,
      sell_price,
      costPrice,
      cost_price,
      remark,
      uploadBy,
      upload_by,
      // 文件相关信息
      fileName,
      filePath,
      fileSize,
      fileHash,
      fileLines
    } = req.body;

    // 数据验证
    if (!countryCode && !country) {
      return res.status(400).json({
        success: false,
        message: '国家代码或国家名称不能为空'
      });
    }

    if (!fileName || !filePath) {
      return res.status(400).json({
        success: false,
        message: '文件信息不完整'
      });
    }

    // 时效性映射
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

    const quantity = fileLines || 0;

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
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      file_hash: fileHash,
      upload_time: Date.now(),
      upload_by: uploadBy || upload_by || 'system',
      publish_time: null,
      publish_status: 'pending',
      status: 'uploaded',
      create_time: Date.now()
    });
    
    logger.info(`数据创建成功: ${data.country}-${data.data_type}-${data.validity}, 文件: ${fileName}`);
    
    res.json({
      success: true,
      data: data,
      message: '数据创建成功'
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

// 获取文件内容（用于预览）
router.get('/file/:id', async (req, res) => {
  try {
    const data = await DataLibrary.findByPk(req.params.id);
    
    if (!data || !data.file_path) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    const filePath = data.file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件已被删除'
      });
    }

    // 读取文件内容（限制前1000行）
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 1000);

    res.json({
      success: true,
      data: {
        fileName: data.file_name,
        totalLines: data.total_quantity,
        previewLines: lines.length,
        content: lines.join('\n')
      }
    });

  } catch (error) {
    logger.error('获取文件内容失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件内容失败',
      error: error.message
    });
  }
});

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小不能超过100MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: '只能上传一个文件'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: error.message || '文件上传错误'
  });
});

module.exports = router;