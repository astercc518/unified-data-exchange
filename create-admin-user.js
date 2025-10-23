// 创建admin用户用于测试删除功能
const fs = require('fs')

// 读取现有用户数据
let users = []
let agents = []

try {
  const usersFile = './backend/data/users.json'
  const agentsFile = './backend/data/agents.json'
  
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
  }
  
  if (fs.existsSync(agentsFile)) {
    agents = JSON.parse(fs.readFileSync(agentsFile, 'utf8'))
  }
} catch (e) {
  console.log('读取现有数据失败，将创建新数据')
}

// 检查是否已存在admin用户
const existingAdmin = users.find(u => u.loginAccount === 'admin')
const existingAdminAgent = agents.find(a => a.loginAccount === 'admin')

if (!existingAdmin && !existingAdminAgent) {
  // 创建管理员账号（作为特殊的代理角色）
  const adminAgent = {
    id: Date.now(),
    loginAccount: 'admin',
    loginPassword: '111111',
    agentName: '系统管理员',
    agentCode: 'ADMIN001',
    email: 'admin@system.com',
    phone: '13800138000',
    level: 'super',
    commissionRate: 0,
    salePriceRate: 1,
    status: 1,
    createTime: Date.now()
  }
  
  agents.push(adminAgent)
  
  // 保存到文件
  fs.writeFileSync('./backend/data/agents.json', JSON.stringify(agents, null, 2))
  
  console.log('✅ 管理员账号已创建')
  console.log('用户名: admin')
  console.log('密码: 111111')
  console.log('类型: 管理员(agent角色)')
} else {
  console.log('⚠️ admin账号已存在')
}

// 创建localStorage测试数据
console.log('\n📝 请在浏览器控制台运行以下代码设置管理员角色:')
console.log(`
// 设置管理员用户信息
const adminUser = {
  id: ${Date.now()},
  name: '超级管理员',
  loginAccount: 'admin',
  email: 'admin@system.com',
  type: 'admin',  // admin是超级管理员,不是agent
  roles: ['admin']  // admin只有admin角色
}
localStorage.setItem('currentUser', JSON.stringify(adminUser))

// 设置token
const token = 'admin-' + adminUser.id + '-' + Date.now()
localStorage.setItem('vue_admin_token', token)

console.log('✅ 管理员信息已设置,请刷新页面')
`)

