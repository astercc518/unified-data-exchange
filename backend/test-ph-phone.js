const { parsePhone } = require('./utils/phoneNumberAnalyzer');

// 测试菲律宾号码解析
const testNumbers = [
  '639364042026',
  '639274680083',
  '639465042469',
  '639538046266',
  '639388251675',
  '639067441547',
  '639659705967',
  '639167201875',
  '639700976743',
  '639615114144',
  '639976877854',
  '639542264664',
  '639653348224',
  '639053578623',
  '639971308673',
  '639940685933',
  '639610451401',
  '639157139249',
  '639924853729',
  '639550086241'
];

console.log('=== 菲律宾号码解析测试 ===\n');

testNumbers.forEach(num => {
  const result = parsePhone(num, 'PH');
  
  console.log(`原始号码: ${num}`);
  console.log(`  有效: ${result.valid}`);
  console.log(`  国家: ${result.regionCode}`);
  
  if (result.valid && result.number) {
    console.log(`  E.164: ${result.number.e164}`);
    console.log(`  国内格式: ${result.number.national}`);
    console.log(`  Significant: ${result.number.significant}`);
    
    const significant = result.number.significant;
    if (significant) {
      console.log(`  前3位号段: ${significant.substring(0, 3)}`);
      console.log(`  前4位号段: ${significant.substring(0, 4)}`);
    }
  }
  console.log('---\n');
});

// 测试当前配置的号段
const currentSegments = {
  'Smart Communications': ['813', '900', '907', '908', '909', '910', '912', '918', '919', '920', '921', '928', '929', '930', '938', '939', '946', '947', '948', '949', '950', '951', '961', '962', '963', '964', '998', '999'],
  'Globe Telecom': ['817', '905', '906', '915', '916', '917', '926', '927', '935', '936', '937', '945', '953', '954', '955', '956', '965', '966', '967', '975', '976', '977', '995', '996', '997'],
  'DITO Telecommunity': ['895', '896', '897', '991', '992', '993', '994'],
  'Sun Cellular': ['922', '923', '925', '931', '932', '933', '942', '943', '952', '958', '960', '968', '969', '970', '981', '985']
};

console.log('\n=== 当前配置的号段匹配测试 ===\n');
let matchedCount = 0;
let unmatchedCount = 0;
const unmatchedSegments = new Set();

testNumbers.forEach(num => {
  const result = parsePhone(num, 'PH');
  
  if (result.valid && result.number) {
    const significant = result.number.significant;
    
    let matched = false;
    for (const [operator, segments] of Object.entries(currentSegments)) {
      for (let len = 4; len >= 3; len--) {
        const segment = significant.substring(0, len);
        if (segments.includes(segment)) {
          console.log(`${num} -> ${operator} (号段: ${segment})`);
          matched = true;
          matchedCount++;
          break;
        }
      }
      if (matched) break;
    }
    
    if (!matched) {
      const seg = significant.substring(0, 3);
      unmatchedSegments.add(seg);
      console.log(`${num} -> 未匹配 (significant: ${significant}, 号段: ${seg})`);
      unmatchedCount++;
    }
  }
});

console.log(`\n匹配: ${matchedCount} 个`);
console.log(`未匹配: ${unmatchedCount} 个`);
console.log(`未匹配号段: ${Array.from(unmatchedSegments).sort().join(', ')}`);
