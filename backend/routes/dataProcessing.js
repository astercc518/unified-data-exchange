/**
 * 数据处理路由
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { models } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const DataProcessor = require('../utils/dataProcessor');
const PhoneAnalyzer = require('../utils/phoneNumberAnalyzer');
const PhoneGenerator = require('../utils/phoneNumberGenerator');
const logger = require('../utils/logger');

const { CustomerDataFile } = models;

// 文件存储目录
const UPLOAD_DIR = path.join(__dirname, '../uploads/customer_data');
const PROCESSED_DIR = path.join(__dirname, '../uploads/processed_data');

// 确保目录存在
async function ensureDirectories() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(PROCESSED_DIR, { recursive: true });
}
ensureDirectories();

// 配置multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uuid}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.txt') {
      return cb(new Error('只支持TXT格式文件'));
    }
    cb(null, true);
  }
});

/**
 * 上传数据文件
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择文件' });
    }

    const { userId, userType, loginAccount, user } = req.user;

    const filePath = req.file.path;
    const fileSize = req.file.size;
    
    // 解决中文文件名乱码问题
    const originalFilename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    
    // 获取上传用户名称
    const customerName = userType === 'agent' ? user.agent_name : user.customer_name;
    
    // 验证文件内容
    const validation = await DataProcessor.validateDataFile(filePath);
    if (!validation.valid) {
      await fs.unlink(filePath); // 删除无效文件
      return res.status(400).json({ 
        success: false, 
        message: validation.error 
      });
    }

    // 处理上传：自动过滤不正常的手机号数据
    const processResult = await DataProcessor.processUpload(
      filePath, 
      filePath,  // 直接覆盖原文件（保留有效数据）
      { filterInvalid: true }  // 自动过滤异常数据
    );

    // 计算过期时间（1个月后）
    const uploadTime = Date.now();
    const expireTime = uploadTime + (30 * 24 * 60 * 60 * 1000);

    // 保存文件记录
    const fileRecord = await CustomerDataFile.create({
      customer_id: userId,
      customer_account: loginAccount,
      customer_name: customerName,  // 新增：上传用户名称
      original_filename: originalFilename,
      stored_filename: req.file.filename,
      file_path: filePath,
      file_size: fileSize,
      line_count: processResult.validCount, // 使用有效数据行数
      file_type: 'txt',
      upload_time: uploadTime,
      expire_time: expireTime,
      status: 1,
      description: req.body.description || ''
    });

    logger.info(
      `用户 ${loginAccount} 上传数据文件: ${originalFilename}, ` +
      `原始${processResult.originalCount}行, 有效${processResult.validCount}行, ` +
      `过滤${processResult.invalidCount}条异常数据`
    );

    res.json({
      success: true,
      message: processResult.invalidCount > 0 
        ? `文件上传成功！已自动过滤 ${processResult.invalidCount} 条异常数据，保留 ${processResult.validCount} 条有效数据`
        : '文件上传成功',
      data: {
        id: fileRecord.id,
        filename: originalFilename,
        size: fileSize,
        lineCount: processResult.validCount,
        originalCount: processResult.originalCount,
        invalidCount: processResult.invalidCount,
        uploadTime: uploadTime,
        expireTime: expireTime,
        // 数据预览（前20条有效数据）
        preview: processResult.preview
      }
    });
  } catch (error) {
    logger.error('文件上传失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取文件预览
 */
