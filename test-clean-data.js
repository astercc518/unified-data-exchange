/**
 * 测试一键清洗功能的智能校验国码逻辑
 */

// 模拟测试数据
const testData = '84902712535'; // 11位，前2位是84
const countryCode = '84'; // 越南国码

console.log('=== 测试智能校验国码逻辑 ===\n');
console.log('原始数据:', testData);
console.log('国码:', countryCode);
console.log('国码长度:', countryCode.length);

// 模拟步骤3的逻辑
const codeLength = countryCode.length;
const prefix = testData.substring(0, codeLength);

console.log('\n--- 检查逻辑 ---');
console.log('提取前缀:', prefix);
console.log('前缀长度:', prefix.length);
console.log('前缀 === 国码:', prefix === countryCode);
console.log('前缀类型:', typeof prefix);
console.log('国码类型:', typeof countryCode);

// 判断结果
if (prefix === countryCode) {
  console.log('\n✅ 结果: 已有国码，跳过不添加');
  console.log('处理后数据:', testData);
} else {
  console.log('\n❌ 结果: 没有国码，添加国码');
  console.log('处理后数据:', countryCode + testData);
}

// 测试其他数据
console.log('\n\n=== 测试其他数据 ===\n');

const testCases = [
  { data: '84902712535', desc: '11位，前2位是84（应该跳过）' },
  { data: '902712535', desc: '9位，前2位是90（应该添加）' },
  { data: '8490271253', desc: '10位，前2位是84（应该添加？）' },
  { data: '849027125356', desc: '12位，前2位是84（应该跳过）' }
];

testCases.forEach((testCase, index) => {
  const prefix = testCase.data.substring(0, 2);
  const shouldSkip = prefix === '84';
  const result = shouldSkip ? testCase.data : '84' + testCase.data;
  
  console.log(`${index + 1}. ${testCase.desc}`);
  console.log(`   原数据: ${testCase.data} (${testCase.data.length}位)`);
  console.log(`   前缀: ${prefix}`);
  console.log(`   处理: ${shouldSkip ? '跳过' : '添加'}`);
  console.log(`   结果: ${result}\n`);
});
