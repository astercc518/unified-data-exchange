/**
 * 测试共享号段国家标记
 * 验证10个无法区分的国家是否正确标记了sharedSegments: true
 */

const { operatorData } = require('../src/data/operators.js');

console.log('========== 共享号段国家检测测试 ==========\n');

// 应该被标记为sharedSegments的国家列表
const sharedSegmentsCountries = [
  'SG',  // 新加坡
  'JP',  // 日本
  'FR',  // 法国
  'ES',  // 西班牙
  'NL',  // 荷兰
  'GR',  // 希腊
  'PE',  // 秘鲁
  'CL',  // 智利
  'EC',  // 厄瓜多尔
  'AU'   // 澳大利亚
];

const countryNames = {
  'SG': '新加坡',
  'JP': '日本',
  'FR': '法国',
  'ES': '西班牙',
  'NL': '荷兰',
  'GR': '希腊',
  'PE': '秘鲁',
  'CL': '智利',
  'EC': '厄瓜多尔',
  'AU': '澳大利亚'
};

let successCount = 0;
let failCount = 0;

console.log('检查10个共享号段国家的标记情况：\n');

sharedSegmentsCountries.forEach((code, index) => {
  const countryData = operatorData[code];
  const name = countryNames[code];
  
  if (!countryData) {
    console.log(`${index + 1}. ❌ ${name} (${code}) - 国家数据不存在`);
    failCount++;
    return;
  }

  const hasSharedFlag = countryData.sharedSegments === true;
  const operators = countryData.operators || [];
  
  if (hasSharedFlag) {
    console.log(`${index + 1}. ✅ ${name} (${code}) - 已正确标记`);
    console.log(`   运营商数量: ${operators.length}`);
    
    // 检查是否所有运营商共享相同号段
    if (operators.length > 0) {
      const firstSegments = JSON.stringify(operators[0].numberSegments);
      const allSame = operators.every(op => JSON.stringify(op.numberSegments) === firstSegments);
      
      if (allSame) {
        console.log(`   号段情况: ✓ 所有运营商共享相同号段 ${firstSegments}`);
      } else {
        console.log(`   号段情况: ⚠ 运营商号段不完全相同（可能部分共享）`);
      }
    }
    
    successCount++;
  } else {
    console.log(`${index + 1}. ❌ ${name} (${code}) - 未标记sharedSegments`);
    failCount++;
  }
  
  console.log('');
});

console.log('========== 测试结果 ==========\n');
console.log(`✅ 正确标记: ${successCount}个`);
console.log(`❌ 未标记: ${failCount}个`);
console.log(`📊 成功率: ${((successCount / sharedSegmentsCountries.length) * 100).toFixed(1)}%`);

if (successCount === sharedSegmentsCountries.length) {
  console.log('\n🎉 所有共享号段国家均已正确标记！');
} else {
  console.log('\n⚠️  仍有国家需要标记sharedSegments: true');
}

console.log('\n========== 详细案例 ==========\n');

// 显示几个典型案例
const showcaseCountries = ['SG', 'JP', 'FR'];

showcaseCountries.forEach(code => {
  const countryData = operatorData[code];
  const name = countryNames[code];
  
  console.log(`${name} (${code}):`);
  console.log(`  sharedSegments: ${countryData.sharedSegments}`);
  console.log(`  运营商列表:`);
  
  countryData.operators.forEach(op => {
    console.log(`    - ${op.name}: ${JSON.stringify(op.numberSegments)}`);
  });
  
  console.log('');
});