router.get('/file/:id/preview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userType } = req.user;

    const file = await CustomerDataFile.findByPk(id);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 权限检查
    if (userType !== 'admin' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限访问此文件' });
    }

    // 读取文件前20行
    const lines = await DataProcessor.readLines(file.file_path);
    const preview = lines.slice(0, 20);

    // 使用 awesome-phonenumber 进行智能检测
    const phoneNumbers = lines.slice(0, 100); // 采样100条
    const countryAnalysis = PhoneAnalyzer.analyzeCountryDistribution(phoneNumbers);

    res.json({
      success: true,
      data: {
        filename: file.original_filename,
        lineCount: file.line_count,
        preview: preview,
        countryAnalysis: countryAnalysis, // 国家分布分析
        // 保留旧的 codeDetection 以兼容前端
        codeDetection: countryAnalysis.countries.length > 0 ? {
          hasCode: true,
          primaryCode: countryAnalysis.countries[0].countryCode,
          confidence: (countryAnalysis.validCount / countryAnalysis.totalCount * 100).toFixed(0) + '%',
          regionCode: countryAnalysis.countries[0].regionCode
        } : {
          hasCode: false
        }
      }
    });
  } catch (error) {
    logger.error('获取文件预览失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 分析文件中的国家分布（使用 awesome-phonenumber）
 */
router.post('/analyze-country-distribution', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.body;
    const { userId, userType } = req.user;

    if (!fileId) {
      return res.status(400).json({ success: false, message: '请提供文件ID' });
    }

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType !== 'admin' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    // 读取文件内容
    const lines = await DataProcessor.readLines(file.file_path);
    const phoneNumbers = lines.map(line => line.trim()).filter(line => line.length > 0);

    // 使用 awesome-phonenumber 分析国家分布
    const result = PhoneAnalyzer.analyzeCountryDistribution(phoneNumbers);

    logger.info(
      `分析文件国家分布: ${file.original_filename}, ` +
      `总数据${result.totalCount}条, ` +
      `识别${result.countries.length}个国家`
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('分析国家分布失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取文件列表
 * 管理员：查看所有文件
 * 代理：查看自己上传的文件
 * 客户：查看自己上传的文件
 */
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { models } = require('../config/database');
    const { User } = models;
    
    let files;
    if (userType === 'admin') {
      // 管理员查看所有文件
      files = await CustomerDataFile.findAll({
        where: { status: 1 },
        order: [['upload_time', 'DESC']]
      });
    } else if (userType === 'agent') {
      // 代理查看自己上传的文件
      files = await CustomerDataFile.findAll({
        where: { 
          customer_id: userId,
          status: 1 
        },
        order: [['upload_time', 'DESC']]
      });
    } else {
      // 客户查看自己上传的文件
      files = await CustomerDataFile.findAll({
        where: { 
          customer_id: userId,
          status: 1 
        },
        order: [['upload_time', 'DESC']]
      });
    }

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    logger.error('获取文件列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 数据去重
 */
router.post('/deduplicate', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.body;
    const { userId, userType } = req.user;

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 权限检查：管理员可以操作所有文件，其他用户只能操作自己的文件
    if (userType !== 'admin' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    const outputFilename = `dedup_${file.stored_filename}`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    const result = await DataProcessor.deduplicate(file.file_path, outputPath);

    logger.info(`数据去重完成: ${file.original_filename}, 原始${result.originalCount}行, 去重后${result.uniqueCount}行`);

    res.json({
      success: true,
      message: '去重完成',
      data: {
        ...result,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('数据去重失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 增加国码
 */
router.post('/add-country-code', authenticateToken, async (req, res) => {
  try {
    const { fileId, countryCode } = req.body;
    const { userId, userType } = req.user;

    if (!countryCode) {
      return res.status(400).json({ success: false, message: '请提供国码' });
    }

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType === 'customer' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    const outputFilename = `add_code_${file.stored_filename}`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    const result = await DataProcessor.addCountryCode(file.file_path, outputPath, countryCode);

    res.json({
      success: true,
      message: '国码添加完成',
      data: {
        ...result,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('添加国码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 去除国码
 */
router.post('/remove-country-code', authenticateToken, async (req, res) => {
  try {
    const { fileId, countryCode } = req.body;
    const { userId, userType } = req.user;

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType === 'customer' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    const outputFilename = `remove_code_${file.stored_filename}`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    const result = await DataProcessor.removeCountryCode(file.file_path, outputPath, countryCode);

    res.json({
      success: true,
      message: '国码去除完成',
      data: {
        ...result,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('去除国码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 数据对比
 */
router.post('/compare', authenticateToken, async (req, res) => {
  try {
    const { file1Id, file2Id, mode = 'diff' } = req.body;
    const { userId, userType } = req.user;

    const file1 = await CustomerDataFile.findByPk(file1Id);
    const file2 = await CustomerDataFile.findByPk(file2Id);

    if (!file1 || !file2 || file1.status !== 1 || file2.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType === 'customer' && (file1.customer_id !== userId || file2.customer_id !== userId)) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    const outputFilename = `compare_${mode}_${Date.now()}.txt`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    const result = await DataProcessor.compareData(
      file1.file_path,
      file2.file_path,
      outputPath,
      mode
    );

    res.json({
      success: true,
      message: '数据对比完成',
      data: {
        ...result,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('数据对比失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 分析文件中的运营商分布
 */
router.post('/analyze-operator-distribution', authenticateToken, async (req, res) => {
  try {
    const { fileId, countryCode, operators } = req.body;
    const { userId, userType } = req.user;

    // 验证参数
    if (!fileId) {
      return res.status(400).json({ success: false, message: '请提供文件ID' });
    }
    if (!countryCode) {
      return res.status(400).json({ success: false, message: '请提供国家代码' });
    }
    if (!operators || !Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({ success: false, message: '请提供运营商信息' });
    }

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType === 'customer' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    // 读取文件内容
    const lines = await DataProcessor.readLines(file.file_path);
    const phoneNumbers = lines.map(line => line.trim()).filter(line => line.length > 0);

    // 所有国家统一使用 awesome-phonenumber 进行智能分析
    logger.info(`使用 awesome-phonenumber 分析 ${countryCode} 号码，共 ${phoneNumbers.length} 条`);
    
    // 根据国码确定国家代码（扩展支持更多国家）
    const countryCodeMap = {
      '1': 'US',      // 美国/加拿大
      '7': 'RU',      // 俄罗斯
      '20': 'EG',     // 埃及
      '27': 'ZA',     // 南非
      '30': 'GR',     // 希腊
      '31': 'NL',     // 荷兰
      '32': 'BE',     // 比利时
      '33': 'FR',     // 法国
      '34': 'ES',     // 西班牙
      '36': 'HU',     // 匈牙利
      '39': 'IT',     // 意大利
      '40': 'RO',     // 罗马尼亚
      '41': 'CH',     // 瑞士
      '43': 'AT',     // 奥地利
      '44': 'GB',     // 英国
      '45': 'DK',     // 丹麦
      '46': 'SE',     // 瑞典
      '47': 'NO',     // 挪威
      '48': 'PL',     // 波兰
      '49': 'DE',     // 德国
      '51': 'PE',     // 秘鲁
      '52': 'MX',     // 墨西哥
      '53': 'CU',     // 古巴
      '54': 'AR',     // 阿根廷
      '55': 'BR',     // 巴西
      '56': 'CL',     // 智利
      '57': 'CO',     // 哥伦比亚
      '58': 'VE',     // 委内瑞拉
      '60': 'MY',     // 马来西亚
      '61': 'AU',     // 澳大利亚
      '62': 'ID',     // 印度尼西亚
      '63': 'PH',     // 菲律宾
      '64': 'NZ',     // 新西兰
      '65': 'SG',     // 新加坡
      '66': 'TH',     // 泰国
      '81': 'JP',     // 日本
      '82': 'KR',     // 韩国
      '84': 'VN',     // 越南
      '86': 'CN',     // 中国
      '90': 'TR',     // 土耳其
      '91': 'IN',     // 印度
      '92': 'PK',     // 巴基斯坦
      '93': 'AF',     // 阿富汗
      '94': 'LK',     // 斯里兰卡
      '95': 'MM',     // 缅甸
      '98': 'IR',     // 伊朗
      '212': 'MA',    // 摩洛哥
      '213': 'DZ',    // 阿尔及利亚
      '216': 'TN',    // 突尼斯
      '218': 'LY',    // 利比亚
      '220': 'GM',    // 冈比亚
      '234': 'NG',    // 尼日利亚
      '254': 'KE',    // 肯尼亚
      '255': 'TZ',    // 坦桑尼亚
      '256': 'UG',    // 乌干达
      '351': 'PT',    // 葡萄牙
      '352': 'LU',    // 卢森堡
      '353': 'IE',    // 爱尔兰
      '354': 'IS',    // 冰岛
      '355': 'AL',    // 阿尔巴尼亚
      '370': 'LT',    // 立陶宛
      '371': 'LV',    // 拉脱维亚
      '372': 'EE',    // 爱沙尼亚
      '380': 'UA',    // 乌克兰
      '420': 'CZ',    // 捷克
      '421': 'SK',    // 斯洛伐克
      '880': 'BD',    // 孟加拉国
      '886': 'TW',    // 台湾
      '960': 'MV',    // 马尔代夫
      '961': 'LB',    // 黎巴嫩
      '962': 'JO',    // 约旦
      '963': 'SY',    // 叙利亚
      '964': 'IQ',    // 伊拉克
      '965': 'KW',    // 科威特
      '966': 'SA',    // 沙特阿拉伯
      '967': 'YE',    // 也门
      '968': 'OM',    // 阿曼
      '971': 'AE',    // 阿联酋
      '972': 'IL',    // 以色列
      '973': 'BH',    // 巴林
      '974': 'QA',    // 卡塔尔
      '975': 'BT',    // 不丹
      '976': 'MN',    // 蒙古
      '977': 'NP'     // 尼泊尔
    };
    
    const regionCode = countryCodeMap[countryCode] || null;
    
    const result = PhoneAnalyzer.analyzeOperatorDistribution(phoneNumbers, operators, regionCode);
    
    // 添加分析方法标识
    result.analysisMethod = 'awesome-phonenumber';
    result.note = '使用 Google libphonenumber 库进行号码解析和验证';
    result.regionCode = regionCode;

    logger.info(
      `分析文件运营商分布: ${file.original_filename}, ` +
      `总数据${result.totalCount}条, ` +
      `识别${result.distribution.length}个运营商, ` +
      `方法: ${result.analysisMethod}`
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('分析运营商分布失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 按运营商提取
 * 支持多运营商自定义提取条数
 */
router.post('/extract-by-operator', authenticateToken, async (req, res) => {
  try {
    const { fileId, operators } = req.body;
    const { userId, userType } = req.user;

    // 验证运营商数据
    if (!operators || !Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({ success: false, message: '请提供运营商信息' });
    }

    // 验证每个运营商的数据格式
    for (const op of operators) {
      if (!op.name || !op.numberSegments || !Array.isArray(op.numberSegments)) {
        return res.status(400).json({ 
          success: false, 
          message: `运营商 ${op.name || '未知'} 的数据格式不正确` 
        });
      }
      if (op.limit && (typeof op.limit !== 'number' || op.limit <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: `运营商 ${op.name} 的提取条数必须为正整数` 
        });
      }
    }

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType === 'customer' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    // 读取源文件数据
    const allLines = await DataProcessor.readLines(file.file_path);
    const mergedData = [];
    const operatorStats = [];
    let totalProcessed = allLines.length;

    // 为每个运营商提取数据并合并
    for (const operator of operators) {
      let matchedLines = [];
      const countryCode = operator.countryCode;
      
      // 遍历所有数据行，匹配当前运营商
      for (const line of allLines) {
        // 如果已达到该运营商的限制条数，停止提取
        if (operator.limit && matchedLines.length >= operator.limit) {
          break;
        }
        
        // 清理数据：去除所有非数字字符
        const cleaned = line.replace(/[^\d]/g, '');
        let phoneNumber = cleaned;
        
        // 智能去除国码
        if (countryCode) {
          const codeLength = countryCode.length;
          const standardPhoneLengths = DataProcessor.constructor.getStandardPhoneLengths ? 
            DataProcessor.constructor.getStandardPhoneLengths(countryCode) : [9, 10, 11];
          const standardLengthsWithCode = standardPhoneLengths.map(len => len + codeLength);
          
          const prefix = cleaned.substring(0, codeLength);
          const hasCodePrefix = prefix === countryCode;
          const isStandardLengthWithCode = standardLengthsWithCode.includes(cleaned.length);
          
          // 如果前缀匹配且总长度符合标准，去除国码
          if (hasCodePrefix && isStandardLengthWithCode) {
            phoneNumber = cleaned.substring(codeLength);
          }
        }
        
        // 检查是否匹配当前运营商的号段
        const isMatch = operator.numberSegments.some(segment => phoneNumber.startsWith(segment));
        
        if (isMatch) {
          matchedLines.push(cleaned);  // 保存原始数据（含国码）
        }
      }
      
      // 将当前运营商的数据添加到合并数据中
      mergedData.push(...matchedLines);
      
      operatorStats.push({
        operatorName: operator.name,
        matchedCount: matchedLines.length,
        limit: operator.limit || null,
        limitReached: operator.limit && matchedLines.length >= operator.limit
      });

      logger.info(
        `运营商数据匹配: ${operator.name}, ` +
        `匹配${matchedLines.length}行` +
        (operator.limit ? ` (限制${operator.limit}条)` : '')
      );
    }

    // 生成合并文件
    const operatorNames = operators.map(op => op.name).join('_');
    const outputFilename = `merged_${operatorNames}_${Date.now()}.txt`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);
    
    await DataProcessor.writeLines(outputPath, mergedData);

    logger.info(
      `按运营商合并提取完成: ${file.original_filename}, ` +
      `运营商数: ${operators.length}, ` +
      `总提取${mergedData.length}行`
    );

    res.json({
      success: true,
      message: '运营商数据提取完成',
      data: {
        totalMatched: mergedData.length,
        totalProcessed: totalProcessed,
        operatorCount: operators.length,
        operatorStats: operatorStats,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('按运营商提取失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 按条数提取
 */
router.post('/extract-by-count', authenticateToken, async (req, res) => {
  try {
    const { fileId, count, startFrom = 0 } = req.body;
    const { userId, userType } = req.user;

    if (!count || count <= 0) {
      return res.status(400).json({ success: false, message: '请提供有效的提取条数' });
    }

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (userType === 'customer' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    const outputFilename = `extract_${count}_${Date.now()}.txt`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    const result = await DataProcessor.extractByCount(
      file.file_path,
      outputPath,
      parseInt(count),
      parseInt(startFrom)
    );

    res.json({
      success: true,
      message: '数据提取完成',
      data: {
        ...result,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('按条数提取失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 一键清洗数据
 */
router.post('/clean-data', authenticateToken, async (req, res) => {
  try {
    const { fileId, countryCode, autoAddCode = true, autoDeduplicate = true, removeInvalid = true } = req.body;
    const { userId, userType } = req.user;

    const file = await CustomerDataFile.findByPk(fileId);
    if (!file || file.status !== 1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 权限检查
    if (userType !== 'admin' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限操作此文件' });
    }

    const outputFilename = `cleaned_${file.stored_filename}`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    // 执行一键清洗
    const result = await DataProcessor.cleanData(
      file.file_path,
      outputPath,
      {
        countryCode,
        autoAddCode,
        autoDeduplicate,
        removeInvalid
      }
    );

    logger.info(
      `一键清洗完成: ${file.original_filename}, ` +
      `原始${result.originalCount}行, 最终${result.finalCount}行, ` +
      `去除异常${result.invalidCount}条, 去重${result.duplicateCount}条, ` +
      `添加国码${result.addedCodeCount}条`
    );

    res.json({
      success: true,
      message: '数据清洗完成',
      data: {
        ...result,
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('一键清洗失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 下载处理后的文件
 */
router.get('/download/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(PROCESSED_DIR, filename);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    res.download(filePath, filename);
  } catch (error) {
    logger.error('文件下载失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 删除文件
 */
router.delete('/file/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userType } = req.user;

    const file = await CustomerDataFile.findByPk(id);
    if (!file) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 权限检查
    if (userType === 'customer' && file.customer_id !== userId) {
      return res.status(403).json({ success: false, message: '无权限删除此文件' });
    }

    // 删除物理文件
    try {
      await fs.unlink(file.file_path);
    } catch (err) {
      logger.warn('删除物理文件失败:', err.message);
    }

    // 标记为已删除
    file.status = 0;
    await file.save();

    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    logger.error('删除文件失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取国家号码格式信息
 */
router.get('/country-format/:regionCode', authenticateToken, async (req, res) => {
  try {
    const { regionCode } = req.params;
    
    const formatInfo = PhoneGenerator.getCountryNumberFormat(regionCode);
    
    if (formatInfo.error) {
      return res.status(400).json({ success: false, message: formatInfo.error });
    }

    res.json({
      success: true,
      data: formatInfo
    });
  } catch (error) {
    logger.error('获取国家格式信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 验证号段
 */
router.post('/validate-segments', authenticateToken, async (req, res) => {
  try {
    const { regionCode, numberSegments } = req.body;
    
    if (!regionCode || !numberSegments || !Array.isArray(numberSegments)) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供国家代码和号段列表' 
      });
    }

    const validation = PhoneGenerator.validateNumberSegments(regionCode, numberSegments);
    
    res.json({
      success: validation.valid,
      data: validation
    });
  } catch (error) {
    logger.error('验证号段失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 生成号码（单个运营商）
 */
router.post('/generate-numbers', authenticateToken, async (req, res) => {
  try {
    const { regionCode, numberSegments, count, options = {} } = req.body;
    const { userId, loginAccount } = req.user;
    
    // 验证参数
    if (!regionCode) {
      return res.status(400).json({ success: false, message: '请提供国家代码' });
    }
    if (!numberSegments || !Array.isArray(numberSegments) || numberSegments.length === 0) {
      return res.status(400).json({ success: false, message: '请提供号段列表' });
    }
    if (!count || count <= 0 || count > 1000000) {
      return res.status(400).json({ 
        success: false, 
        message: '生成数量必须在 1-1,000,000 之间' 
      });
    }

    // 验证号段
    const validation = PhoneGenerator.validateNumberSegments(regionCode, numberSegments);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: '号段验证失败',
        data: validation
      });
    }

    // 生成号码
    const numbers = PhoneGenerator.generatePhoneNumbers(
      regionCode, 
      numberSegments, 
      count, 
      options
    );

    // 保存到文件
    const timestamp = Date.now();
    const outputFilename = `generated_${regionCode}_${timestamp}.txt`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);
    await DataProcessor.writeLines(outputPath, numbers);

    logger.info(
      `用户 ${loginAccount} 生成号码: 国家=${regionCode}, ` +
      `号段数=${numberSegments.length}, 生成数=${numbers.length}`
    );

    res.json({
      success: true,
      message: `成功生成 ${numbers.length} 条号码`,
      data: {
        regionCode,
        count: numbers.length,
        requestedCount: count,
        segments: numberSegments,
        preview: numbers.slice(0, 20),
        downloadPath: `/api/data-processing/download/${outputFilename}`
      }
    });
  } catch (error) {
    logger.error('生成号码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 批量生成号码（多个运营商）- 优化版：流式处理，适用于10W+数据
 */
router.post('/generate-multiple-operators', authenticateToken, async (req, res) => {
  try {
    const { regionCode, operators, options = {} } = req.body;
    const { userId, loginAccount } = req.user;
    
    // 验证参数
    if (!regionCode) {
      return res.status(400).json({ success: false, message: '请提供国家代码' });
    }
    if (!operators || !Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({ success: false, message: '请提供运营商配置' });
    }

    // 验证每个运营商的配置
    let totalCount = 0;
    for (const op of operators) {
      if (!op.name || !op.numberSegments || !Array.isArray(op.numberSegments)) {
        return res.status(400).json({ 
          success: false, 
          message: `运营商 ${op.name || '未知'} 配置不完整` 
        });
      }
      if (!op.count || op.count <= 0 || op.count > 1000000) {
        return res.status(400).json({ 
          success: false, 
          message: `运营商 ${op.name} 生成数量必须在 1-1,000,000 之间` 
        });
      }
      totalCount += op.count;
    }

    logger.info(
      `用户 ${loginAccount} 开始批量生成号码: 国家=${regionCode}, ` +
      `运营商数=${operators.length}, 总数量=${totalCount}, ` +
      `使用${totalCount > 100000 ? '流式' : '内存'}处理, ` +
      `预计耗时: ${Math.ceil(totalCount / 10000)}秒`
    );

    const startTime = Date.now();

    // 使用流式处理，避免大数据占用内存
    const result = await PhoneGenerator.generateMultipleOperatorsStream(
      regionCode, 
      operators, 
      PROCESSED_DIR,
      options
    );

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // 准备返回结果
    const downloadPaths = result.operators.map(op => ({
      operatorName: op.name,
      count: op.count,
      downloadPath: `/api/data-processing/download/${path.basename(op.outputPath)}`
    }));

    logger.info(
      `用户 ${loginAccount} 批量生成完成: 国家=${regionCode}, ` +
      `运营商数=${operators.length}, 总生成数=${result.total}, ` +
      `实际耗时=${elapsedTime}秒`
    );

    // 获取预览数据（从第一个运营商）
    const previewData = result.operators.length > 0 ? result.operators[0].preview : [];

    res.json({
      success: true,
      message: `成功生成 ${result.total} 条号码（${operators.length} 个运营商），耗时 ${elapsedTime} 秒`,
      data: {
        regionCode,
        totalCount: result.total,
        operatorCount: operators.length,
        operators: downloadPaths,
        preview: previewData,
        elapsedTime: parseFloat(elapsedTime),
        note: totalCount > 100000 ? '已使用流式处理，降低系统资源消耗' : ''
      }
    });
  } catch (error) {
    logger.error('批量生成号码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
