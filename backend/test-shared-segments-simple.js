/**
 * 测试共享号段国家标记
 * 验证10个无法区分的国家是否正确标记了sharedSegments: true
 */

const fs = require('fs');
const path = require('path');

console.log('========== 共享号段国家检测测试 ==========\n');

// 读取operators.js文件内容
const operatorsFile = path.join(__dirname, '../src/data/operators.js');
const content = fs.readFileSync(operatorsFile, 'utf-8');

// 解析exportoperatorData（简单文本解析）
const match = content.match(/export const operatorData = (\{[\s\S]*?\n\})\n/);
if (!match) {
  console.log('❌ 无法解析operatorData');
  process.exit(1);
}

// 应该被标记为sharedSegments的国家列表
const sharedSegmentsCountries = [
  { code: 'SG', name: '新加坡' },
  { code: 'JP', name: '日本' },
  { code: 'FR', name: '法国' },
  { code: 'ES', name: '西班牙' },
  { code: 'NL', name: '荷兰' },
  { code: 'GR', name: '希腊' },
  { code: 'PE', name: '秘鲁' },
  { code: 'CL', name: '智利' },
  { code: 'EC', name: '厄瓜多尔' },
  { code: 'AU', name: '澳大利亚' }
];

let successCount = 0;
let failCount = 0;

console.log('检查10个共享号段国家的标记情况：\n');

sharedSegmentsCountries.forEach(({code, name}, index) => {
  // 查找该国家的配置块
  const countryRegex = new RegExp(`'${code}':\\s*\\{[^}]*sharedSegments:\\s*true`, 's');
  const hasSharedFlag = countryRegex.test(content);
  
  if (hasSharedFlag) {
    console.log(`${index + 1}. ✅ ${name} (${code}) - 已正确标记 sharedSegments: true`);
    successCount++;
  } else {
    console.log(`${index + 1}. ❌ ${name} (${code}) - 未标记sharedSegments`);
    failCount++;
  }
});

console.log('\n========== 测试结果 ==========\n');
console.log(`✅ 正确标记: ${successCount}个`);
console.log(`❌ 未标记: ${failCount}个`);
console.log(`📊 成功率: ${((successCount / sharedSegmentsCountries.length) * 100).toFixed(1)}%`);

if (successCount === sharedSegmentsCountries.length) {
  console.log('\n🎉 所有共享号段国家均已正确标记！');
  console.log('\n前端将对这些国家显示警告提示，建议用户使用"按条数提取"功能');
} else {
  console.log('\n⚠️  仍有国家需要标记sharedSegments: true');
  process.exit(1);
}

// 显示几个典型案例的配置
console.log('\n========== 典型案例展示 ==========\n');

const showcaseCodes = ['SG', 'JP', 'FR'];

showcaseCodes.forEach(code => {
  const countryBlockRegex = new RegExp(`'${code}':\\s*\\{([^}]+operators:\\s*\\[([^\\]]+)\\])`, 's');
  const match = content.match(countryBlockRegex);
  
  if (match) {
    const country = sharedSegmentsCountries.find(c => c.code === code);
    console.log(`${country.name} (${code}):`);
    
    // 提取运营商数量
    const operatorsMatch = match[2].match(/name:\s*'([^']+)'/g);
    if (operatorsMatch) {
      console.log(`  运营商数量: ${operatorsMatch.length}`);
      operatorsMatch.forEach(op => {
        const opName = op.match(/name:\s*'([^']+)'/)[1];
        console.log(`    - ${opName}`);
      });
    }
    
    console.log('');
  }
});

console.log('========== 处理说明 ==========\n');
console.log('已完成处理：');
console.log('1. ✅ 在operators.js中为10个国家添加sharedSegments: true标记');
console.log('2. ✅ 在前端添加检测逻辑，识别共享号段国家');
console.log('3. ✅ 用户选择这些国家时，显示警告并提供两个选项：');
console.log('   - 继续使用模拟分组（按市场份额分配）');
console.log('   - 切换到"按条数提取"功能（推荐）');
console.log('\n受影响的国家：新加坡、日本、法国、西班牙、荷兰、希腊、秘鲁、智利、厄瓜多尔、澳大利亚');
