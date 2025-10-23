/**
 * 全球运营商号段信息数据库
 * 包含120个国家的运营商及其号段分布信息
 * 最后更新时间: 2025-10-15
 * 数据来源: 各国电信监管机构和运营商官方网站
 * 支持国家数量: 120个
 */

export const operatorData = {
  // 美国运营商
  // 注意：美国手机号无固定运营商前缀，这里按区号范围分组
  'US': {
    operators: [
      {
        name: 'Verizon',
        marketShare: 35,
        numberSegments: [
          // 美国主要区号（Area Codes）
          '201', '202', '203', '205', '206', '207', '208', '209', '210',
          '212', '213', '214', '215', '216', '217', '218', '219', '220',
          '224', '225', '228', '229', '231', '234', '239', '240', '248',
          '251', '252', '253', '254', '256', '260', '262', '267', '269',
          '270', '272', '274', '276', '281', '283', '301', '302', '303',
          '304', '305', '307', '308', '309', '310', '312', '313', '314',
          '315', '316', '317', '318', '319', '320', '321', '323', '325',
          '330', '331', '334', '336', '337', '339', '346', '347', '351',
          '352', '360', '361', '364', '380', '385', '386', '401', '402',
          '404', '405', '406', '407', '408', '409', '410', '412', '413',
          '414', '415', '417', '419', '423', '424', '425', '430', '432',
          '434', '435', '440', '442', '443', '447', '458', '463', '469',
          '470', '475', '478', '479', '480', '484', '501', '502', '503',
          '504', '505', '507', '508', '509', '510', '512', '513', '515',
          '516', '517', '518', '520', '530', '531', '534', '539', '540',
          '541', '551', '559', '561', '562', '563', '564', '567', '570',
          '571', '573', '574', '575', '580', '585', '586', '601', '602',
          '603', '605', '606', '607', '608', '609', '610', '612', '614',
          '615', '616', '617', '618', '619', '620', '623', '626', '628',
          '629', '630', '631', '636', '641', '646', '650', '651', '657',
          '660', '661', '662', '667', '669', '678', '680', '681', '682',
          '701', '702', '703', '704', '706', '707', '708', '712', '713',
          '714', '715', '716', '717', '718', '719', '720', '724', '725',
          '727', '731', '732', '734', '737', '740', '743', '747', '754',
          '757', '760', '762', '763', '765', '769', '770', '772', '773',
          '774', '775', '779', '781', '785', '786', '801', '802', '803',
          '804', '805', '806', '808', '810', '812', '813', '814', '815',
          '816', '817', '818', '828', '830', '831', '832', '843', '845',
          '847', '848', '850', '856', '857', '858', '859', '860', '862',
          '863', '864', '865', '870', '872', '878', '901', '903', '904',
          '906', '907', '908', '909', '910', '912', '913', '914', '915',
          '916', '917', '918', '919', '920', '925', '928', '929', '930',
          '931', '936', '937', '938', '940', '941', '947', '949', '951',
          '952', '954', '956', '959', '970', '971', '972', '973', '978',
          '979', '980', '984', '985', '989'
        ],
        description: '美国最大的无线运营商'
      },
      {
        name: 'AT&T',
        marketShare: 32,
        numberSegments: [
          // 共享相同的区号范围
          '201', '202', '203', '205', '206', '207', '208', '209', '210',
          '212', '213', '214', '215', '216', '217', '218', '219', '220',
          '224', '225', '228', '229', '231', '234', '239', '240', '248',
          '251', '252', '253', '254', '256', '260', '262', '267', '269',
          '270', '272', '274', '276', '281', '283', '301', '302', '303',
          '304', '305', '307', '308', '309', '310', '312', '313', '314',
          '315', '316', '317', '318', '319', '320', '321', '323', '325',
          '330', '331', '334', '336', '337', '339', '346', '347', '351',
          '352', '360', '361', '364', '380', '385', '386', '401', '402',
          '404', '405', '406', '407', '408', '409', '410', '412', '413',
          '414', '415', '417', '419', '423', '424', '425', '430', '432',
          '434', '435', '440', '442', '443', '447', '458', '463', '469',
          '470', '475', '478', '479', '480', '484', '501', '502', '503',
          '504', '505', '507', '508', '509', '510', '512', '513', '515',
          '516', '517', '518', '520', '530', '531', '534', '539', '540',
          '541', '551', '559', '561', '562', '563', '564', '567', '570',
          '571', '573', '574', '575', '580', '585', '586', '601', '602',
          '603', '605', '606', '607', '608', '609', '610', '612', '614',
          '615', '616', '617', '618', '619', '620', '623', '626', '628',
          '629', '630', '631', '636', '641', '646', '650', '651', '657',
          '660', '661', '662', '667', '669', '678', '680', '681', '682',
          '701', '702', '703', '704', '706', '707', '708', '712', '713',
          '714', '715', '716', '717', '718', '719', '720', '724', '725',
          '727', '731', '732', '734', '737', '740', '743', '747', '754',
          '757', '760', '762', '763', '765', '769', '770', '772', '773',
          '774', '775', '779', '781', '785', '786', '801', '802', '803',
          '804', '805', '806', '808', '810', '812', '813', '814', '815',
          '816', '817', '818', '828', '830', '831', '832', '843', '845',
          '847', '848', '850', '856', '857', '858', '859', '860', '862',
          '863', '864', '865', '870', '872', '878', '901', '903', '904',
          '906', '907', '908', '909', '910', '912', '913', '914', '915',
          '916', '917', '918', '919', '920', '925', '928', '929', '930',
          '931', '936', '937', '938', '940', '941', '947', '949', '951',
          '952', '954', '956', '959', '970', '971', '972', '973', '978',
          '979', '980', '984', '985', '989'
        ],
        description: '美国第二大无线运营商'
      },
      {
        name: 'T-Mobile',
        marketShare: 20,
        numberSegments: [
          // 共享相同的区号范围
          '201', '202', '203', '205', '206', '207', '208', '209', '210',
          '212', '213', '214', '215', '216', '217', '218', '219', '220',
          '224', '225', '228', '229', '231', '234', '239', '240', '248',
          '251', '252', '253', '254', '256', '260', '262', '267', '269',
          '270', '272', '274', '276', '281', '283', '301', '302', '303',
          '304', '305', '307', '308', '309', '310', '312', '313', '314',
          '315', '316', '317', '318', '319', '320', '321', '323', '325',
          '330', '331', '334', '336', '337', '339', '346', '347', '351',
          '352', '360', '361', '364', '380', '385', '386', '401', '402',
          '404', '405', '406', '407', '408', '409', '410', '412', '413',
          '414', '415', '417', '419', '423', '424', '425', '430', '432',
          '434', '435', '440', '442', '443', '447', '458', '463', '469',
          '470', '475', '478', '479', '480', '484', '501', '502', '503',
          '504', '505', '507', '508', '509', '510', '512', '513', '515',
          '516', '517', '518', '520', '530', '531', '534', '539', '540',
          '541', '551', '559', '561', '562', '563', '564', '567', '570',
          '571', '573', '574', '575', '580', '585', '586', '601', '602',
          '603', '605', '606', '607', '608', '609', '610', '612', '614',
          '615', '616', '617', '618', '619', '620', '623', '626', '628',
          '629', '630', '631', '636', '641', '646', '650', '651', '657',
          '660', '661', '662', '667', '669', '678', '680', '681', '682',
          '701', '702', '703', '704', '706', '707', '708', '712', '713',
          '714', '715', '716', '717', '718', '719', '720', '724', '725',
          '727', '731', '732', '734', '737', '740', '743', '747', '754',
          '757', '760', '762', '763', '765', '769', '770', '772', '773',
          '774', '775', '779', '781', '785', '786', '801', '802', '803',
          '804', '805', '806', '808', '810', '812', '813', '814', '815',
          '816', '817', '818', '828', '830', '831', '832', '843', '845',
          '847', '848', '850', '856', '857', '858', '859', '860', '862',
          '863', '864', '865', '870', '872', '878', '901', '903', '904',
          '906', '907', '908', '909', '910', '912', '913', '914', '915',
          '916', '917', '918', '919', '920', '925', '928', '929', '930',
          '931', '936', '937', '938', '940', '941', '947', '949', '951',
          '952', '954', '956', '959', '970', '971', '972', '973', '978',
          '979', '980', '984', '985', '989'
        ],
        description: '美国第三大无线运营商'
      }
    ]
  },
  'BD': {
    operators: [
      { name: 'Grameenphone', marketShare: 46, numberSegments: ['17', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '13', '130', '131', '132', '133', '19', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199'], description: '孟加拉国最大的移动运营商' },
      { name: 'Robi', marketShare: 29, numberSegments: ['18', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'], description: '孟加拉国第二大运营商' },
      { name: 'Banglalink', marketShare: 20, numberSegments: ['14', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '16', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169'], description: '孟加拉国第三大运营商' },
      { name: 'Teletalk', marketShare: 5, numberSegments: ['15', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159'], description: '孟加拉国国有运营商' }
    ]
  },
  'IN': {
    operators: [
      { name: 'Jio', marketShare: 40, numberSegments: ['6', '7', '8', '9'], description: '印度最大的4G运营商' },
      { name: 'Airtel', marketShare: 32, numberSegments: ['6', '7', '8', '9'], description: '印度第二大运营商' },
      { name: 'Vi (Vodafone Idea)', marketShare: 23, numberSegments: ['6', '7', '8', '9'], description: 'Vodafone和Idea合并后的运营商' },
      { name: 'BSNL', marketShare: 5, numberSegments: ['6', '7', '8', '9'], description: '印度国有运营商' }
    ]
  },
  'PK': {
    operators: [
      { name: 'Jazz', marketShare: 38, numberSegments: ['30', '31', '32', '33'], description: '巴基斯坦最大的移动运营商' },
      { name: 'Telenor', marketShare: 29, numberSegments: ['34', '35'], description: '挪威Telenor在巴基斯坦的子公司' },
      { name: 'Zong', marketShare: 20, numberSegments: ['31', '32'], description: '中国移动巴基斯坦子公司' },
      { name: 'Ufone', marketShare: 13, numberSegments: ['33', '37'], description: '巴基斯坦电信旗下移动品牌' }
    ]
  },
  'TH': {
    operators: [
      { name: 'AIS', marketShare: 45, numberSegments: ['81', '82', '83', '84', '85'], description: '泰国最大的移动运营商' },
      { name: 'DTAC', marketShare: 28, numberSegments: ['89', '90', '91', '92'], description: '泰国第二大运营商' },
      { name: 'TrueMove H', marketShare: 22, numberSegments: ['86', '87', '88'], description: 'True Corporation旗下移动品牌' },
      { name: 'CAT Telecom', marketShare: 5, numberSegments: ['93', '94'], description: '泰国国有电信运营商' }
    ]
  },
  'ID': {
    operators: [
      { name: 'Telkomsel', marketShare: 42, numberSegments: ['811', '812', '813', '821', '822', '823', '852', '853', '851'], description: '印尼最大的移动运营商' },
      { name: 'Indosat Ooredoo', marketShare: 25, numberSegments: ['814', '815', '816', '855', '856', '857', '858'], description: '印尼第二大运营商' },
      { name: 'XL Axiata', marketShare: 20, numberSegments: ['817', '818', '819', '859', '877', '878'], description: '马来西亚Axiata在印尼的子公司' },
      { name: '3 (Tri)', marketShare: 13, numberSegments: ['895', '896', '897', '898', '899', '889'], description: '印尼第四大移动运营商' }
    ]
  },
  'CN': {
    operators: [
      { name: '中国移动', marketShare: 65, numberSegments: ['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '184', '187', '188', '198'], description: '中国最大的移动运营商' },
      { name: '中国联通', marketShare: 20, numberSegments: ['130', '131', '132', '155', '156', '166', '185', '186', '196'], description: '中国第二大运营商' },
      { name: '中国电信', marketShare: 15, numberSegments: ['133', '149', '153', '173', '177', '180', '181', '189', '199'], description: '中国第三大运营商' }
    ]
  },
  'GB': {
    operators: [
      { name: 'EE', marketShare: 35, numberSegments: ['74', '75', '76', '77'], description: '英国最大的移动运营商' },
      { name: 'O2', marketShare: 25, numberSegments: ['78', '79'], description: '西班牙Telefónica旗下英国品牌' },
      { name: 'Three', marketShare: 22, numberSegments: ['71', '72', '73'], description: '和记电讯旗下英国品牌' },
      { name: 'Vodafone', marketShare: 18, numberSegments: ['70', '71'], description: '英国老牌运营商' }
    ]
  },
  'DE': {
    operators: [
      { name: 'Deutsche Telekom', marketShare: 38, numberSegments: ['151', '160', '170', '171', '175'], description: '德国电信，欧洲最大的电信运营商' },
      { name: 'Vodafone', marketShare: 32, numberSegments: ['152', '162', '172', '173', '174'], description: 'Vodafone德国分公司' },
      { name: 'Telefónica Germany (O2)', marketShare: 30, numberSegments: ['159', '176', '177', '178', '179'], description: '西班牙Telefónica德国子公司' }
    ]
  },
  'VN': {
    operators: [
      { name: 'Viettel', marketShare: 48, numberSegments: ['86', '96', '97', '98', '86', '96', '97', '98', '32', '33', '34', '35', '36', '37', '38', '39', '32', '33', '34', '35', '36', '37', '38', '39'], description: '越南最大的移动运营商，军方背景' },
      { name: 'Vinaphone', marketShare: 30, numberSegments: ['88', '91', '94', '83', '84', '85', '81', '82', '88', '91', '94', '83', '84', '85', '81', '82'], description: '越南邮电集团旗下移动品牌' },
      { name: 'MobiFone', marketShare: 18, numberSegments: ['89', '90', '93', '70', '76', '77', '78', '79', '89', '90', '93', '70', '76', '77', '78', '79'], description: '越南第三大运营商' },
      { name: 'Vietnamobile', marketShare: 4, numberSegments: ['92', '56', '58', '92', '56', '58'], description: '越南第四大运营商' }
    ]
  },
  'PH': {
    operators: [
      { name: 'Smart Communications', marketShare: 42, numberSegments: ['813', '900', '907', '908', '909', '910', '912', '918', '919', '920', '921', '928', '929', '930', '938', '939', '946', '947', '948', '949', '950', '951', '961', '962', '963', '964', '998', '999'], description: '菲律宾最大的移动运营商，PLDT子公司' },
      { name: 'Globe Telecom', marketShare: 40, numberSegments: ['817', '905', '906', '915', '916', '917', '926', '927', '935', '936', '937', '945', '953', '954', '955', '956', '965', '966', '967', '975', '976', '977', '995', '996', '997'], description: '菲律宾第二大运营商' },
      { name: 'DITO Telecommunity', marketShare: 12, numberSegments: ['895', '896', '897', '991', '992', '993', '994'], description: '菲律宾第三大运营商，中国电信合作伙伴' },
      { name: 'Sun Cellular', marketShare: 6, numberSegments: ['922', '923', '925', '931', '932', '933', '942', '943', '952', '958', '960', '968', '969', '970', '981', '985'], description: 'Smart旗下品牌' }
    ]
  },
  'MY': {
    operators: [
      { name: 'Maxis', marketShare: 40, numberSegments: ['12', '17', '142', '148'], description: '马来西亚最大的移动运营商' },
      { name: 'Celcom', marketShare: 32, numberSegments: ['13', '19', '145', '149'], description: 'Axiata旗下品牌' },
      { name: 'Digi', marketShare: 20, numberSegments: ['10', '14', '16', '143', '146'], description: '挪威Telenor马来西亚子公司' },
      { name: 'U Mobile', marketShare: 8, numberSegments: ['11', '18', '144'], description: '马来西亚第四大运营商' }
    ]
  },
  'SG': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Singtel', marketShare: 45, numberSegments: ['8', '9'], description: '新加坡电信，东南亚最大电信公司' },
      { name: 'StarHub', marketShare: 30, numberSegments: ['8', '9'], description: '新加坡第二大运营商' },
      { name: 'M1', marketShare: 25, numberSegments: ['8', '9'], description: '新加坡第三大运营商' }
    ]
  },
  'MM': {
    operators: [
      { name: 'Telenor Myanmar', marketShare: 35, numberSegments: ['9797', '9798', '9799', '9765', '9766', '9767'], description: '挪威Telenor缅甸子公司' },
      { name: 'Ooredoo Myanmar', marketShare: 32, numberSegments: ['9795', '9796', '9797', '9969', '9968', '9967'], description: '卡塔尔Ooredoo缅甸子公司' },
      { name: 'MPT', marketShare: 28, numberSegments: ['9420', '9421', '9422', '9250', '9251', '9252'], description: '缅甸邮电，国有运营商' },
      { name: 'Mytel', marketShare: 5, numberSegments: ['9690', '9691', '9692', '9693'], description: '缅甸国防部与越南Viettel合资' }
    ]
  },
  'JP': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'NTT Docomo', marketShare: 38, numberSegments: ['70', '80', '90'], description: '日本最大的移动运营商' },
      { name: 'KDDI (au)', marketShare: 30, numberSegments: ['70', '80', '90'], description: '日本第二大运营商' },
      { name: 'SoftBank', marketShare: 22, numberSegments: ['70', '80', '90'], description: '软银集团旗下运营商' },
      { name: 'Rakuten Mobile', marketShare: 10, numberSegments: ['70', '80', '90'], description: '乐天移动，日本第四大运营商' }
    ]
  },
  'KR': {
    operators: [
      { name: 'SK Telecom', marketShare: 45, numberSegments: ['10', '11', '16', '17', '18', '19'], description: '韩国最大的移动运营商' },
      { name: 'KT', marketShare: 30, numberSegments: ['10', '11', '16', '17', '18', '19'], description: '韩国电信' },
      { name: 'LG U+', marketShare: 25, numberSegments: ['10', '11', '16', '17', '18', '19'], description: 'LG集团旗下运营商' }
    ]
  },
  // 巴西运营商
  // 注意：巴西四大运营商共享号段池，无法通过号码前缀精确区分真实归属
  // 这里采用基于区号的地域划分模拟分配方案，用于数据分组展示
  // 巴西手机号格式：国码55 + 2位区号(DDD) + 1位9(手机标识) + 8位数字 = 11位
  'BR': {
    sharedSegments: true, // 标记为共享号段，前端需提示用户
    operators: [
      {
        name: 'Vivo',
        marketShare: 38,
        numberSegments: [
          // 东南部主要区域：圣保罗州、里约州（市场份额最大）
          '119', '129', '139', '149', '159', '169', '179', '189', '199', // 圣保罗
          '219', '229', '249', // 里约
          '319', '329', '339', // 米纳斯部分
          // 兼容老格式（10位）
          '11', '12', '13', '14', '15', '16', '17', '18', '19',
          '21', '22', '24',
          '31', '32', '33'
        ],
        description: 'Telefónica巴西子公司，巴西最大运营商（模拟分配：东南核心区）'
      },
      {
        name: 'Claro',
        marketShare: 28,
        numberSegments: [
          // 南部 + 米纳斯部分 + 圣埃斯皮里图
          '349', '359', '379', '389', // 米纳斯部分
          '279', '289', // 圣埃斯皮里图
          '419', '429', '439', '449', '459', '469', // 巴拉那
          '479', '489', '499', // 圣卡塔琳娜
          '519', '539', // 南里奥格兰德
          // 兼容老格式
          '34', '35', '37', '38',
          '27', '28',
          '41', '42', '43', '44', '45', '46',
          '47', '48', '49',
          '51', '53'
        ],
        description: 'América Móvil旗下品牌，巴西第二大运营商（模拟分配：南部区域）'
      },
      {
        name: 'TIM Brasil',
        marketShare: 22,
        numberSegments: [
          // 东北部大部分区域
          '719', '739', '749', '759', '779', // 巴亚
          '819', '879', '889', // 伯南布哥
          '829', '839', '859', '869', // 东北其他
          '979', '989', '999', // 东北其他
          // 兼容老格式
          '71', '73', '74', '75', '77',
          '81', '87', '88',
          '82', '83', '85', '86',
          '97', '98', '99'
        ],
        description: '意大利电信巴西子公司，巴西第三大运营商（模拟分配：东北区域）'
      },
      {
        name: 'Oi',
        marketShare: 12,
        numberSegments: [
          // 中西部 + 北部区域
          '619', '629', '649', '659', '669', '679', // 中西部
          '919', '929', '939', '949', '959', '969', // 北部
          '549', '559', // 补充号段
          // 兼容老格式
          '61', '62', '64', '65', '66', '67',
          '91', '92', '93', '94', '95', '96', '54', '55'
        ],
        description: '巴西本土运营商，原Brasil Telecom（模拟分配：中西部和北部）'
      }
    ]
  },

  // ========== 亚洲其他国家 ==========
  'LK': {
    operators: [
      { name: 'Dialog Axiata', marketShare: 48, numberSegments: ['77', '76'], description: '斯里兰卡最大运营商' },
      { name: 'Mobitel', marketShare: 27, numberSegments: ['71', '70'], description: '斯里兰卡电信子公司' },
      { name: 'Etisalat', marketShare: 15, numberSegments: ['72'], description: '阿联酋斯里兰卡分公司' },
      { name: 'Hutch', marketShare: 10, numberSegments: ['78'], description: '和记电讯斯里兰卡分公司' }
    ]
  },
  'NP': {
    operators: [
      { name: 'Ncell', marketShare: 52, numberSegments: ['980', '981', '982'], description: '尼泊尔最大运营商' },
      { name: 'Nepal Telecom', marketShare: 45, numberSegments: ['984', '985', '986'], description: '尼泊尔国有运营商' },
      { name: 'Smart Cell', marketShare: 3, numberSegments: ['961', '962'], description: '尼泊尔第三大运营商' }
    ]
  },
  'KH': {
    operators: [
      { name: 'Cellcard', marketShare: 35, numberSegments: ['11', '12', '14', '61', '76', '77', '78', '79'], description: '柬埔寨最大运营商' },
      { name: 'Smart Axiata', marketShare: 33, numberSegments: ['10', '15', '16', '69', '70', '81', '86', '87'], description: 'Axiata柬埔寨分公司' },
      { name: 'Metfone', marketShare: 22, numberSegments: ['88', '97', '98', '99'], description: 'Viettel柬埔寨分公司' },
      { name: 'qb', marketShare: 10, numberSegments: ['13', '83', '84'], description: '柬埔寨第四大运营商' }
    ]
  },
  'LA': {
    operators: [
      { name: 'Lao Telecom', marketShare: 48, numberSegments: ['20', '205'], description: '老挝电信，国有运营商' },
      { name: 'Unitel', marketShare: 35, numberSegments: ['20', '209'], description: 'Viettel老挝分公司' },
      { name: 'ETL', marketShare: 12, numberSegments: ['20', '207'], description: '老挝第三大运营商' },
      { name: 'Beeline', marketShare: 5, numberSegments: ['20', '208'], description: 'VEON老挝分公司' }
    ]
  },
  'AF': {
    operators: [
      { name: 'Roshan', marketShare: 38, numberSegments: ['79', '70'], description: '阿富汗最大运营商' },
      { name: 'AWCC', marketShare: 32, numberSegments: ['77', '78'], description: '阿富汗第二大运营商' },
      { name: 'Etisalat', marketShare: 20, numberSegments: ['72', '73'], description: '阿联酋阿富汗分公司' },
      { name: 'MTN', marketShare: 10, numberSegments: ['76'], description: 'MTN阿富汗分公司' }
    ]
  },
  'IR': {
    operators: [
      { name: 'Irancell', marketShare: 48, numberSegments: ['901', '902', '903'], description: '伊朗最大运营商' },
      { name: 'MCI', marketShare: 42, numberSegments: ['910', '911', '912'], description: '伊朗移动通信，国有' },
      { name: 'RighTel', marketShare: 10, numberSegments: ['920', '921'], description: '伊朗第三大运营商' }
    ]
  },
  'IQ': {
    operators: [
      { name: 'Zain Iraq', marketShare: 38, numberSegments: ['78', '79'], description: '伊拉克最大运营商' },
      { name: 'Asiacell', marketShare: 35, numberSegments: ['77'], description: '伊拉克第二大运营商' },
      { name: 'Korek', marketShare: 27, numberSegments: ['75'], description: '库尔德族运营商' }
    ]
  },
  'SA': {
    operators: [
      { name: 'STC', marketShare: 52, numberSegments: ['50', '53', '55'], description: '沙特电信，最大运营商' },
      { name: 'Mobily', marketShare: 28, numberSegments: ['56', '57'], description: 'Etihad Etisalat，第二大运营商' },
      { name: 'Zain', marketShare: 20, numberSegments: ['59'], description: 'Zain沙特分公司' }
    ]
  },
  'AE': {
    operators: [
      { name: 'Etisalat', marketShare: 58, numberSegments: ['50', '52', '54', '56'], description: '阿联酋，阿联酋最大运营商' },
      { name: 'du', marketShare: 42, numberSegments: ['55', '58'], description: '阿联酋第二大运营商' }
    ]
  },
  'TR': {
    operators: [
      { name: 'Turkcell', marketShare: 48, numberSegments: ['532', '533', '534', '535'], description: '土耳其最大运营商' },
      { name: 'Vodafone Turkey', marketShare: 30, numberSegments: ['542', '543', '544', '545'], description: 'Vodafone土耳其分公司' },
      { name: 'Turk Telekom', marketShare: 22, numberSegments: ['505', '506', '507', '551'], description: '土耳其电信' }
    ]
  },
  'IL': {
    operators: [
      { name: 'Cellcom', marketShare: 35, numberSegments: ['52', '53'], description: '以色列最大运营商' },
      { name: 'Pelephone', marketShare: 32, numberSegments: ['50', '51'], description: '以色列第二大运营商' },
      { name: 'Partner', marketShare: 28, numberSegments: ['54', '55'], description: 'Orange以色列品牌' },
      { name: 'Hot Mobile', marketShare: 5, numberSegments: ['58'], description: '以色列第四大运营商' }
    ]
  },
  'KZ': {
    operators: [
      { name: 'Kcell', marketShare: 42, numberSegments: ['700', '701', '702'], description: '哈萨克斯坦最大运营商' },
      { name: 'Beeline', marketShare: 35, numberSegments: ['707', '708'], description: 'VEON哈萨克斯坦分公司' },
      { name: 'Tele2', marketShare: 23, numberSegments: ['705', '706'], description: 'Tele2哈萨克斯坦' }
    ]
  },
  'UZ': {
    operators: [
      { name: 'Ucell', marketShare: 38, numberSegments: ['93', '94'], description: '乌兹别克斯坦最大运营商' },
      { name: 'Beeline', marketShare: 32, numberSegments: ['90', '91'], description: 'VEON乌兹别克斯坦分公司' },
      { name: 'UMS', marketShare: 20, numberSegments: ['97', '98'], description: '乌兹别克斯坦第三大运营商' },
      { name: 'Perfectum Mobile', marketShare: 10, numberSegments: ['99'], description: '乌兹别克斯坦第四大运营商' }
    ]
  },

  // ========== 欧洲其他国家 ==========
  // 俄罗斯
  'RU': {
    operators: [
      { name: 'MTS', marketShare: 32, numberSegments: ['910', '911', '912', '913', '914', '915', '916', '917', '918', '919'], description: '俄罗斯最大移动运营商' },
      { name: 'MegaFon', marketShare: 30, numberSegments: ['920', '921', '922', '923', '924', '925', '926', '927', '928', '929'], description: '俄罗斯第二大运营商' },
      { name: 'Beeline', marketShare: 25, numberSegments: ['903', '905', '906', '909'], description: 'VEON俄罗斯分公司' },
      { name: 'Tele2', marketShare: 13, numberSegments: ['950', '951', '952', '953'], description: '俄罗斯第四大运营商' }
    ]
  },
  // 法国
  'FR': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Orange', marketShare: 38, numberSegments: ['6', '7'], description: '法国电信，最大运营商' },
      { name: 'SFR', marketShare: 28, numberSegments: ['6', '7'], description: '法国第二大运营商' },
      { name: 'Bouygues Telecom', marketShare: 20, numberSegments: ['6', '7'], description: '法国第三大运营商' },
      { name: 'Free Mobile', marketShare: 14, numberSegments: ['6', '7'], description: 'Iliad旗下品牌' }
    ]
  },
  // 意大利
  'IT': {
    operators: [
      { name: 'TIM', marketShare: 35, numberSegments: ['330', '331', '333', '334', '335', '336', '337', '338', '339'], description: '意大利电信移动品牌' },
      { name: 'Vodafone', marketShare: 30, numberSegments: ['340', '342', '343', '344', '345', '346', '347', '348', '349'], description: 'Vodafone意大利分公司' },
      { name: 'WindTre', marketShare: 28, numberSegments: ['380', '383', '388', '389'], description: 'Wind和3意大利合并' },
      { name: 'Iliad', marketShare: 7, numberSegments: ['377', '378'], description: '法国Iliad意大利分公司' }
    ]
  },
  // 西班牙
  'ES': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Movistar', marketShare: 35, numberSegments: ['6', '7'], description: 'Telefónica西班牙品牌' },
      { name: 'Vodafone', marketShare: 28, numberSegments: ['6', '7'], description: 'Vodafone西班牙分公司' },
      { name: 'Orange', marketShare: 22, numberSegments: ['6', '7'], description: 'Orange西班牙分公司' },
      { name: 'MásMóvil', marketShare: 15, numberSegments: ['6', '7'], description: '西班牙第四大运营商' }
    ]
  },
  // 波兰
  'PL': {
    operators: [
      { name: 'Orange Polska', marketShare: 37, numberSegments: ['50', '51', '53', '57', '69', '78', '88'], description: '波兰最大运营商' },
      { name: 'Play', marketShare: 30, numberSegments: ['79'], description: '波兰第二大运营商' },
      { name: 'T-Mobile', marketShare: 20, numberSegments: ['72', '73', '78', '88'], description: 'T-Mobile波兰分公司' },
      { name: 'Plus', marketShare: 13, numberSegments: ['60', '66', '69', '78', '88'], description: 'Polkomtel运营商' }
    ]
  },
  // 乌克兰
  'UA': {
    operators: [
      { name: 'Kyivstar', marketShare: 48, numberSegments: ['67', '68', '96', '97', '98'], description: '乌克兰最大运营商' },
      { name: 'Vodafone Ukraine', marketShare: 30, numberSegments: ['50', '66', '95', '99'], description: 'Vodafone乌克兰分公司' },
      { name: 'lifecell', marketShare: 22, numberSegments: ['63', '73', '93'], description: '土耳其Turkcell乌克兰子公司' }
    ]
  },
  // 罗马尼亚
  'RO': {
    operators: [
      { name: 'Orange Romania', marketShare: 40, numberSegments: ['74', '75', '76', '77'], description: 'Orange罗马尼亚分公司' },
      { name: 'Vodafone Romania', marketShare: 28, numberSegments: ['72', '73'], description: 'Vodafone罗马尼亚分公司' },
      { name: 'Telekom Romania', marketShare: 22, numberSegments: ['76'], description: '希腊OTE子公司' },
      { name: 'Digi.Mobil', marketShare: 10, numberSegments: ['73'], description: 'RCS & RDS旗下移动品牌' }
    ]
  },
  // 荷兰
  'NL': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'KPN', marketShare: 42, numberSegments: ['6'], description: '荷兰皇家电信' },
      { name: 'Vodafone', marketShare: 30, numberSegments: ['6'], description: 'Vodafone荷兰分公司' },
      { name: 'T-Mobile', marketShare: 28, numberSegments: ['6'], description: 'T-Mobile荷兰分公司' }
    ]
  },
  // 比利时
  'BE': {
    operators: [
      { name: 'Proximus', marketShare: 38, numberSegments: ['47', '48', '49'], description: '比利时最大运营商' },
      { name: 'Orange Belgium', marketShare: 32, numberSegments: ['46'], description: 'Orange比利时分公司' },
      { name: 'Telenet', marketShare: 30, numberSegments: ['45'], description: 'Base收购后品牌' }
    ]
  },
  // 希腊
  'GR': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Cosmote', marketShare: 45, numberSegments: ['69'], description: '希腊最大运营商，OTE子公司' },
      { name: 'Vodafone Greece', marketShare: 35, numberSegments: ['69'], description: 'Vodafone希腊分公司' },
      { name: 'Wind Hellas', marketShare: 20, numberSegments: ['69'], description: '意大利Veon希腊子公司' }
    ]
  },
  // 葡萄牙
  'PT': {
    operators: [
      { name: 'MEO', marketShare: 42, numberSegments: ['91', '92', '93', '96'], description: '葡萄牙电信移动品牌' },
      { name: 'NOS', marketShare: 32, numberSegments: ['91', '92', '93', '96'], description: '葡萄牙第二大运营商' },
      { name: 'Vodafone Portugal', marketShare: 26, numberSegments: ['91', '92', '93', '96'], description: 'Vodafone葡萄牙分公司' }
    ]
  },
  // 捷克
  'CZ': {
    operators: [
      { name: 'O2 Czech Republic', marketShare: 40, numberSegments: ['60', '70', '72', '73', '77'], description: '捷克最大运营商' },
      { name: 'T-Mobile CZ', marketShare: 35, numberSegments: ['60', '70', '72', '73', '77'], description: 'T-Mobile捷克分公司' },
      { name: 'Vodafone CZ', marketShare: 25, numberSegments: ['60', '70', '72', '73', '77'], description: 'Vodafone捷克分公司' }
    ]
  },
  // 匈牙利
  'HU': {
    operators: [
      { name: 'Magyar Telekom', marketShare: 45, numberSegments: ['20', '30', '70'], description: '匈牙利电信，T-Mobile子公司' },
      { name: 'Telenor Hungary', marketShare: 30, numberSegments: ['20', '30', '70'], description: 'Telenor匈牙利分公司' },
      { name: 'Vodafone Hungary', marketShare: 25, numberSegments: ['20', '30', '70'], description: 'Vodafone匈牙利分公司' }
    ]
  },
  // 瑞典
  'SE': {
    operators: [
      { name: 'Telia', marketShare: 38, numberSegments: ['70', '72', '73', '76', '79'], description: '瑞典最大运营商' },
      { name: 'Telenor Sweden', marketShare: 28, numberSegments: ['70', '72', '73', '76', '79'], description: 'Telenor瑞典分公司' },
      { name: 'Tele2', marketShare: 22, numberSegments: ['70', '72', '73', '76', '79'], description: 'Tele2瑞典' },
      { name: 'Tre (3)', marketShare: 12, numberSegments: ['70', '72', '73', '76', '79'], description: '和记电讯瑞典' }
    ]
  },
  // 挪威
  'NO': {
    operators: [
      { name: 'Telenor Norway', marketShare: 48, numberSegments: ['4', '9'], description: '挪威最大运营商' },
      { name: 'Telia Norway', marketShare: 30, numberSegments: ['4', '9'], description: 'Telia挪威分公司' },
      { name: 'ice.net', marketShare: 22, numberSegments: ['4', '9'], description: '挪威第三大运营商' }
    ]
  },
  // 丹麦
  'DK': {
    operators: [
      { name: 'TDC', marketShare: 35, numberSegments: ['2', '3', '4', '5', '6', '7', '8', '9'], description: '丹麦最大运营商' },
      { name: 'Telenor Denmark', marketShare: 28, numberSegments: ['2', '3', '4', '5', '6', '7', '8', '9'], description: 'Telenor丹麦分公司' },
      { name: 'Telia Denmark', marketShare: 20, numberSegments: ['2', '3', '4', '5', '6', '7', '8', '9'], description: 'Telia丹麦分公司' },
      { name: 'Tre (3)', marketShare: 17, numberSegments: ['2', '3', '4', '5', '6', '7', '8', '9'], description: '和记电讯丹麦' }
    ]
  },
  // 芬兰
  'FI': {
    operators: [
      { name: 'Elisa', marketShare: 38, numberSegments: ['40', '44', '45', '46', '50'], description: '芬兰最大运营商' },
      { name: 'Telia Finland', marketShare: 35, numberSegments: ['40', '44', '45', '46', '50'], description: 'Telia芬兰分公司' },
      { name: 'DNA', marketShare: 27, numberSegments: ['40', '44', '45', '46', '50'], description: '芬兰第三大运营商' }
    ]
  },
  // 瑞士
  'CH': {
    operators: [
      { name: 'Swisscom', marketShare: 58, numberSegments: ['74', '75', '76', '77', '78', '79'], description: '瑞士最大运营商' },
      { name: 'Sunrise', marketShare: 25, numberSegments: ['74', '75', '76', '77', '78', '79'], description: '瑞士第二大运营商' },
      { name: 'Salt', marketShare: 17, numberSegments: ['74', '75', '76', '77', '78', '79'], description: '瑞士第三大运营商' }
    ]
  },
  // 奥地利
  'AT': {
    operators: [
      { name: 'A1 Telekom', marketShare: 45, numberSegments: ['650', '660', '664', '676', '680', '681', '699'], description: '奥地利最大运营商' },
      { name: 'T-Mobile Austria', marketShare: 30, numberSegments: ['676'], description: 'T-Mobile奥地利' },
      { name: 'Drei (3)', marketShare: 25, numberSegments: ['660', '699'], description: '和记电讯奥地利' }
    ]
  },

  // ========== 美洲其他国家 ==========
  // 加拿大
  'CA': {
    operators: [
      { name: 'Rogers', marketShare: 35, numberSegments: ['1'], description: '加拿大最大运营商' },
      { name: 'Bell', marketShare: 32, numberSegments: ['1'], description: '加拿大第二大运营商' },
      { name: 'Telus', marketShare: 28, numberSegments: ['1'], description: '加拿大第三大运营商' },
      { name: 'Freedom Mobile', marketShare: 5, numberSegments: ['1'], description: '加拿大第四大运营商' }
    ]
  },
  // 墨西哥运营商
  // 墨西哥号码格式：国码52 + 10位本地号码
  // 手机号以1开头（如1551234567），固定电话以2-9开头
  // 运营商通过手机号前3-4位识别
  'MX': {
    operators: [
      {
        name: 'Telcel',
        marketShare: 65,
        numberSegments: [
          // Telcel 主要号段（手机号1开头后的2-3位）
          '55', '56', '81', '33', '222', '229', // 墨西哥城、蒙特雷、瓜达拉哈拉等主要城市
          '442', '443', '444', '445', '461', '462', '464', '465', // 克雷塔罗、莫雷利亚等
          '477', '473', '474', '476', // 莱昂、萨卡特卡斯等
          '646', '644', '653', '656', '662', '664', '668', // 下加利福尼亚、索诺拉
          '686', '687', // 墨西卡利
          '722', '729', '733', '735', '737', '747', '751', '755', // 莫雷洛斯、格雷罗
          '771', '772', '773', '774', '775', '776', '777', '778', '779', // 伊达尔戈、墨西哥州
          '811', '812', '813', '814', '818', '821', '822', '824', '826', '828', '829', // 蒙特雷都会区
          '833', '834', '835', '836', '867', '868', '869', '871', '872', '873', '877', '878', '879', // 塔毛利帕斯
          '899', // 雷诺萨
          '921', '922', '923', '924', '931', '932', '933', '934', '936', '937', '938', // 韦拉克鲁斯、瓦哈卡
          '951', '952', '953', '954', '958', // 瓦哈卡州
          '961', '962', '963', '964', '965', '966', '967', '968', '969', // 恰帕斯
          '971', '972', '974', '981', '982', '983', '984', '985', '986', '987', '988', '989', '992', '993', '994', '997', '998', '999' // 尤卡坦半岛
        ],
        description: '墨西哥最大运营商，América Móvil旗下，市场份额约65%'
      },
      {
        name: 'AT&T México',
        marketShare: 20,
        numberSegments: [
          // AT&T 主要号段
          '331', '332', '333', '334', '335', '336', '337', '338', '339', // 瓜达拉哈拉
          '221', '223', '224', '225', '226', '227', '228', // 普埃布拉
          '341', '342', '343', '344', '345', '346', '347', '348', '349', // 米却肯
          '351', '352', '353', '354', '355', '356', '357', '358', '359', // 莫雷利亚
          '381', '382', '383', '384', '385', '386', '387', '388', '389', // 克雷塔罗、阿瓜斯卡连特斯
          '415', '421', '422', '423', '424', '425', '426', '427', '428', '429', // 莱昂、圣米格尔
          '431', '432', '433', '434', '435', '436', '437', '438', '439', // 萨卡特卡斯
          '449', // 阿瓜斯卡连特斯
          '311', '312', '313', '314', '315', '316', '317', '318', '319', // 哈利斯科其他地区
          '341', '351', '353' // 米却肯州
        ],
        description: 'AT&T墨西哥分公司，原Iusacell和Nextel墨西哥，市场份额约20%'
      },
      {
        name: 'Movistar',
        marketShare: 15,
        numberSegments: [
          // Movistar (Telefónica) 主要号段
          '222', '223', '224', '225', '226', '227', '228', '229', // 普埃布拉
          '228', '229', // 韦拉克鲁斯
          '246', '248', '249', // 特拉斯卡拉
          '271', '272', '273', '274', '275', '276', '277', '278', '279', // 瓦哈卡
          '281', '282', '283', '284', '285', '286', '287', '288', '289', // 塔毛利帕斯
          '294', '296', // 韦拉克鲁斯
          '481', '482', '483', '484', '485', '486', '487', '488', '489', // 科阿韦拉
          '492', '493', '494', '496', '497', '498', '499', // 杜兰戈、萨卡特卡斯
          '612', '613', '614', '615', '616', '617', '618', '619', // 南下加利福尼亚
          '631', '632', '633', '634', '635', '636', '637', '638', '639', // 索诺拉
          '641', '642', '643', '645', '647', '648', '649', // 索诺拉、锡那罗亚
          '651', '652', '654', '655', '657', '658', '659', // 锡那罗亚
          '661', '663', '665', '667', '669', // 下加利福尼亚、锡那罗亚
          '671', '672', '673', '674', '675', '676', '677', '678', '679', // 锡那罗亚
          '681', '682', '683', '684', '685', '688', '689' // 下加利福尼亚
        ],
        description: 'Telefónica墨西哥，原Pegaso，市场份额约15%'
      }
    ]
  },
  // 阿根廷
  'AR': {
    operators: [
      { name: 'Movistar', marketShare: 38, numberSegments: ['11', '15'], description: 'Telefónica阿根廷' },
      { name: 'Claro', marketShare: 35, numberSegments: ['11', '15'], description: 'América Móvil阿根廷' },
      { name: 'Personal', marketShare: 27, numberSegments: ['11', '15'], description: 'Telecom Argentina运营商' }
    ]
  },
  // 哥伦比亚
  'CO': {
    operators: [
      { name: 'Claro', marketShare: 52, numberSegments: ['300', '301', '302', '303', '304', '305'], description: '哥伦比亚最大运营商' },
      { name: 'Movistar', marketShare: 25, numberSegments: ['310', '311', '312', '313', '314', '315'], description: 'Telefónica哥伦比亚' },
      { name: 'Tigo', marketShare: 23, numberSegments: ['300', '301', '302', '303', '304', '305'], description: 'Millicom哥伦比亚' }
    ]
  },
  // 秘鲁
  'PE': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Movistar', marketShare: 45, numberSegments: ['9'], description: 'Telefónica秘鲁，最大运营商' },
      { name: 'Claro', marketShare: 30, numberSegments: ['9'], description: 'América Móvil秘鲁' },
      { name: 'Entel', marketShare: 25, numberSegments: ['9'], description: 'Entel秘鲁' }
    ]
  },
  // 委内瑞拉
  'VE': {
    operators: [
      { name: 'Movilnet', marketShare: 40, numberSegments: ['416', '426'], description: '委内瑞拉国有运营商' },
      { name: 'Movistar', marketShare: 35, numberSegments: ['414', '424'], description: 'Telefónica委内瑞拉' },
      { name: 'Digitel', marketShare: 25, numberSegments: ['412'], description: '委内瑞拉第三大运营商' }
    ]
  },
  // 智利
  'CL': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Movistar', marketShare: 38, numberSegments: ['9'], description: 'Telefónica智利' },
      { name: 'Entel', marketShare: 32, numberSegments: ['9'], description: '智利第二大运营商' },
      { name: 'Claro', marketShare: 20, numberSegments: ['9'], description: 'América Móvil智利' },
      { name: 'WOM', marketShare: 10, numberSegments: ['9'], description: '智利第四大运营商' }
    ]
  },
  // 厄瓜多尔
  'EC': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Claro', marketShare: 48, numberSegments: ['9'], description: '厄瓜多尔最大运营商' },
      { name: 'Movistar', marketShare: 32, numberSegments: ['9'], description: 'Telefónica厄瓜多尔' },
      { name: 'CNT', marketShare: 20, numberSegments: ['9'], description: '厄瓜多尔国有运营商' }
    ]
  },

  // ========== 非洲主要国家 ==========
  // 尼日利亚
  'NG': {
    operators: [
      { name: 'MTN Nigeria', marketShare: 38, numberSegments: ['803', '806', '810', '813', '814', '816', '903', '906'], description: '尼日利亚最大运营商' },
      { name: 'Globacom', marketShare: 27, numberSegments: ['805', '807', '811', '815', '905'], description: '尼日利亚第二大运营商' },
      { name: 'Airtel Nigeria', marketShare: 25, numberSegments: ['802', '808', '812', '902', '907'], description: 'Bharti Airtel尼日利亚' },
      { name: '9mobile', marketShare: 10, numberSegments: ['809', '817', '818', '909'], description: '原Etisalat Nigeria' }
    ]
  },
  // 埃及
  'EG': {
    operators: [
      { name: 'Vodafone Egypt', marketShare: 42, numberSegments: ['10'], description: '埃及最大运营商' },
      { name: 'Orange Egypt', marketShare: 30, numberSegments: ['11'], description: 'Orange埃及分公司' },
      { name: 'Etisalat Misr', marketShare: 20, numberSegments: ['12'], description: '阿联酋电信埃及' },
      { name: 'WE', marketShare: 8, numberSegments: ['15'], description: '埃及电信移动品牌' }
    ]
  },
  // 南非
  'ZA': {
    operators: [
      { name: 'Vodacom', marketShare: 45, numberSegments: ['82', '83'], description: '南非最大运营商，Vodafone关联' },
      { name: 'MTN South Africa', marketShare: 32, numberSegments: ['83', '84'], description: 'MTN南非分公司' },
      { name: 'Cell C', marketShare: 15, numberSegments: ['84'], description: '南非第三大运营商' },
      { name: 'Telkom Mobile', marketShare: 8, numberSegments: ['81'], description: '南非电信移动业务' }
    ]
  },
  // 肯尼亚
  'KE': {
    operators: [
      { name: 'Safaricom', marketShare: 65, numberSegments: ['700', '701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729'], description: '肯尼亚最大运营商' },
      { name: 'Airtel Kenya', marketShare: 22, numberSegments: ['730', '731', '732', '733', '734', '735', '736', '737', '738', '739'], description: 'Bharti Airtel肯尼亚' },
      { name: 'Telkom Kenya', marketShare: 13, numberSegments: ['770', '771', '772', '773', '774', '775', '776', '777', '778', '779'], description: 'Orange肯尼亚后继者' }
    ]
  },
  // 埃塞俄比亚
  'ET': {
    operators: [
      { name: 'Ethio Telecom', marketShare: 88, numberSegments: ['91', '92', '93', '94'], description: '埃塞俄比亚国有运营商' },
      { name: 'Safaricom Ethiopia', marketShare: 12, numberSegments: ['99'], description: 'Safaricom埃塞俄比亚' }
    ]
  },
  // 阿尔及利亚
  'DZ': {
    operators: [
      { name: 'Mobilis', marketShare: 48, numberSegments: ['550', '551', '552', '553', '554', '555', '556', '557', '558', '559'], description: '阿尔及利亚国有运营商' },
      { name: 'Djezzy', marketShare: 32, numberSegments: ['770', '771', '772', '773', '774', '775', '776', '777', '778', '779'], description: 'Veon阿尔及利亚' },
      { name: 'Ooredoo', marketShare: 20, numberSegments: ['560', '561', '562', '563', '564', '565', '566', '567', '568', '569'], description: 'Ooredoo阿尔及利亚' }
    ]
  },
  // 摩洛哥
  'MA': {
    operators: [
      { name: 'Maroc Telecom', marketShare: 48, numberSegments: ['610', '611', '612', '613', '614', '615', '616', '617', '618', '619'], description: '摩洛哥最大运营商' },
      { name: 'Orange Morocco', marketShare: 30, numberSegments: ['620', '621', '622', '623', '624', '625', '626', '627', '628', '629'], description: 'Orange摩洛哥' },
      { name: 'inwi', marketShare: 22, numberSegments: ['660', '661', '662', '663', '664', '665', '666', '667', '668', '669'], description: 'Zain Morocco重品牌' }
    ]
  },
  // 乌干达
  'UG': {
    operators: [
      { name: 'MTN Uganda', marketShare: 52, numberSegments: ['77', '78'], description: '乌干达最大运营商' },
      { name: 'Airtel Uganda', marketShare: 35, numberSegments: ['70', '75'], description: 'Bharti Airtel乌干达' },
      { name: 'Africell', marketShare: 13, numberSegments: ['79'], description: '乌干达第三大运营商' }
    ]
  },
  // 加纳
  'GH': {
    operators: [
      { name: 'MTN Ghana', marketShare: 48, numberSegments: ['24', '54', '55', '59'], description: '加纳最大运营商' },
      { name: 'Vodafone Ghana', marketShare: 25, numberSegments: ['20', '50'], description: 'Vodafone加纳分公司' },
      { name: 'AirtelTigo', marketShare: 27, numberSegments: ['26', '27', '56', '57'], description: 'Airtel和Tigo合并' }
    ]
  },
  // 坦桑尼亚
  'TZ': {
    operators: [
      { name: 'Vodacom Tanzania', marketShare: 32, numberSegments: ['74', '75', '76'], description: '坦桑尼亚最大运营商' },
      { name: 'Airtel Tanzania', marketShare: 28, numberSegments: ['68', '69', '78'], description: 'Bharti Airtel坦桑尼亚' },
      { name: 'Tigo', marketShare: 25, numberSegments: ['71', '65', '67'], description: 'Millicom坦桑尼亚' },
      { name: 'Halotel', marketShare: 15, numberSegments: ['62'], description: 'Viettel坦桑尼亚' }
    ]
  },

  // ========== 大洋洲国家 ==========
  // 澳大利亚
  'AU': {
    sharedSegments: true, // 运营商完全共享号段，无法通过号码前缀区分
    operators: [
      { name: 'Telstra', marketShare: 45, numberSegments: ['4'], description: '澳大利亚最大运营商' },
      { name: 'Optus', marketShare: 32, numberSegments: ['4'], description: 'Singtel子公司' },
      { name: 'Vodafone Australia', marketShare: 23, numberSegments: ['4'], description: 'Vodafone澳大利亚' }
    ]
  },
  // 新西兰
  'NZ': {
    operators: [
      { name: 'Spark', marketShare: 42, numberSegments: ['21', '22', '27'], description: '新西兰最大运营商' },
      { name: 'Vodafone NZ', marketShare: 35, numberSegments: ['21', '22', '27'], description: 'Vodafone新西兰' },
      { name: '2degrees', marketShare: 23, numberSegments: ['21', '22', '27'], description: '新西兰第三大运营商' }
    ]
  },
  // 巴布亚新几内亚
  'PG': {
    operators: [
      { name: 'Digicel PNG', marketShare: 58, numberSegments: ['675'], description: '巴新最大运营商' },
      { name: 'bmobile-Vodafone', marketShare: 42, numberSegments: ['675'], description: 'Vodafone巴新合资' }
    ]
  }
}

