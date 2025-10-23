/**
 * 数据库迁移脚本：为 customer_data_files 表添加 customer_name 字段
 * 执行方式：node migrations/add_customer_name_to_files.js
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'vue_admin_user',
  password: 'vue_admin_2024',
  database: 'vue_admin'
};

async function migrate() {
  let connection;
  
  try {
    console.log('🔄 开始数据库迁移...');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查字段是否已存在
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM customer_data_files LIKE 'customer_name'`
    );
    
    if (columns.length > 0) {
      console.log('⚠️  字段 customer_name 已存在，跳过创建');
      return;
    }
    
    // 添加 customer_name 字段
    console.log('📝 添加 customer_name 字段...');
    await connection.query(`
      ALTER TABLE customer_data_files 
      ADD COLUMN customer_name VARCHAR(100) NULL COMMENT '客户名称/上传用户'
      AFTER customer_account
    `);
    console.log('✅ 字段添加成功');
    
    // 从现有数据中填充 customer_name
    console.log('📝 填充现有数据的 customer_name...');
    
    // 获取所有文件记录
    const [files] = await connection.query(
      `SELECT id, customer_id FROM customer_data_files WHERE customer_name IS NULL`
    );
    
    console.log(`📊 找到 ${files.length} 条需要更新的记录`);
    
    // 批量更新
    for (const file of files) {
      // 查询用户信息
      const [users] = await connection.query(
        `SELECT customer_name FROM users WHERE id = ?`,
        [file.customer_id]
      );
      
      if (users.length > 0 && users[0].customer_name) {
        await connection.query(
          `UPDATE customer_data_files SET customer_name = ? WHERE id = ?`,
          [users[0].customer_name, file.id]
        );
      } else {
        // 如果是代理上传的，查询代理表
        const [agents] = await connection.query(
          `SELECT agent_name FROM agents WHERE id = ?`,
          [file.customer_id]
        );
        
        if (agents.length > 0 && agents[0].agent_name) {
          await connection.query(
            `UPDATE customer_data_files SET customer_name = ? WHERE id = ?`,
            [agents[0].agent_name, file.id]
          );
        }
      }
    }
    
    console.log('✅ 数据填充完成');
    console.log('🎉 数据库迁移成功完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('📪 数据库连接已关闭');
    }
  }
}

// 执行迁移
migrate()
  .then(() => {
    console.log('\n✅ 迁移脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 迁移脚本执行失败:', error);
    process.exit(1);
  });
