/**
 * 简化测试服务器 - 验证API架构设计
 * 使用内存存储模拟数据库功能
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 内存存储模拟数据库
const mockDB = {
  users: [
    {
      id: 1,
      login_account: 'admin',
      login_password: '111111',
      customer_name: '系统管理员',
      account_balance: 10000.00,
      status: 1,
      create_time: Date.now()
    },
    {
      id: 2,
      login_account: 'KL01880V01',
      login_password: '123456',
      customer_name: '测试客户',
      account_balance: 5000.00,
      status: 1,
      create_time: Date.now()
    }
  ],
  agents: [
    {
      id: 1,
      login_account: 'agent001',
      login_password: 'agent123',
      agent_name: '代理商A',
      status: 1,
      create_time: Date.now()
    }
  ],
  dataLibrary: [],
  orders: [],
  rechargeRecords: []
};

// 中间件配置
app.use(cors({
  origin: 'http://localhost:9529',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'test',
    database: 'mock-memory',
    message: '测试服务器运行正常'
  });
});

// 数据库连接测试接口
app.get('/api/migrate/test-connection', (req, res) => {
  res.json({
    success: true,
    message: '模拟数据库连接成功',
    database: 'mock-memory',
    tables: Object.keys(mockDB),
    statistics: {
      users: mockDB.users.length,
      agents: mockDB.agents.length,
      dataLibrary: mockDB.dataLibrary.length,
      orders: mockDB.orders.length,
      rechargeRecords: mockDB.rechargeRecords.length
    }
  });
});

// 认证接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('登录尝试:', { username, password });
  
  // 检查客户
  let user = mockDB.users.find(u => 
    u.login_account === username && 
    u.login_password === password && 
    u.status === 1
  );
  
  let userType = 'customer';
  
  // 检查代理
  if (!user) {
    user = mockDB.agents.find(a => 
      a.login_account === username && 
      a.login_password === password && 
      a.status === 1
    );
    userType = 'agent';
  }
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: '用户名或密码错误',
      debug: { availableUsers: mockDB.users.map(u => u.login_account) }
    });
  }
  
  const token = `${userType}-${user.id}-${Date.now()}`;
  res.json({ 
    success: true, 
    data: { 
      token, 
      userInfo: { 
        id: user.id, 
        type: userType,
        name: user.customer_name || user.agent_name,
        account: user.login_account
      }
    }
  });
});

// 用户信息接口
app.get('/api/auth/info', (req, res) => {
  const token = req.headers.authorization || req.query.token;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token缺失' });
  }
  
  // 解析token
  const parts = token.replace('Bearer ', '').split('-');
  if (parts.length < 2) {
    return res.status(401).json({ success: false, message: 'Token格式错误' });
  }
  
  const userType = parts[0];
  const userId = parseInt(parts[1]);
  
  let user;
  if (userType === 'customer') {
    user = mockDB.users.find(u => u.id === userId);
  } else if (userType === 'agent') {
    user = mockDB.agents.find(a => a.id === userId);
  }
  
  if (!user) {
    return res.status(401).json({ success: false, message: '用户不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.customer_name || user.agent_name,
      account: user.login_account,
      type: userType,
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      roles: [userType]
    }
  });
});

// 数据迁移接口
app.post('/api/migrate/from-localstorage', (req, res) => {
  const { userList = [], agentList = [], dataLibrary = [], orderList = [], rechargeRecords = [] } = req.body;
  
  console.log('收到数据迁移请求:', {
    userList: userList.length,
    agentList: agentList.length,
    dataLibrary: dataLibrary.length,
    orderList: orderList.length,
    rechargeRecords: rechargeRecords.length
  });
  
  try {
    // 模拟数据迁移过程
    let migrationStats = {
      users: { total: userList.length, success: 0, failed: 0 },
      agents: { total: agentList.length, success: 0, failed: 0 },
      dataLibrary: { total: dataLibrary.length, success: 0, failed: 0 },
      orders: { total: orderList.length, success: 0, failed: 0 },
      rechargeRecords: { total: rechargeRecords.length, success: 0, failed: 0 }
    };
    
    // 迁移用户数据
    userList.forEach((userData, index) => {
      const newUser = {
        id: mockDB.users.length + index + 1,
        ...userData,
        create_time: userData.createTime || Date.now()
      };
      mockDB.users.push(newUser);
      migrationStats.users.success++;
    });
    
    // 迁移代理数据
    agentList.forEach((agentData, index) => {
      const newAgent = {
        id: mockDB.agents.length + index + 1,
        ...agentData,
        create_time: agentData.createTime || Date.now()
      };
      mockDB.agents.push(newAgent);
      migrationStats.agents.success++;
    });
    
    // 迁移数据列表
    dataLibrary.forEach((dataItem, index) => {
      const newData = {
        id: mockDB.dataLibrary.length + index + 1,
        ...dataItem,
        create_time: dataItem.createTime || Date.now()
      };
      mockDB.dataLibrary.push(newData);
      migrationStats.dataLibrary.success++;
    });
    
    // 迁移订单数据
    orderList.forEach((orderData, index) => {
      const newOrder = {
        id: mockDB.orders.length + index + 1,
        ...orderData,
        create_time: orderData.createTime || Date.now()
      };
      mockDB.orders.push(newOrder);
      migrationStats.orders.success++;
    });
    
    // 迁移充值记录
    rechargeRecords.forEach((rechargeData, index) => {
      const newRecharge = {
        id: mockDB.rechargeRecords.length + index + 1,
        ...rechargeData,
        create_time: rechargeData.createTime || Date.now()
      };
      mockDB.rechargeRecords.push(newRecharge);
      migrationStats.rechargeRecords.success++;
    });
    
    res.json({
      success: true,
      message: '数据迁移完成（模拟）',
      statistics: migrationStats,
      totalRecords: Object.values(migrationStats).reduce((sum, stat) => sum + stat.success, 0)
    });
    
  } catch (error) {
    console.error('迁移失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取用户列表
app.get('/api/users', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  
  res.json({
    success: true,
    data: mockDB.users.slice(start, end),
    total: mockDB.users.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

// 创建用户
app.post('/api/users', (req, res) => {
  const newUser = {
    id: mockDB.users.length + 1,
    ...req.body,
    create_time: Date.now(),
    status: 1
  };
  
  mockDB.users.push(newUser);
  
  res.json({
    success: true,
    data: newUser,
    message: '用户创建成功'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 测试服务器启动成功');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: 测试模式 (内存存储)`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 数据库测试: http://localhost:${PORT}/api/migrate/test-connection`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});