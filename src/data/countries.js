/**
 * 全球国家数据
 * 包含国家名称（中英文）、国家代码（ISO 3166-1 alpha-2）、区号等信息
 */

export const countryList = [
  // 亚洲国家
  { code: 'CN', name: '中国', nameEn: 'China', dialCode: '+86', region: 'Asia' },
  { code: 'IN', name: '印度', nameEn: 'India', dialCode: '+91', region: 'Asia' },
  { code: 'BD', name: '孟加拉国', nameEn: 'Bangladesh', dialCode: '+880', region: 'Asia' },
  { code: 'PK', name: '巴基斯坦', nameEn: 'Pakistan', dialCode: '+92', region: 'Asia' },
  { code: 'ID', name: '印度尼西亚', nameEn: 'Indonesia', dialCode: '+62', region: 'Asia' },
  { code: 'JP', name: '日本', nameEn: 'Japan', dialCode: '+81', region: 'Asia' },
  { code: 'PH', name: '菲律宾', nameEn: 'Philippines', dialCode: '+63', region: 'Asia' },
  { code: 'VN', name: '越南', nameEn: 'Vietnam', dialCode: '+84', region: 'Asia' },
  { code: 'TH', name: '泰国', nameEn: 'Thailand', dialCode: '+66', region: 'Asia' },
  { code: 'MY', name: '马来西亚', nameEn: 'Malaysia', dialCode: '+60', region: 'Asia' },
  { code: 'SG', name: '新加坡', nameEn: 'Singapore', dialCode: '+65', region: 'Asia' },
  { code: 'KR', name: '韩国', nameEn: 'South Korea', dialCode: '+82', region: 'Asia' },
  { code: 'MM', name: '缅甸', nameEn: 'Myanmar', dialCode: '+95', region: 'Asia' },
  { code: 'LK', name: '斯里兰卡', nameEn: 'Sri Lanka', dialCode: '+94', region: 'Asia' },
  { code: 'NP', name: '尼泊尔', nameEn: 'Nepal', dialCode: '+977', region: 'Asia' },
  { code: 'KH', name: '柬埔寨', nameEn: 'Cambodia', dialCode: '+855', region: 'Asia' },
  { code: 'LA', name: '老挝', nameEn: 'Laos', dialCode: '+856', region: 'Asia' },
  { code: 'AF', name: '阿富汗', nameEn: 'Afghanistan', dialCode: '+93', region: 'Asia' },
  { code: 'IR', name: '伊朗', nameEn: 'Iran', dialCode: '+98', region: 'Asia' },
  { code: 'IQ', name: '伊拉克', nameEn: 'Iraq', dialCode: '+964', region: 'Asia' },
  { code: 'SA', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', dialCode: '+966', region: 'Asia' },
  { code: 'AE', name: '阿联酋', nameEn: 'United Arab Emirates', dialCode: '+971', region: 'Asia' },
  { code: 'TR', name: '土耳其', nameEn: 'Turkey', dialCode: '+90', region: 'Asia' },
  { code: 'IL', name: '以色列', nameEn: 'Israel', dialCode: '+972', region: 'Asia' },
  { code: 'KZ', name: '哈萨克斯坦', nameEn: 'Kazakhstan', dialCode: '+7', region: 'Asia' },
  { code: 'UZ', name: '乌兹别克斯坦', nameEn: 'Uzbekistan', dialCode: '+998', region: 'Asia' },

  // 欧洲国家
  { code: 'RU', name: '俄罗斯', nameEn: 'Russia', dialCode: '+7', region: 'Europe' },
  { code: 'DE', name: '德国', nameEn: 'Germany', dialCode: '+49', region: 'Europe' },
  { code: 'GB', name: '英国', nameEn: 'United Kingdom', dialCode: '+44', region: 'Europe' },
  { code: 'FR', name: '法国', nameEn: 'France', dialCode: '+33', region: 'Europe' },
  { code: 'IT', name: '意大利', nameEn: 'Italy', dialCode: '+39', region: 'Europe' },
  { code: 'ES', name: '西班牙', nameEn: 'Spain', dialCode: '+34', region: 'Europe' },
  { code: 'PL', name: '波兰', nameEn: 'Poland', dialCode: '+48', region: 'Europe' },
  { code: 'UA', name: '乌克兰', nameEn: 'Ukraine', dialCode: '+380', region: 'Europe' },
  { code: 'RO', name: '罗马尼亚', nameEn: 'Romania', dialCode: '+40', region: 'Europe' },
  { code: 'NL', name: '荷兰', nameEn: 'Netherlands', dialCode: '+31', region: 'Europe' },
  { code: 'BE', name: '比利时', nameEn: 'Belgium', dialCode: '+32', region: 'Europe' },
  { code: 'GR', name: '希腊', nameEn: 'Greece', dialCode: '+30', region: 'Europe' },
  { code: 'PT', name: '葡萄牙', nameEn: 'Portugal', dialCode: '+351', region: 'Europe' },
  { code: 'CZ', name: '捷克', nameEn: 'Czech Republic', dialCode: '+420', region: 'Europe' },
  { code: 'HU', name: '匈牙利', nameEn: 'Hungary', dialCode: '+36', region: 'Europe' },
  { code: 'SE', name: '瑞典', nameEn: 'Sweden', dialCode: '+46', region: 'Europe' },
  { code: 'NO', name: '挪威', nameEn: 'Norway', dialCode: '+47', region: 'Europe' },
  { code: 'DK', name: '丹麦', nameEn: 'Denmark', dialCode: '+45', region: 'Europe' },
  { code: 'FI', name: '芬兰', nameEn: 'Finland', dialCode: '+358', region: 'Europe' },
  { code: 'CH', name: '瑞士', nameEn: 'Switzerland', dialCode: '+41', region: 'Europe' },
  { code: 'AT', name: '奥地利', nameEn: 'Austria', dialCode: '+43', region: 'Europe' },

  // 北美洲国家
  { code: 'US', name: '美国', nameEn: 'United States', dialCode: '+1', region: 'North America' },
  { code: 'CA', name: '加拿大', nameEn: 'Canada', dialCode: '+1', region: 'North America' },
  { code: 'MX', name: '墨西哥', nameEn: 'Mexico', dialCode: '+52', region: 'North America' },
  { code: 'GT', name: '危地马拉', nameEn: 'Guatemala', dialCode: '+502', region: 'North America' },
  { code: 'CU', name: '古巴', nameEn: 'Cuba', dialCode: '+53', region: 'North America' },
  { code: 'HT', name: '海地', nameEn: 'Haiti', dialCode: '+509', region: 'North America' },
  { code: 'DO', name: '多米尼加', nameEn: 'Dominican Republic', dialCode: '+1', region: 'North America' },
  { code: 'HN', name: '洪都拉斯', nameEn: 'Honduras', dialCode: '+504', region: 'North America' },
  { code: 'NI', name: '尼加拉瓜', nameEn: 'Nicaragua', dialCode: '+505', region: 'North America' },
  { code: 'CR', name: '哥斯达黎加', nameEn: 'Costa Rica', dialCode: '+506', region: 'North America' },
  { code: 'PA', name: '巴拿马', nameEn: 'Panama', dialCode: '+507', region: 'North America' },

  // 南美洲国家
  { code: 'BR', name: '巴西', nameEn: 'Brazil', dialCode: '+55', region: 'South America' },
  { code: 'CO', name: '哥伦比亚', nameEn: 'Colombia', dialCode: '+57', region: 'South America' },
  { code: 'AR', name: '阿根廷', nameEn: 'Argentina', dialCode: '+54', region: 'South America' },
  { code: 'PE', name: '秘鲁', nameEn: 'Peru', dialCode: '+51', region: 'South America' },
  { code: 'VE', name: '委内瑞拉', nameEn: 'Venezuela', dialCode: '+58', region: 'South America' },
  { code: 'CL', name: '智利', nameEn: 'Chile', dialCode: '+56', region: 'South America' },
  { code: 'EC', name: '厄瓜多尔', nameEn: 'Ecuador', dialCode: '+593', region: 'South America' },
  { code: 'BO', name: '玻利维亚', nameEn: 'Bolivia', dialCode: '+591', region: 'South America' },
  { code: 'PY', name: '巴拉圭', nameEn: 'Paraguay', dialCode: '+595', region: 'South America' },
  { code: 'UY', name: '乌拉圭', nameEn: 'Uruguay', dialCode: '+598', region: 'South America' },
  { code: 'GY', name: '圭亚那', nameEn: 'Guyana', dialCode: '+592', region: 'South America' },
  { code: 'SR', name: '苏里南', nameEn: 'Suriname', dialCode: '+597', region: 'South America' },

  // 非洲国家
  { code: 'NG', name: '尼日利亚', nameEn: 'Nigeria', dialCode: '+234', region: 'Africa' },
  { code: 'ET', name: '埃塞俄比亚', nameEn: 'Ethiopia', dialCode: '+251', region: 'Africa' },
  { code: 'EG', name: '埃及', nameEn: 'Egypt', dialCode: '+20', region: 'Africa' },
  { code: 'ZA', name: '南非', nameEn: 'South Africa', dialCode: '+27', region: 'Africa' },
  { code: 'KE', name: '肯尼亚', nameEn: 'Kenya', dialCode: '+254', region: 'Africa' },
  { code: 'UG', name: '乌干达', nameEn: 'Uganda', dialCode: '+256', region: 'Africa' },
  { code: 'DZ', name: '阿尔及利亚', nameEn: 'Algeria', dialCode: '+213', region: 'Africa' },
  { code: 'SD', name: '苏丹', nameEn: 'Sudan', dialCode: '+249', region: 'Africa' },
  { code: 'MA', name: '摩洛哥', nameEn: 'Morocco', dialCode: '+212', region: 'Africa' },
  { code: 'AO', name: '安哥拉', nameEn: 'Angola', dialCode: '+244', region: 'Africa' },
  { code: 'GH', name: '加纳', nameEn: 'Ghana', dialCode: '+233', region: 'Africa' },
  { code: 'MZ', name: '莫桑比克', nameEn: 'Mozambique', dialCode: '+258', region: 'Africa' },
  { code: 'MG', name: '马达加斯加', nameEn: 'Madagascar', dialCode: '+261', region: 'Africa' },
  { code: 'CM', name: '喀麦隆', nameEn: 'Cameroon', dialCode: '+237', region: 'Africa' },
  { code: 'CI', name: '科特迪瓦', nameEn: 'Ivory Coast', dialCode: '+225', region: 'Africa' },
  { code: 'NE', name: '尼日尔', nameEn: 'Niger', dialCode: '+227', region: 'Africa' },
  { code: 'BF', name: '布基纳法索', nameEn: 'Burkina Faso', dialCode: '+226', region: 'Africa' },
  { code: 'ML', name: '马里', nameEn: 'Mali', dialCode: '+223', region: 'Africa' },
  { code: 'MW', name: '马拉维', nameEn: 'Malawi', dialCode: '+265', region: 'Africa' },
  { code: 'ZM', name: '赞比亚', nameEn: 'Zambia', dialCode: '+260', region: 'Africa' },
  { code: 'ZW', name: '津巴布韦', nameEn: 'Zimbabwe', dialCode: '+263', region: 'Africa' },

  // 大洋洲国家
  { code: 'AU', name: '澳大利亚', nameEn: 'Australia', dialCode: '+61', region: 'Oceania' },
  { code: 'PG', name: '巴布亚新几内亚', nameEn: 'Papua New Guinea', dialCode: '+675', region: 'Oceania' },
  { code: 'NZ', name: '新西兰', nameEn: 'New Zealand', dialCode: '+64', region: 'Oceania' },
  { code: 'FJ', name: '斐济', nameEn: 'Fiji', dialCode: '+679', region: 'Oceania' },
  { code: 'SB', name: '所罗门群岛', nameEn: 'Solomon Islands', dialCode: '+677', region: 'Oceania' },
  { code: 'NC', name: '新喀里多尼亚', nameEn: 'New Caledonia', dialCode: '+687', region: 'Oceania' },
  { code: 'PF', name: '法属波利尼西亚', nameEn: 'French Polynesia', dialCode: '+689', region: 'Oceania' },
  { code: 'VU', name: '瓦努阿图', nameEn: 'Vanuatu', dialCode: '+678', region: 'Oceania' },
  { code: 'WS', name: '萨摩亚', nameEn: 'Samoa', dialCode: '+685', region: 'Oceania' },
  { code: 'KI', name: '基里巴斯', nameEn: 'Kiribati', dialCode: '+686', region: 'Oceania' }
]

/**
 * 根据搜索关键词过滤国家列表
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 过滤后的国家列表
 */
export function filterCountries(keyword) {
  if (!keyword) return countryList

  const searchTerm = keyword.toLowerCase().trim()

  return countryList.filter(country => {
    return (
      country.name.toLowerCase().includes(searchTerm) ||
      country.nameEn.toLowerCase().includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm) ||
      country.dialCode.includes(searchTerm)
    )
  })
}