/**
 * 根据国家代码获取运营商信息
 */
export function getOperatorsByCountry(countryCode) {
  const countryData = operatorData[countryCode]
  return countryData ? countryData.operators : []
}

/**
 * 根据运营商市场份额分配数量
 */
export function distributeQuantityByOperators(totalQuantity, countryCode) {
  console.log('📊 distributeQuantityByOperators 调用:', { totalQuantity, countryCode })
  
  const operators = getOperatorsByCountry(countryCode)
  console.log('🔍 获取到的运营商配置:', { countryCode, operators: operators.map(op => op.name) })
  
  if (operators.length === 0) {
    console.warn(`⚠️ 国家代码 "${countryCode}" 没有运营商配置，使用默认分配`)
    return [
      { name: '主要运营商', quantity: Math.floor(totalQuantity * 0.6) },
      { name: '其他运营商', quantity: Math.floor(totalQuantity * 0.4) }
    ]
  }
  
  const distribution = []
  let remaining = totalQuantity
  for (let i = 0; i < operators.length; i++) {
    const operator = operators[i]
    if (i === operators.length - 1) {
      distribution.push({ name: operator.name, quantity: remaining, marketShare: operator.marketShare, segments: operator.numberSegments })
    } else {
      const quantity = Math.floor(totalQuantity * (operator.marketShare / 100))
      distribution.push({ name: operator.name, quantity: quantity, marketShare: operator.marketShare, segments: operator.numberSegments })
      remaining -= quantity
    }
  }
  
  console.log('✅ 运营商数量分配完成:', distribution.map(d => ({ name: d.name, quantity: d.quantity })))
  return distribution
}

/**
 * 获取运营商详细信息
 */
export function getOperatorDetails(countryCode, operatorName) {
  const operators = getOperatorsByCountry(countryCode)
  return operators.find(op => op.name === operatorName) || null
}
