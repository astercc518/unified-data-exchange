#!/bin/bash

# 简化的启动脚本 - 输出到文件
LOG_FILE="/tmp/startup-$(date +%Y%m%d-%H%M%S).log"

{
    echo "====================================="
    echo "启动时间: $(date)"
    echo "====================================="
    echo ""
    
    # 停止旧进程
    echo "停止已有进程..."
    pkill -f "node.*backend/server.js" 2>/dev/null || true
    pkill -f "vue-cli-service" 2>/dev/null || true
    sleep 2
    
    # 启动后端
    echo "启动后端服务..."
    cd /home/vue-element-admin/backend
    nohup node server.js > /tmp/backend-$(date +%Y%m%d).log 2>&1 &
    BACKEND_PID=$!
    echo "后端 PID: $BACKEND_PID"
    
    # 等待后端启动
    echo "等待后端服务..."
    sleep 5
    
    # 检查后端
    echo "检查后端健康..."
    curl -s http://localhost:3000/health || echo "后端未响应"
    
    # 启动前端
    echo ""
    echo "启动前端服务..."
    cd /home/vue-element-admin
    nohup npm run dev > /tmp/frontend-$(date +%Y%m%d).log 2>&1 &
    FRONTEND_PID=$!
    echo "前端 PID: $FRONTEND_PID"
    
    echo ""
    echo "====================================="
    echo "启动完成!"
    echo "====================================="
    echo "后端日志: /tmp/backend-$(date +%Y%m%d).log"
    echo "前端日志: /tmp/frontend-$(date +%Y%m%d).log"
    echo "后端地址: http://localhost:3000"
    echo "前端地址: http://localhost:3001"
    echo ""
    
} 2>&1 | tee "$LOG_FILE"

echo "完整日志已保存到: $LOG_FILE"
