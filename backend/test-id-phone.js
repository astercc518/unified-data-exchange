const { parsePhone } = require('./utils/phoneNumberAnalyzer');

// 测试印尼号码解析
const testNumbers = [
  '6285392250808',
  '6285392174117',
  '6285394037588',
  '6285392252303',
  '6285394071099',
  '6285394080043',
  '6285397621793',
  '6285394153555'
];

console.log('=== 印尼号码解析测试 ===\n');

testNumbers.forEach(num => {
  const result = parsePhone(num, 'ID');
  
  console.log(`原始号码: ${num}`);
  console.log(`  有效: ${result.valid}`);
  console.log(`  国家: ${result.regionCode}`);
  console.log(`  国码: ${result.countryCode}`);
  
  if (result.valid && result.number) {
    console.log(`  E.164: ${result.number.e164}`);
    console.log(`  国际格式: ${result.number.international}`);
    console.log(`  国内格式: ${result.number.national}`);
    console.log(`  Significant: ${result.number.significant}`);
    
    // 提取不同长度的号段
    const significant = result.number.significant;
    if (significant) {
      console.log(`  前1位号段: ${significant.substring(0, 1)}`);
      console.log(`  前2位号段: ${significant.substring(0, 2)}`);
      console.log(`  前3位号段: ${significant.substring(0, 3)}`);
      console.log(`  前4位号段: ${significant.substring(0, 4)}`);
    }
  }
  console.log('---\n');
});

// 测试当前配置的号段
const currentSegments = {
  'Telkomsel': ['811', '812', '813', '821', '822', '823', '852', '853', '851'],
  'Indosat Ooredoo': ['814', '815', '816', '855', '856', '857', '858'],
  'XL Axiata': ['817', '818', '819', '859', '877', '878'],
  '3 (Tri)': ['895', '896', '897', '898', '899', '889']
};

console.log('\n=== 当前配置的号段匹配测试 ===\n');
testNumbers.forEach(num => {
  const result = parsePhone(num, 'ID');
  
  if (result.valid && result.number) {
    const significant = result.number.significant;
    
    let matched = false;
    for (const [operator, segments] of Object.entries(currentSegments)) {
      for (let len = 4; len >= 1; len--) {
        const segment = significant.substring(0, len);
        if (segments.includes(segment)) {
          console.log(`${num} -> ${operator} (号段: ${segment}, significant: ${significant})`);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    
    if (!matched) {
      console.log(`${num} -> 未匹配 (significant: ${significant})`);
    }
  }
});
