/**
 * 墨西哥号码测试脚本
 * 测试国码+号码格式（如528661302532）的解析
 */

const PhoneAnalyzer = require('./utils/phoneNumberAnalyzer');

console.log('========================================');
console.log('墨西哥号码格式测试（国码+号码）');
console.log('========================================\n');

// 测试1: 单个墨西哥号码解析
console.log('1. 测试单个墨西哥号码解析\n');

const testNumbers = [
  '528661302532',  // 墨西哥手机号（国码52 + 手机号8661302532）
  '525512345678',  // 墨西哥城手机号
  '528181234567',  // 蒙特雷手机号
  '+528661302532', // 带+号的格式
  '8661302532',    // 仅本地号码（无国码）
];

testNumbers.forEach(number => {
  const result = PhoneAnalyzer.parsePhone(number, 'MX');
  console.log(`号码: ${number}`);
  console.log(`  有效: ${result.valid}`);
  if (result.valid) {
    console.log(`  E.164格式: ${result.number.e164}`);
    console.log(`  国际格式: ${result.number.international}`);
    console.log(`  国家代码: ${result.regionCode}`);
    console.log(`  国际区号: ${result.countryCode}`);
    console.log(`  本地号码: ${result.number.significant}`);
    console.log(`  号码类型: ${result.type}`);
  } else {
    console.log(`  错误: ${result.error || '无效号码'}`);
  }
  console.log('');
});

// 测试2: 批量墨西哥号码分析（模拟运营商分布）
console.log('\n2. 测试墨西哥号码运营商分布分析\n');

const mexicoNumbers = [
  '528661302532',
  '528661302533',
  '528661302534',
  '525512345678',
  '525512345679',
  '528181234567',
  '528181234568',
  '528181234569'
];

// 墨西哥主要运营商号段（示例）
const mexicoOperators = [
  {
    name: 'Telcel',
    numberSegments: ['866', '551', '552', '553']  // 实际号段需要根据墨西哥运营商配置
  },
  {
    name: 'Movistar',
    numberSegments: ['818', '819', '820']
  },
  {
    name: 'AT&T Mexico',
    numberSegments: ['554', '555', '556']
  }
];

const result = PhoneAnalyzer.analyzeOperatorDistribution(mexicoNumbers, mexicoOperators, 'MX');

console.log(`总数: ${result.totalCount}`);
console.log(`有效: ${result.validCount}`);
console.log(`无效: ${result.invalidCount}`);
console.log(`未匹配: ${result.unmatchedCount}\n`);

console.log('运营商分布:');
result.distribution.forEach(dist => {
  console.log(`  ${dist.name}: ${dist.count}条`);
  dist.numbers.slice(0, 3).forEach(num => {
    console.log(`    - ${num.formatted} (号段: ${num.segment})`);
  });
});

// 测试3: 混合国家号码（包含墨西哥）
console.log('\n\n3. 测试混合国家号码分析\n');

const mixedNumbers = [
  '528661302532',  // 墨西哥
  '528661302533',  // 墨西哥
  '12025551234',   // 美国
  '12025551235',   // 美国
  '8613800138000', // 中国
  '8613800138001', // 中国
];

const countryDist = PhoneAnalyzer.analyzeCountryDistribution(mixedNumbers);

console.log(`总数: ${countryDist.totalCount}`);
console.log(`有效: ${countryDist.validCount}`);
console.log(`无效: ${countryDist.invalidCount}\n`);

console.log('国家分布:');
countryDist.countries.forEach(country => {
  console.log(`  ${country.regionCode} (国码: +${country.countryCode}): ${country.count}条`);
});

// 测试4: 验证号码格式标准化
console.log('\n\n4. 测试墨西哥号码格式标准化\n');

const formatTests = [
  '528661302532',
  '52 866 130 2532',
  '52-866-130-2532',
  '+52 866 130 2532',
];

console.log('原始号码 -> E.164格式:');
formatTests.forEach(number => {
  const result = PhoneAnalyzer.parsePhone(number, 'MX');
  const status = result.valid ? '✓' : '✗';
  console.log(`  ${number.padEnd(20)} -> ${result.number?.e164 || 'N/A'} (${status})`);
});

console.log('\n========================================');
console.log('测试完成！');
console.log('========================================\n');
