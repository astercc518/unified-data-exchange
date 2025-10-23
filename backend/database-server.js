/**
 * JSON 文件数据库服务器
 * 使用 JSON 文件实现真正的数据持久化
 * 无需外部数据库依赖
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库文件路径
const DB_DIR = path.join(__dirname, 'data');
const DB_FILES = {
  users: path.join(DB_DIR, 'users.json'),
  agents: path.join(DB_DIR, 'agents.json'),
  dataLibrary: path.join(DB_DIR, 'data_library.json'),
  orders: path.join(DB_DIR, 'orders.json'),
  rechargeRecords: path.join(DB_DIR, 'recharge_records.json'),
  feedbacks: path.join(DB_DIR, 'feedbacks.json')
};

// 确保数据目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log('✅ 数据目录已创建:', DB_DIR);
}

// 初始化数据库文件
function initDatabase() {
  Object.entries(DB_FILES).forEach(([key, filePath]) => {
    if (!fs.existsSync(filePath)) {
      const initialData = key === 'users' ? [
        {
          id: 1,
          login_account: 'admin',
          login_password: '111111',
          customer_name: '系统管理员',
          email: 'admin@system.com',
          account_balance: 10000.00,
          status: 1,
          create_time: Date.now()
        }
      ] : [];
      
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      console.log(`✅ 初始化数据文件: ${key}`);
    }
  });
}

// 读取数据
function readData(tableName) {
  try {
    const filePath = DB_FILES[tableName];
    if (!filePath || !fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取数据失败 [${tableName}]:`, error);
    return [];
  }
}

// 写入数据（带备份）
function writeData(tableName, data) {
  try {
    const filePath = DB_FILES[tableName];
    if (!filePath) {
      throw new Error(`未知的表名: ${tableName}`);
    }
    
    // 创建备份
    if (fs.existsSync(filePath)) {
      const backupPath = filePath + '.backup';
      fs.copyFileSync(filePath, backupPath);
    }
    
    // 写入新数据
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ 数据已保存: ${tableName} (${data.length} 条)`);
    return true;
  } catch (error) {
    console.error(`写入数据失败 [${tableName}]:`, error);
    return false;
  }
}

// 初始化数据库
initDatabase();

// 中间件配置
app.use(cors({
  origin: ['http://localhost:9528', 'http://localhost:9529'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'production',
    database: 'json-file',
    storage: DB_DIR,
    message: 'JSON 文件数据库运行正常'
  });
});

// 数据库连接测试接口
app.get('/api/migrate/test-connection', (req, res) => {
  const statistics = {};
  Object.keys(DB_FILES).forEach(key => {
    const data = readData(key);
    statistics[key] = data.length;
  });
  
  res.json({
    success: true,
    message: 'JSON 文件数据库连接成功',
    database: 'json-file',
    storage: DB_DIR,
    tables: Object.keys(DB_FILES),
    statistics
  });
});

// 认证接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('登录尝试:', { username });
  
  // 检查客户
  const users = readData('users');
  let user = users.find(u => 
    u.login_account === username && 
    u.login_password === password && 
    u.status === 1
  );
  
  let userType = 'customer';
  
  // 检查代理
  if (!user) {
    const agents = readData('agents');
    user = agents.find(a => 
      a.login_account === username && 
      a.login_password === password && 
      a.status === 1
    );
    userType = 'agent';
  }
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: '用户名或密码错误'
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
    const users = readData('users');
    user = users.find(u => u.id === userId);
  } else if (userType === 'agent') {
    const agents = readData('agents');
    user = agents.find(a => a.id === userId);
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
    let migrationStats = {
      users: { total: userList.length, success: 0, failed: 0 },
      agents: { total: agentList.length, success: 0, failed: 0 },
      dataLibrary: { total: dataLibrary.length, success: 0, failed: 0 },
      orders: { total: orderList.length, success: 0, failed: 0 },
      rechargeRecords: { total: rechargeRecords.length, success: 0, failed: 0 }
    };
    
    // 读取现有数据
    const existingUsers = readData('users');
    const existingAgents = readData('agents');
    const existingData = readData('dataLibrary');
    const existingOrders = readData('orders');
    const existingRecharges = readData('rechargeRecords');
    
    // 合并新数据（避免重复ID）
    const maxUserId = existingUsers.length > 0 ? Math.max(...existingUsers.map(u => u.id)) : 0;
    const maxAgentId = existingAgents.length > 0 ? Math.max(...existingAgents.map(a => a.id)) : 0;
    const maxDataId = existingData.length > 0 ? Math.max(...existingData.map(d => d.id)) : 0;
    const maxOrderId = existingOrders.length > 0 ? Math.max(...existingOrders.map(o => o.id)) : 0;
    const maxRechargeId = existingRecharges.length > 0 ? Math.max(...existingRecharges.map(r => r.id)) : 0;
    
    // 处理用户数据
    userList.forEach((user, index) => {
      const newUser = {
        ...user,
        id: user.id || (maxUserId + index + 1),
        create_time: user.createTime || user.create_time || Date.now()
      };
      existingUsers.push(newUser);
      migrationStats.users.success++;
    });
    
    // 处理代理数据
    agentList.forEach((agent, index) => {
      const newAgent = {
        ...agent,
        id: agent.id || (maxAgentId + index + 1),
        create_time: agent.createTime || agent.create_time || Date.now()
      };
      existingAgents.push(newAgent);
      migrationStats.agents.success++;
    });
    
    // 处理数据库数据
    dataLibrary.forEach((data, index) => {
      const newData = {
        ...data,
        id: data.id || (maxDataId + index + 1),
        create_time: data.createTime || data.create_time || Date.now()
      };
      existingData.push(newData);
      migrationStats.dataLibrary.success++;
    });
    
    // 处理订单数据
    orderList.forEach((order, index) => {
      const newOrder = {
        ...order,
        id: order.id || (maxOrderId + index + 1),
        create_time: order.createTime || order.create_time || Date.now()
      };
      existingOrders.push(newOrder);
      migrationStats.orders.success++;
    });
    
    // 处理充值记录
    rechargeRecords.forEach((recharge, index) => {
      const newRecharge = {
        ...recharge,
        id: recharge.id || (maxRechargeId + index + 1),
        create_time: recharge.createTime || recharge.create_time || Date.now()
      };
      existingRecharges.push(newRecharge);
      migrationStats.rechargeRecords.success++;
    });
    
    // 保存所有数据到文件
    writeData('users', existingUsers);
    writeData('agents', existingAgents);
    writeData('dataLibrary', existingData);
    writeData('orders', existingOrders);
    writeData('rechargeRecords', existingRecharges);
    
    const totalRecords = Object.values(migrationStats).reduce((sum, stat) => sum + stat.success, 0);
    
    res.json({
      success: true,
      message: `数据迁移完成，共 ${totalRecords} 条记录已永久保存到文件`,
      statistics: migrationStats,
      totalRecords,
      storage: DB_DIR
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
  const users = readData('users');
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  
  res.json({
    success: true,
    data: users.slice(start, end),
    total: users.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

// 创建用户
app.post('/api/users', (req, res) => {
  const users = readData('users');
  const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
  
  const newUser = {
    id: maxId + 1,
    ...req.body,
    create_time: Date.now(),
    status: 1
  };
  
  users.push(newUser);
  writeData('users', users);
  
  res.json({
    success: true,
    data: newUser,
    message: '用户创建成功'
  });
});

// 更新用户
app.put('/api/users/:id', (req, res) => {
  const users = readData('users');
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }
  
  users[index] = {
    ...users[index],
    ...req.body,
    id: userId,
    update_time: Date.now()
  };
  
  writeData('users', users);
  
  res.json({
    success: true,
    data: users[index],
    message: '用户更新成功'
  });
});

// 删除用户
app.delete('/api/users/:id', (req, res) => {
  const users = readData('users');
  const userId = parseInt(req.params.id);
  const newUsers = users.filter(u => u.id !== userId);
  
  if (newUsers.length === users.length) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }
  
  writeData('users', newUsers);
  
  res.json({
    success: true,
    message: '用户删除成功'
  });
});

// 通用 CRUD 接口
['agents', 'dataLibrary', 'orders', 'rechargeRecords', 'feedbacks'].forEach(tableName => {
  // 获取列表
  app.get(`/api/${tableName}`, (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const data = readData(tableName);
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    
    res.json({
      success: true,
      data: data.slice(start, end),
      total: data.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  });
  
  // 创建记录
  app.post(`/api/${tableName}`, (req, res) => {
    const data = readData(tableName);
    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) : 0;
    
    const newItem = {
      id: maxId + 1,
      ...req.body,
      create_time: Date.now()
    };
    
    data.push(newItem);
    writeData(tableName, data);
    
    res.json({
      success: true,
      data: newItem,
      message: '创建成功'
    });
  });
  
  // 更新记录
  app.put(`/api/${tableName}/:id`, (req, res) => {
    const data = readData(tableName);
    const itemId = parseInt(req.params.id);
    const index = data.findIndex(item => item.id === itemId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    
    data[index] = {
      ...data[index],
      ...req.body,
      id: itemId,
      update_time: Date.now()
    };
    
    writeData(tableName, data);
    
    res.json({
      success: true,
      data: data[index],
      message: '更新成功'
    });
  });
  
  // 删除记录
  app.delete(`/api/${tableName}/:id`, (req, res) => {
    const data = readData(tableName);
    const itemId = parseInt(req.params.id);
    const newData = data.filter(item => item.id !== itemId);
    
    if (newData.length === data.length) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    
    writeData(tableName, newData);
    
    res.json({
      success: true,
      message: '删除成功'
    });
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

// 错误处理
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: error.message || '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 JSON 文件数据库服务器启动成功');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`💾 数据存储: ${DB_DIR}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 数据库测试: http://localhost:${PORT}/api/migrate/test-connection`);
  console.log('');
  console.log('✅ 数据将永久保存到 JSON 文件');
  console.log('✅ 重启服务器后数据不会丢失');
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
