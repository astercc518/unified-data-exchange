/**
 * 数据库配置示例
 * 
 * 使用说明：
 * 1. 复制此文件为 database.js
 * 2. 修改下面的配置信息
 * 3. 确保 MySQL 服务已启动
 * 4. 确保数据库已创建（或运行 init-database.js 自动创建）
 * 
 * 命令示例：
 * cp database.example.js database.js
 * vim database.js
 */

module.exports = {
  // 数据库主机地址
  host: 'localhost',
  
  // 数据库端口
  port: 3306,
  
  // 数据库名称
  database: 'vue_admin',
  
  // 数据库用户名
  username: 'root',
  
  // 数据库密码（请修改为您的实际密码）
  password: 'your_password_here',
  
  // 数据库类型
  dialect: 'mysql',
  
  // 时区设置
  timezone: '+08:00',
  
  // 是否打印 SQL 日志（开发环境可设为 true）
  logging: false,
  
  // 连接池配置
  pool: {
    // 最大连接数
    max: 20,
    
    // 最小连接数
    min: 2,
    
    // 获取连接超时时间（毫秒）
    acquire: 60000,
    
    // 连接空闲超时时间（毫秒）
    idle: 30000,
    
    // 连接回收时间（毫秒）
    evict: 60000
  }
};
