module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/server.js',
      cwd: '/home/vue-element-admin',
      instances: 1,
      autorestart: true,
      watch: false,
      // max_memory_restart: '2G',  // 已移除内存限制，不限制内存使用
      min_uptime: '10s',          // 最小运行时间10秒才算稳定
      max_restarts: 10,           // 最大重启次数限制
      restart_delay: 4000,        // 重启延迟4秒
      kill_timeout: 5000,         // 优雅关闭超时5秒
      listen_timeout: 10000,      // 监听超时10秒
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: '/tmp/pm2-backend-error.log',
      out_file: '/tmp/pm2-backend-out.log',
      log_file: '/tmp/pm2-backend-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      merge_logs: true
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/vue-element-admin',
      instances: 1,
      autorestart: true,
      watch: false,
      // max_memory_restart: '3G',   // 已移除内存限制，不限制内存使用
      min_uptime: '30s',          // 前端编译需要更长启动时间
      max_restarts: 10,           // 最大重启次数限制
      restart_delay: 4000,        // 重启延迟4秒
      kill_timeout: 10000,        // 前端停止需要更长时间
      env: {
        NODE_ENV: 'development',
        PORT: 9527
      },
      error_file: '/tmp/pm2-frontend-error.log',
      out_file: '/tmp/pm2-frontend-out.log',
      log_file: '/tmp/pm2-frontend-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      merge_logs: true
    }
  ]
};
