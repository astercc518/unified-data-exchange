/**
 * awesome-phonenumber 功能测试脚本
 */

const PhoneAnalyzer = require('./utils/phoneNumberAnalyzer');

console.log('========================================');
console.log('awesome-phonenumber 集成测试');
console.log('========================================\n');

// 测试数据
const testNumbers = [
  '12025551234',  // 美国华盛顿特区
  '13105552345',  // 美国洛杉矶
  '14155553456',  // 美国旧金山
  '8613800138000', // 中国
  '442071234567',  // 英国
  'invalid-number' // 无效号码
];

console.log('1. 测试单个号码解析\n');
testNumbers.forEach(number => {
  console.log(`号码: ${number}`);
  const result = PhoneAnalyzer.parsePhone(number);
  console.log('  有效:', result.valid);
  if (result.valid) {
    console.log('  E.164格式:', result.number.e164);
    console.log('  国际格式:', result.number.international);
    console.log('  国家代码:', result.regionCode);
    console.log('  国际区号:', result.countryCode);
    console.log('  号码类型:', result.type);
  } else {
    console.log('  错误:', result.error || '无效号码');
  }
  console.log('');
});

console.log('\n2. 测试美国号码批量分析\n');
const usNumbers = [
  '12025551234',
  '12025551235',
  '13105552341',
  '13105552342',
  '14155553451',
  '14155553452',
  '12125554561',
  '12125554562'
];

// 模拟运营商配置
const operators = [
  {
    name: 'Verizon',
    numberSegments: ['202', '212', '301', '410', '703']
  },
  {
    name: 'AT&T',
    numberSegments: ['310', '323', '408', '510', '650']
  },
  {
    name: 'T-Mobile',
    numberSegments: ['415', '510', '628', '650', '707']
  }
];

const usResult = PhoneAnalyzer.analyzeUSOperatorDistribution(usNumbers, operators);
console.log('总数:', usResult.totalCount);
console.log('有效:', usResult.validCount);
console.log('无效:', usResult.invalidCount);
console.log('未匹配:', usResult.unmatchedCount);
console.log('\n运营商分布:');
usResult.distribution.forEach(dist => {
  console.log(`  ${dist.name}: ${dist.count}条`);
  dist.numbers.slice(0, 2).forEach(num => {
    console.log(`    - ${num.formatted} (区号: ${num.areaCode})`);
  });
});

console.log('\n3. 测试混合国家号码分析\n');
const mixedNumbers = [
  '12025551234',    // 美国
  '13105552345',    // 美国
  '8613800138000',  // 中国
  '8613800138001',  // 中国
  '442071234567',   // 英国
  '442071234568'    // 英国
];

const countryResult = PhoneAnalyzer.analyzeCountryDistribution(mixedNumbers);
console.log('总数:', countryResult.totalCount);
console.log('有效:', countryResult.validCount);
console.log('无效:', countryResult.invalidCount);
console.log('\n国家分布:');
countryResult.countries.forEach(country => {
  console.log(`  ${country.regionCode} (国码: +${country.countryCode}): ${country.count}条`);
});

console.log('\n4. 测试号码标准化\n');
const numbersToNormalize = [
  '(202) 555-1234',  // 美国格式化号码
  '202-555-1234',    // 美国破折号格式
  '2025551234',      // 美国无国码
  '12025551234'      // 美国完整格式
];

console.log('原始号码 -> E.164格式:');
const normalized = PhoneAnalyzer.normalizePhoneNumbers(numbersToNormalize, 'US');
normalized.forEach(result => {
  console.log(`  ${result.original.padEnd(20)} -> ${result.normalized} (${result.valid ? '✓' : '✗'})`);
});

console.log('\n========================================');
console.log('测试完成！');
console.log('========================================\n');
