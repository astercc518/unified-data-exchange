/**
 * Vue Element Admin - MariaDB 后端服务器
 * 使用 MariaDB 作为永久存储
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MariaDB 连接配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'vue_admin_user',
  password: 'vue_admin_2024',
  database: 'vue_admin',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== 健康检查 ====================
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({
      status: 'ok',
      database: 'MariaDB',
      version: '5.5.68',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 带 /dev-api 前缀的健康检查
app.get('/dev-api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({
      status: 'ok',
      database: 'MariaDB',
      version: '5.5.68',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ==================== 系统统计 API ====================

// 获取系统统计信息（用于服务状态监控）
const getSystemStats = async (req, res) => {
  try {
    // 统计各类数据总数
    const [userResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [agentResult] = await pool.execute('SELECT COUNT(*) as count FROM agents');
    const [dataResult] = await pool.execute('SELECT COUNT(*) as count FROM data_library');
    const [orderResult] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    const [rechargeResult] = await pool.execute('SELECT COUNT(*) as count FROM recharge_records');
    
    res.json({
      success: true,
      data: {
        database: 'vue_admin',
        type: 'MariaDB',
        version: '5.5.68',
        counts: {
          users: userResult[0].count,
          agents: agentResult[0].count,
          dataLibrary: dataResult[0].count,
          orders: orderResult[0].count,
          recharges: rechargeResult[0].count
        },
        status: 'connected'
      }
    });
  } catch (error) {
    console.error('获取系统统计失败:', error);
    res.json({
      success: false,
      message: '获取系统统计失败: ' + error.message
    });
  }
};

// 直接路径
app.get('/stats/system', getSystemStats);
app.get('/api/stats/system', getSystemStats);

// 带 /dev-api 前缀的路径
app.get('/dev-api/stats/system', getSystemStats);
app.get('/dev-api/api/stats/system', getSystemStats);

// ==================== 用户相关 API ====================

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE login_account = ? AND login_password = ? AND status = 1',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    const user = rows[0];
    const token = `${user.user_type}-${user.id}-${Date.now()}`;
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.login_account,
          name: user.customer_name,
          email: user.email,
          userType: user.user_type,
          balance: user.account_balance
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败: ' + error.message
    });
  }
});

// 获取用户信息
app.get('/api/auth/info', async (req, res) => {
  try {
    const token = req.headers['x-token'] || req.query.token;
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供token'
      });
    }
    
    // 从token中解析用户ID
    const [userType, userId] = token.split('-');
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND status = 1',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    const user = rows[0];
    
    res.json({
      code: 200,
      data: {
        id: user.id,
        username: user.login_account,
        name: user.customer_name,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
        balance: user.account_balance,
        status: user.status,
        roles: [user.user_type],
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败: ' + error.message
    });
  }
});

// 登出
app.post('/api/auth/logout', (req, res) => {
  res.json({
    code: 200,
    message: '登出成功'
  });
});

// ==================== 前端兼容路由 (vue-element-admin) ====================

// 登录 - 前端路径兼容
app.post('/dev-api/vue-element-admin/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE login_account = ? AND login_password = ? AND status = 1',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.json({
        code: 60204,
        message: '用户名或密码错误'
      });
    }
    
    const user = rows[0];
    const token = `${user.user_type}-${user.id}-${Date.now()}`;
    
    res.json({
      code: 20000,
      data: {
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.json({
      code: 50000,
      message: '登录失败: ' + error.message
    });
  }
});

// 获取用户信息 - 前端路径兼容
app.get('/dev-api/vue-element-admin/user/info', async (req, res) => {
  try {
    const token = req.headers['x-token'] || req.query.token;
    
    if (!token) {
      return res.json({
        code: 50008,
        message: 'Token is required'
      });
    }
    
    // 从token中解析用户ID
    const parts = token.split('-');
    const userType = parts[0];
    const userId = parts[1];
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND status = 1',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.json({
        code: 50008,
        message: 'Login failed, unable to get user details.'
      });
    }
    
    const user = rows[0];
    
    res.json({
      code: 20000,
      data: {
        roles: [user.user_type],
        introduction: `${user.user_type}: ${user.customer_name}`,
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: user.customer_name
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({
      code: 50000,
      message: '获取用户信息失败: ' + error.message
    });
  }
});

// 登出 - 前端路径兼容
app.post('/dev-api/vue-element-admin/user/logout', (req, res) => {
  res.json({
    code: 20000,
    data: 'success'
  });
});

// ==================== 直接路径支持 (不带 /dev-api 前缀) ====================

// 登录 - 直接路径
app.post('/vue-element-admin/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE login_account = ? AND login_password = ? AND status = 1',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.json({
        code: 60204,
        message: '用户名或密码错误'
      });
    }
    
    const user = rows[0];
    const token = `${user.user_type}-${user.id}-${Date.now()}`;
    
    res.json({
      code: 20000,
      data: {
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.json({
      code: 50000,
      message: '登录失败: ' + error.message
    });
  }
});

// 获取用户信息 - 直接路径
app.get('/vue-element-admin/user/info', async (req, res) => {
  try {
    const token = req.headers['x-token'] || req.query.token;
    
    if (!token) {
      return res.json({
        code: 50008,
        message: 'Token is required'
      });
    }
    
    // 从token中解析用户ID
    const parts = token.split('-');
    const userType = parts[0];
    const userId = parts[1];
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND status = 1',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.json({
        code: 50008,
        message: 'Login failed, unable to get user details.'
      });
    }
    
    const user = rows[0];
    
    res.json({
      code: 20000,
      data: {
        roles: [user.user_type],
        introduction: `${user.user_type}: ${user.customer_name}`,
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: user.customer_name
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({
      code: 50000,
      message: '获取用户信息失败: ' + error.message
    });
  }
});

// 登出 - 直接路径
app.post('/vue-element-admin/user/logout', (req, res) => {
  res.json({
    code: 20000,
    data: 'success'
  });
});

// ==================== 交易订单相关 API ====================

// 获取交易订单列表 - 直接路径
app.get('/vue-element-admin/transaction/list', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM orders ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM orders');
    
    // 转换数据格式以匹配前端期望
    const items = rows.map(row => ({
      order_no: row.order_no,
      price: row.amount,
      status: row.status === 'completed' ? 'success' : 'pending',
      timestamp: row.create_time
    }));
    
    res.json({
      code: 20000,
      data: {
        total: countResult[0].total,
        items: items
      }
    });
  } catch (error) {
    console.error('获取交易列表失败:', error);
    res.json({
      code: 50000,
      message: '获取交易列表失败: ' + error.message
    });
  }
});

// 获取交易订单列表 - 带前缀路径
app.get('/dev-api/vue-element-admin/transaction/list', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM orders ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM orders');
    
    // 转换数据格式以匹配前端期望
    const items = rows.map(row => ({
      order_no: row.order_no,
      price: row.amount,
      status: row.status === 'completed' ? 'success' : 'pending',
      timestamp: row.create_time
    }));
    
    res.json({
      code: 20000,
      data: {
        total: countResult[0].total,
        items: items
      }
    });
  } catch (error) {
    console.error('获取交易列表失败:', error);
    res.json({
      code: 50000,
      message: '获取交易列表失败: ' + error.message
    });
  }
});

// 用户搜索 API - 直接路径
app.get('/vue-element-admin/search/user', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.json({
        code: 20000,
        data: { items: [] }
      });
    }
    
    const [rows] = await pool.execute(
      'SELECT id, login_account, customer_name, email FROM users WHERE customer_name LIKE ? OR login_account LIKE ? LIMIT 20',
      [`%${name}%`, `%${name}%`]
    );
    
    const items = rows.map(row => ({
      id: row.id,
      name: row.customer_name,
      username: row.login_account,
      email: row.email
    }));
    
    res.json({
      code: 20000,
      data: { items }
    });
  } catch (error) {
    console.error('用户搜索失败:', error);
    res.json({
      code: 50000,
      message: '用户搜索失败: ' + error.message
    });
  }
});

// ==================== 统计数据 API ====================

// 获取Dashboard统计数据（支持两种路径）
const getDashboardStats = async (req, res) => {
  try {
    // 获取总数据量（从 data_library 表）
    const [dataResult] = await pool.execute(
      'SELECT COALESCE(SUM(record_count), 0) as totalData FROM data_library WHERE status = 1'
    );

    // 获取代理总数
    const [agentResult] = await pool.execute(
      'SELECT COUNT(*) as totalAgents FROM agents WHERE status = 1'
    );

    // 获取客户总数（除去 admin）
    const [customerResult] = await pool.execute(
      'SELECT COUNT(*) as totalCustomers FROM users WHERE status = 1 AND user_type != "admin"'
    );

    // 计算今日销售额
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();

    const [todaySalesResult] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as todaySales FROM orders WHERE status = "completed" AND create_time >= ?',
      [todayTimestamp]
    );

    const [todayRechargeResult] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as todayRecharge FROM recharge_records WHERE status = "success" AND create_time >= ?',
      [todayTimestamp]
    );

    // 计算本周销售额
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

    const [weekSalesResult] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as weekSales FROM orders WHERE status = "completed" AND create_time >= ?',
      [weekStart]
    );

    const [weekRechargeResult] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as weekRecharge FROM recharge_records WHERE status = "success" AND create_time >= ?',
      [weekStart]
    );

    // 计算本月销售额
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthTimestamp = monthStart.getTime();

    const [monthSalesResult] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as monthSales FROM orders WHERE status = "completed" AND create_time >= ?',
      [monthTimestamp]
    );

    const [monthRechargeResult] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as monthRecharge FROM recharge_records WHERE status = "success" AND create_time >= ?',
      [monthTimestamp]
    );

    res.json({
      code: 20000,
      data: {
        totalData: parseInt(dataResult[0].totalData) || 0,
        totalAgents: parseInt(agentResult[0].totalAgents) || 0,
        totalCustomers: parseInt(customerResult[0].totalCustomers) || 0,
        todaySales: (parseFloat(todaySalesResult[0].todaySales) || 0) + (parseFloat(todayRechargeResult[0].todayRecharge) || 0),
        weekSales: (parseFloat(weekSalesResult[0].weekSales) || 0) + (parseFloat(weekRechargeResult[0].weekRecharge) || 0),
        monthSales: (parseFloat(monthSalesResult[0].monthSales) || 0) + (parseFloat(monthRechargeResult[0].monthRecharge) || 0)
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.json({
      code: 50000,
      message: '获取统计数据失败: ' + error.message
    });
  }
};

// 直接路径
app.get('/vue-element-admin/statistics/dashboard', getDashboardStats);
// 带 /dev-api 前缀的路径（用于代理模式）
app.get('/dev-api/vue-element-admin/statistics/dashboard', getDashboardStats);

// 获取用户列表
app.get('/api/users/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, userType } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM users';
    let countSql = 'SELECT COUNT(*) as total FROM users';
    const params = [];
    const countParams = [];
    
    if (userType) {
      sql += ' WHERE user_type = ?';
      countSql += ' WHERE user_type = ?';
      params.push(userType);
      countParams.push(userType);
    }
    
    sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(sql, params);
    const [countResult] = await pool.execute(countSql, countParams);
    
    res.json({
      code: 200,
      data: {
        items: rows,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败: ' + error.message
    });
  }
});

// 创建用户
app.post('/api/users/create', async (req, res) => {
  try {
    const userData = req.body;
    const createTime = Date.now();
    
    const [result] = await pool.execute(
      `INSERT INTO users (login_account, login_password, customer_name, email, phone, 
       account_balance, status, user_type, create_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.loginAccount,
        userData.loginPassword,
        userData.customerName,
        userData.email || null,
        userData.phone || null,
        userData.accountBalance || 0,
        userData.status !== undefined ? userData.status : 1,
        userData.userType || 'user',
        createTime
      ]
    );
    
    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId,
        ...userData,
        createTime
      }
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建用户失败: ' + error.message
    });
  }
});

// 更新用户
app.put('/api/users/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updateTime = Date.now();
    
    const updateFields = [];
    const params = [];
    
    if (userData.customerName !== undefined) {
      updateFields.push('customer_name = ?');
      params.push(userData.customerName);
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(userData.phone);
    }
    if (userData.accountBalance !== undefined) {
      updateFields.push('account_balance = ?');
      params.push(userData.accountBalance);
    }
    if (userData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(userData.status);
    }
    if (userData.loginPassword !== undefined) {
      updateFields.push('login_password = ?');
      params.push(userData.loginPassword);
    }
    
    updateFields.push('update_time = ?');
    params.push(updateTime);
    params.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户失败: ' + error.message
    });
  }
});

// 删除用户
app.delete('/api/users/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除用户失败: ' + error.message
    });
  }
});

// ==================== 代理商相关 API ====================

// 获取代理商列表
app.get('/api/agents/list', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM agents ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM agents');
    
    res.json({
      code: 200,
      data: {
        items: rows,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取代理商列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取代理商列表失败: ' + error.message
    });
  }
});

// 创建代理商
app.post('/api/agents/create', async (req, res) => {
  try {
    const agentData = req.body;
    const createTime = Date.now();
    
    const [result] = await pool.execute(
      `INSERT INTO agents (agent_name, contact_person, phone, email, address, status, create_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        agentData.agentName,
        agentData.contactPerson || null,
        agentData.phone || null,
        agentData.email || null,
        agentData.address || null,
        agentData.status !== undefined ? agentData.status : 1,
        createTime
      ]
    );
    
    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId,
        ...agentData,
        createTime
      }
    });
  } catch (error) {
    console.error('创建代理商失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建代理商失败: ' + error.message
    });
  }
});

// 更新代理商
app.put('/api/agents/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agentData = req.body;
    const updateTime = Date.now();
    
    const updateFields = [];
    const params = [];
    
    if (agentData.agentName !== undefined) {
      updateFields.push('agent_name = ?');
      params.push(agentData.agentName);
    }
    if (agentData.contactPerson !== undefined) {
      updateFields.push('contact_person = ?');
      params.push(agentData.contactPerson);
    }
    if (agentData.phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(agentData.phone);
    }
    if (agentData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(agentData.email);
    }
    if (agentData.address !== undefined) {
      updateFields.push('address = ?');
      params.push(agentData.address);
    }
    if (agentData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(agentData.status);
    }
    
    updateFields.push('update_time = ?');
    params.push(updateTime);
    params.push(id);
    
    await pool.execute(
      `UPDATE agents SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新代理商失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新代理商失败: ' + error.message
    });
  }
});

// 删除代理商
app.delete('/api/agents/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM agents WHERE id = ?', [id]);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除代理商失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除代理商失败: ' + error.message
    });
  }
});

// ==================== 数据库相关 API ====================

// 获取数据库列表
app.get('/api/data-library/list', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM data_library ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM data_library');
    
    res.json({
      code: 200,
      data: {
        items: rows,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取数据库列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取数据库列表失败: ' + error.message
    });
  }
});

// 创建数据库记录
app.post('/api/data-library/create', async (req, res) => {
  try {
    const data = req.body;
    const createTime = Date.now();
    
    const [result] = await pool.execute(
      `INSERT INTO data_library (name, type, description, record_count, status, create_time) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.type || null,
        data.description || null,
        data.recordCount || 0,
        data.status !== undefined ? data.status : 1,
        createTime
      ]
    );
    
    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId,
        ...data,
        createTime
      }
    });
  } catch (error) {
    console.error('创建数据库记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建数据库记录失败: ' + error.message
    });
  }
});

// ==================== 订单相关 API ====================

// 获取订单列表
app.get('/api/orders/list', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM orders ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM orders');
    
    res.json({
      code: 200,
      data: {
        items: rows,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败: ' + error.message
    });
  }
});

// ==================== 充值记录相关 API ====================

// 获取充值记录列表
app.get('/api/recharge-records/list', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM recharge_records ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM recharge_records');
    
    res.json({
      code: 200,
      data: {
        items: rows,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取充值记录列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取充值记录列表失败: ' + error.message
    });
  }
});

// ==================== 反馈相关 API ====================

// 获取反馈列表
app.get('/api/feedbacks/list', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM feedbacks ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM feedbacks');
    
    res.json({
      code: 200,
      data: {
        items: rows,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取反馈列表失败: ' + error.message
    });
  }
});

// 获取最近反馈（用于客户首页）
app.get('/vue-element-admin/feedback/recent', async (req, res) => {
  try {
    const { customerId, limit = 5 } = req.query;
    
    let sql = 'SELECT * FROM feedbacks';
    const params = [];
    
    if (customerId) {
      sql += ' WHERE user_id = ?';
      params.push(parseInt(customerId));
    }
    
    sql += ' ORDER BY create_time DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      code: 20000,
      data: rows
    });
  } catch (error) {
    console.error('获取最近反馈失败:', error);
    res.json({
      code: 50000,
      message: '获取最近反馈失败: ' + error.message
    });
  }
});

// 带 /dev-api 前缀的反馈路径
app.get('/dev-api/vue-element-admin/feedback/recent', async (req, res) => {
  try {
    const { customerId, limit = 5 } = req.query;
    
    let sql = 'SELECT * FROM feedbacks';
    const params = [];
    
    if (customerId) {
      sql += ' WHERE user_id = ?';
      params.push(parseInt(customerId));
    }
    
    sql += ' ORDER BY create_time DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      code: 20000,
      data: rows
    });
  } catch (error) {
    console.error('获取最近反馈失败:', error);
    res.json({
      code: 50000,
      message: '获取最近反馈失败: ' + error.message
    });
  }
});

// ==================== 数据迁移 API ====================

// 测试数据库连接
app.get('/api/migrate/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    
    const [tables] = await connection.execute('SHOW TABLES');
    
    connection.release();
    
    res.json({
      code: 200,
      message: '数据库连接成功',
      data: {
        status: 'connected',
        database: 'vue_admin',
        tables: tables.map(t => Object.values(t)[0])
      }
    });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({
      code: 500,
      message: '数据库连接失败: ' + error.message
    });
  }
});

// 批量导入用户
app.post('/api/migrate/users', async (req, res) => {
  try {
    const users = req.body.users || [];
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.json({
        code: 200,
        message: '没有需要导入的用户数据',
        data: { imported: 0 }
      });
    }
    
    let imported = 0;
    
    for (const user of users) {
      try {
        await pool.execute(
          `INSERT INTO users (login_account, login_password, customer_name, email, phone, 
           account_balance, status, user_type, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           customer_name = VALUES(customer_name),
           email = VALUES(email),
           phone = VALUES(phone),
           account_balance = VALUES(account_balance),
           status = VALUES(status),
           update_time = ?`,
          [
            user.loginAccount,
            user.loginPassword,
            user.customerName,
            user.email || null,
            user.phone || null,
            user.accountBalance || 0,
            user.status !== undefined ? user.status : 1,
            user.userType || 'user',
            user.createTime || Date.now(),
            Date.now()
          ]
        );
        imported++;
      } catch (err) {
        console.error('导入用户失败:', user.loginAccount, err.message);
      }
    }
    
    res.json({
      code: 200,
      message: `成功导入 ${imported} 条用户数据`,
      data: { imported }
    });
  } catch (error) {
    console.error('批量导入用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量导入用户失败: ' + error.message
    });
  }
});

// 批量导入其他数据（代理商、订单等）
app.post('/api/migrate/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const data = req.body.data || [];
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.json({
        code: 200,
        message: `没有需要导入的${tableName}数据`,
        data: { imported: 0 }
      });
    }
    
    // 这里可以根据不同的表名执行不同的导入逻辑
    res.json({
      code: 200,
      message: `${tableName} 数据迁移功能待实现`,
      data: { imported: 0 }
    });
  } catch (error) {
    console.error('批量导入数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量导入数据失败: ' + error.message
    });
  }
});

// ==================== 启动服务器 ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n🚀 MariaDB 后端服务器启动成功');
  console.log('==========================================');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`💾 数据库: MariaDB 5.5.68`);
  console.log(`🗄️  数据库名: vue_admin`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 连接测试: http://localhost:${PORT}/api/migrate/test-connection`);
  console.log('==========================================');
  console.log('✅ 数据将永久保存到 MariaDB 数据库');
  console.log('✅ 支持完整的 CRUD 操作');
  console.log('✅ 支持数据迁移功能');
  console.log('==========================================\n');
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  await pool.end();
  process.exit(0);
});
