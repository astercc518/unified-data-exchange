/**
 * 数据验证工具
 */

/**
 * 验证迁移数据格式
 */
function validateMigrationData(data) {
  const errors = [];
  
  // 验证数据结构
  if (!data || typeof data !== 'object') {
    errors.push('数据格式错误');
    return { valid: false, errors };
  }
  
  // 验证各个数据集
  const requiredFields = ['userList', 'agentList', 'dataLibrary', 'orderList', 'rechargeRecords'];
  
  requiredFields.forEach(field => {
    if (!Array.isArray(data[field])) {
      errors.push(`${field} 必须是数组`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateMigrationData
};