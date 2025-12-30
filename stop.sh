#!/bin/bash

# 体感单词游戏 - 停止脚本
# 用于停止本地HTTP服务器

echo "🛑 体感单词游戏 - 停止服务"
echo "================================"

# PID文件路径
PID_FILE=".server.pid"

# 检查PID文件是否存在
if [ -f "$PID_FILE" ]; then
    # 读取PID
    PID=$(cat "$PID_FILE")
    
    # 检查进程是否存在
    if ps -p $PID > /dev/null 2>&1; then
        echo "📋 找到服务器进程 (PID: $PID)"
        echo "⏳ 正在停止服务器..."
        
        # 终止进程
        kill $PID 2>/dev/null
        
        # 等待进程结束
        sleep 1
        
        # 检查是否成功停止
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️  进程未响应，强制终止..."
            kill -9 $PID 2>/dev/null
            sleep 1
        fi
        
        # 删除PID文件
        rm -f "$PID_FILE"
        
        echo "✅ 服务器已停止"
    else
        echo "⚠️  进程 $PID 不存在（可能已停止）"
        rm -f "$PID_FILE"
    fi
else
    echo "⚠️  未找到PID文件"
    echo "尝试查找并停止所有相关进程..."
    
    # 尝试停止可能的Python服务器
    PYTHON_PIDS=$(lsof -ti:8000,8001,8002 2>/dev/null)
    if [ ! -z "$PYTHON_PIDS" ]; then
        echo "📋 找到运行在端口 8000-8002 的进程"
        echo "$PYTHON_PIDS" | while read pid; do
            echo "⏳ 停止进程 $pid..."
            kill $pid 2>/dev/null
        done
        sleep 1
        echo "✅ 已尝试停止所有相关进程"
    else
        echo "ℹ️  未找到运行中的服务器进程"
    fi
fi

echo "================================"
echo "✨ 完成"