/**
 * 根据国家代码获取国家信息
 * @param {string} code - 国家代码
 * @returns {Object|null} 国家信息对象
 */
export function getCountryByCode(code) {
  return countryList.find(country => country.code === code) || null
}

/**
 * 根据国家名称获取国家信息
 * @param {string} name - 国家名称（中文或英文）
 * @returns {Object|null} 国家信息对象
 */
export function getCountryByName(name) {
  return countryList.find(country =>
    country.name === name || country.nameEn === name
  ) || null
}

/**
 * 按地区分组国家
 * @returns {Object} 按地区分组的国家列表
 */
export function getCountriesByRegion() {
  const regions = {}

  countryList.forEach(country => {
    if (!regions[country.region]) {
      regions[country.region] = []
    }
    regions[country.region].push(country)
  })

  return regions
}

/**
 * 获取热门国家列表（基于业务需求）
 * @returns {Array} 热门国家列表
 */
export function getPopularCountries() {
  const popularCodes = ['BD', 'IN', 'PK', 'ID', 'TH', 'MY', 'VN', 'PH', 'CN', 'US', 'GB', 'DE', 'FR', 'BR', 'NG', 'EG']

  return countryList.filter(country => popularCodes.includes(country.code))
}

/**
 * 根据国际电话区号获取所有国家
 * @param {string} dialCode - 国际电话区号（如 +1, +7）
 * @returns {Array} 国家列表
 */
export function getCountriesByDialCode(dialCode) {
  return countryList.filter(country => country.dialCode === dialCode)
}

/**
 * 检查是否为共用国码（多个国家共用同一国码）
 * @param {string} dialCode - 国际电话区号（如 +1, +7）
 * @returns {boolean} 是否为共用国码
 */
export function isSharedDialCode(dialCode) {
  const countries = getCountriesByDialCode(dialCode)
  return countries.length > 1
}

/**
 * 获取共用国码的默认国家
 * +1 -> 美国 (US)
 * +7 -> 俄罗斯 (RU)
 * @param {string} dialCode - 国际电话区号
 * @returns {Object|null} 默认国家对象
 */
export function getDefaultCountryForDialCode(dialCode) {
  const defaultMapping = {
    '+1': 'US', // 美国、加拿大、多米尼加 -> 默认美国
    '+7': 'RU' // 俄罗斯、哈萨克斯坦 -> 默认俄罗斯
  }

  const defaultCode = defaultMapping[dialCode]
  if (defaultCode) {
    return countryList.find(country => country.code === defaultCode)
  }

  // 如果没有默认映射，返回第一个国家
  const countries = getCountriesByDialCode(dialCode)
  return countries.length > 0 ? countries[0] : null
}
