/**
 * 文件上传测试服务器
 * 独立运行，不依赖数据库
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors({
  origin: 'http://localhost:9529',
  credentials: true
}));
app.use(express.json());

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
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
  const allowedExts = ['.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
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

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: '文件上传测试服务器运行正常'
  });
});

// 文件上传接口
app.post('/api/upload/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const file = req.file;
    const filePath = file.path;
    
    console.log(`📁 文件上传成功: ${file.originalname}`);
    console.log(`📍 保存路径: ${filePath}`);
    
    // 计算文件哈希和行数
    const [fileHash, lineCount] = await Promise.all([
      calculateFileHash(filePath),
      calculateFileLines(filePath)
    ]);

    console.log(`✅ 文件分析完成: 行数=${lineCount}, MD5=${fileHash}`);

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

    res.json({
      success: true,
      data: fileInfo,
      message: '文件上传成功'
    });

  } catch (error) {
    console.error('❌ 文件上传失败:', error);
    
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

// 创建数据记录（模拟数据库操作）
app.post('/api/upload/create-with-file', async (req, res) => {
  try {
    console.log('📝 创建数据记录:', req.body);
    
    const data = {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString()
    };

    console.log('✅ 数据记录创建成功:', data);

    res.json({
      success: true,
      data: data,
      message: '数据创建成功'
    });
  } catch (error) {
    console.error('❌ 创建数据失败:', error);
    res.status(500).json({
      success: false,
      message: '创建数据失败',
      error: error.message
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
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

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 文件上传测试服务器启动成功');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${uploadDir}`);
  console.log('');
  console.log('可用接口:');
  console.log(`  GET  /health - 健康检查`);
  console.log(`  POST /api/upload/upload - 文件上传`);
  console.log(`  POST /api/upload/create-with-file - 创建数据记录`);
  console.log('');
});
