// 2D游戏渲染器
// 版本: v5.0 - 添加防重复创建保护
console.log('✅ Game2DRenderer v5.0 已加载');

class Game2DRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.videoCanvas = null;
        this.videoCtx = null;
        this.isInitialized = false;
        this.animationId = null;
        this.isRendering = false; // 防止重复渲染
        
        // 游戏圆形
        this.circles = [];
        this.selectedCircles = [];
        this.touchedCircle = null;
        this.isProcessingMatch = false; // 防止重复处理匹配
        this.matchCooldown = false; // 匹配冷却期
        this.lastCircleCount = 0; // 上一帧的圆形数量，用于检测异常
        
        // 当前姿态数据
        this.currentPose = null;
        this.lastPoseTime = Date.now(); // 初始化为当前时间，避免启动时立即显示提示
        this.poseTimeout = 5000; // 5秒无姿态数据则清除（增加容错）
        this.showNoSkeletonMessage = false; // 是否显示无骨骼提示
        this.noSkeletonDelay = 5000; // 5秒后才显示无骨骼提示（增加延迟）
        
        // 性能控制
        this.lastRenderTime = 0;
        this.targetFPS = 30; // 限制帧率
        this.frameInterval = 1000 / this.targetFPS;
        
        // 赛博朋克配色
        this.cyberpunkColors = {
            primary: '#00ffff',      // 青色
            secondary: '#ff00ff',    // 品红
            accent: '#ffff00',       // 黄色
            neon1: '#00ff00',        // 霓虹绿
            neon2: '#ff0080',        // 霓虹粉
            neon3: '#8000ff',        // 霓虹紫
            background: 'rgba(10, 10, 30, 0.8)',
            skeleton: '#00ffff',
            joint: '#ff00ff',
            touchZone: 'rgba(0, 255, 255, 0.3)'
        };
        
        // 配置
        this.config = {
            circleRadius: 80,
            touchRadius: 100,
            jointRadius: 8,
            lineWidth: 4,
            glowIntensity: 20
        };
        
        // 回调
        this.onCircleTouched = null;
        this.onMatchFound = null;
    }

    // 初始化渲染器
    init(canvasId, videoCanvasId) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.warn('⚠️ 2D游戏渲染器已经初始化，跳过');
            return true;
        }
        
        try {
            // 获取游戏画布
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas ${canvasId} 不存在`);
            }
            this.ctx = this.canvas.getContext('2d');
            
            // 获取视频画布（用于显示摄像头和骨骼）
            this.videoCanvas = document.getElementById(videoCanvasId);
            if (this.videoCanvas) {
                this.videoCtx = this.videoCanvas.getContext('2d');
            }
            
            // 设置画布大小（只执行一次）
            this.resizeCanvas();
            
            // 移除resize事件监听，避免频繁触发
            // window.addEventListener('resize', () => this.resizeCanvas());
            
            this.isInitialized = true;
            console.log('✅ 2D游戏渲染器初始化成功');
            
            // 开始渲染循环
            this.startRenderLoop();
            
            return true;
        } catch (error) {
            console.error('❌ 2D游戏渲染器初始化失败:', error);
            return false;
        }
    }

    // 调整画布大小
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        if (this.videoCanvas) {
            this.videoCanvas.width = window.innerWidth;
            this.videoCanvas.height = window.innerHeight;
        }
    }

    // 创建游戏圆形（4个角落）
    createCircles(wordPairs) {
        // 防止在还有圆形时重复创建
        if (this.circles.length > 0) {
            console.warn('⚠️ 阻止重复创建圆形，当前还有', this.circles.length, '个圆形');
            return this.circles;
        }
        
        console.log('🔵 创建新圆形，单词数量:', wordPairs.length);
        
        this.circles = [];
        this.selectedCircles = [];
        this.isProcessingMatch = false;
        
        const margin = 120; // 距离边缘的距离
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // 四个角落的位置：左上、左下、右上、右下
        const positions = [
            { x: margin, y: margin },                    // 左上 - 单词1
            { x: margin, y: h - margin },                // 左下 - 单词2
            { x: w - margin, y: margin },                // 右上 - 图片1
            { x: w - margin, y: h - margin }             // 右下 - 图片2
        ];
        
        // 赛博朋克颜色
        const colors = [
            this.cyberpunkColors.primary,
            this.cyberpunkColors.neon1,
            this.cyberpunkColors.secondary,
            this.cyberpunkColors.neon2
        ];
        
        wordPairs.forEach((wordData, index) => {
            if (index < 4) {
                const isWord = index < 2; // 前两个是单词，后两个是图片/翻译
                
                this.circles.push({
                    id: index,
                    x: positions[index].x,
                    y: positions[index].y,
                    radius: this.config.circleRadius,
                    color: colors[index],
                    wordData: wordData,
                    isWord: isWord,
                    isSelected: false,
                    isTouched: false,
                    touchProgress: 0,
                    displayText: isWord ? wordData.word : wordData.translation,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        });
        
        return this.circles;
    }

    // 更新姿态数据
    updatePose(poseData) {
        if (poseData && poseData.bodyParts) {
            // 始终更新姿态数据和时间戳
            this.currentPose = poseData;
            this.lastPoseTime = Date.now();
        }
    }

    // 渲染循环
    startRenderLoop() {
        if (this.isRendering) return; // 防止重复启动
        this.isRendering = true;
        
        const render = (timestamp) => {
            if (!this.isRendering) return;
            
            // 帧率限制
            const elapsed = timestamp - this.lastRenderTime;
            if (elapsed >= this.frameInterval) {
                this.lastRenderTime = timestamp - (elapsed % this.frameInterval);
                
                try {
                    this.render();
                } catch (error) {
                    console.error('渲染错误:', error);
                }
            }
            
            this.animationId = requestAnimationFrame(render);
        };
        
        this.animationId = requestAnimationFrame(render);
    }

    // 主渲染函数
    render() {
        if (!this.ctx || !this.canvas) return;
        
        // 检测圆形数量异常变化
        if (this.lastCircleCount !== this.circles.length) {
            console.log(`⚡ 圆形数量变化: ${this.lastCircleCount} -> ${this.circles.length}`);
            this.lastCircleCount = this.circles.length;
        }
        
        const now = Date.now();
        const timeSinceLastPose = now - this.lastPoseTime;
        
        // 检查姿态数据是否超时（5秒）
        if (this.currentPose && timeSinceLastPose > this.poseTimeout) {
            this.currentPose = null;
            this.touchPoints = null;
        }
        
        // 判断是否显示无骨骼提示（延迟5秒显示，避免闪烁）
        this.showNoSkeletonMessage = !this.currentPose && timeSinceLastPose > this.noSkeletonDelay;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制半透明背景
        this.ctx.fillStyle = this.cyberpunkColors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制骨骼（添加安全检查）
        if (this.currentPose && this.currentPose.bodyParts) {
            try {
                this.drawSkeleton(this.currentPose);
            } catch (error) {
                // 静默处理错误
            }
        }
        
        // 只有在延迟后才显示提示信息（避免闪烁）
        if (this.showNoSkeletonMessage) {
            this.drawNoSkeletonMessage();
        }
        
        // 绘制圆形
        this.circles.forEach(circle => {
            if (circle) {
                this.drawCircle(circle);
            }
        });
        
        // 绘制调试信息（左上角显示当前状态）
        this.drawDebugInfo();
        
        // 检测触碰（只有在有姿态数据且不在冷却期时）
        if (this.currentPose && this.touchPoints && !this.matchCooldown) {
            this.detectTouches(this.currentPose);
        }
    }
    
    // 绘制调试信息（屏幕底部中间）
    drawDebugInfo() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.save();
        // 放在屏幕底部中间
        const boxWidth = 300;
        const boxHeight = 40;
        const x = (w - boxWidth) / 2;
        const y = h - boxHeight - 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`圆形: ${this.circles.length} | 冷却: ${this.matchCooldown ? '是' : '否'} | 处理: ${this.isProcessingMatch ? '是' : '否'}`, w / 2, y + 25);
        ctx.restore();
    }
    
    // 显示无骨骼检测提示
    drawNoSkeletonMessage() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('请站在摄像头前', this.canvas.width / 2, this.canvas.height / 2 - 30);
        ctx.font = '18px Arial';
        ctx.fillText('确保全身在画面中可见', this.canvas.width / 2, this.canvas.height / 2 + 10);
    }

    // 绘制赛博朋克风格骨骼
    drawSkeleton(poseData) {
        if (!poseData || !poseData.bodyParts) return;
        
        const parts = poseData.bodyParts;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // 转换坐标（MediaPipe返回0-1的归一化坐标，需要镜像）
        const toScreenCoord = (part) => {
            if (!part || part.visibility < 0.5) return null;
            return {
                x: (1 - part.x) * w,  // 镜像X坐标
                y: part.y * h
            };
        };
        
        // 获取各个关节点的屏幕坐标
        const joints = {
            head: toScreenCoord(parts.head),
            leftShoulder: toScreenCoord(parts.leftShoulder),
            rightShoulder: toScreenCoord(parts.rightShoulder),
            leftElbow: toScreenCoord(parts.leftElbow),
            rightElbow: toScreenCoord(parts.rightElbow),
            leftWrist: toScreenCoord(parts.leftWrist),
            rightWrist: toScreenCoord(parts.rightWrist),
            leftHip: toScreenCoord(parts.leftHip),
            rightHip: toScreenCoord(parts.rightHip),
            leftKnee: toScreenCoord(parts.leftKnee),
            rightKnee: toScreenCoord(parts.rightKnee),
            leftAnkle: toScreenCoord(parts.leftAnkle),
            rightAnkle: toScreenCoord(parts.rightAnkle)
        };
        
        // 绘制骨骼连接线
        this.ctx.strokeStyle = this.cyberpunkColors.skeleton;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.shadowColor = this.cyberpunkColors.skeleton;
        this.ctx.shadowBlur = this.config.glowIntensity;
        
        // 定义骨骼连接
        const connections = [
            // 躯干
            ['leftShoulder', 'rightShoulder'],
            ['leftShoulder', 'leftHip'],
            ['rightShoulder', 'rightHip'],
            ['leftHip', 'rightHip'],
            // 左臂
            ['leftShoulder', 'leftElbow'],
            ['leftElbow', 'leftWrist'],
            // 右臂
            ['rightShoulder', 'rightElbow'],
            ['rightElbow', 'rightWrist'],
            // 左腿
            ['leftHip', 'leftKnee'],
            ['leftKnee', 'leftAnkle'],
            // 右腿
            ['rightHip', 'rightKnee'],
            ['rightKnee', 'rightAnkle'],
            // 头部连接
            ['leftShoulder', 'head'],
            ['rightShoulder', 'head']
        ];
        
        // 绘制连接线
        connections.forEach(([from, to]) => {
            const p1 = joints[from];
            const p2 = joints[to];
            if (p1 && p2) {
                this.drawGlowLine(p1.x, p1.y, p2.x, p2.y, this.cyberpunkColors.skeleton);
            }
        });
        
        // 绘制关节点
        Object.entries(joints).forEach(([name, joint]) => {
            if (joint) {
                // 手和脚用特殊颜色（用于触碰检测）
                let color = this.cyberpunkColors.joint;
                let radius = this.config.jointRadius;
                
                if (name.includes('Wrist') || name.includes('Ankle')) {
                    color = this.cyberpunkColors.accent;
                    radius = this.config.jointRadius * 1.5;
                }
                
                this.drawGlowCircle(joint.x, joint.y, radius, color);
            }
        });
        
        // 保存触碰点位置供检测使用
        this.touchPoints = {
            leftHand: joints.leftWrist,
            rightHand: joints.rightWrist,
            leftFoot: joints.leftAnkle,
            rightFoot: joints.rightAnkle
        };
        
        // 重置阴影
        this.ctx.shadowBlur = 0;
    }

    // 绘制发光线条
    drawGlowLine(x1, y1, x2, y2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = this.config.glowIntensity;
        this.ctx.stroke();
    }

    // 绘制发光圆形
    drawGlowCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = this.config.glowIntensity;
        this.ctx.fill();
    }

    // 绘制游戏圆形
    drawCircle(circle) {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        // 脉冲动画
        const pulse = Math.sin(time * 2 + circle.pulsePhase) * 0.1 + 1;
        const radius = circle.radius * pulse;
        
        // 外圈发光效果
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = circle.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = circle.color;
        ctx.shadowBlur = 30;
        ctx.stroke();
        
        // 内圈
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
        
        // 根据状态设置颜色
        if (circle.isSelected) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.strokeStyle = '#ffff00';
        } else if (circle.isTouched) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.strokeStyle = '#00ffff';
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.strokeStyle = circle.color;
        }
        
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();
        
        // 触碰进度环
        if (circle.touchProgress > 0) {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, radius + 20, -Math.PI / 2, 
                   -Math.PI / 2 + (Math.PI * 2 * circle.touchProgress));
            ctx.strokeStyle = this.cyberpunkColors.accent;
            ctx.lineWidth = 6;
            ctx.shadowColor = this.cyberpunkColors.accent;
            ctx.shadowBlur = 20;
            ctx.stroke();
        }
        
        // 绘制文字
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 文字换行处理
        const text = circle.displayText;
        if (text.length > 8) {
            ctx.font = 'bold 16px Arial';
        }
        ctx.fillText(text, circle.x, circle.y);
        
        // 显示类型标签
        ctx.font = '12px Arial';
        ctx.fillStyle = circle.color;
        const label = circle.isWord ? '单词' : '翻译';
        ctx.fillText(label, circle.x, circle.y + radius - 20);
    }

    // 检测触碰
    detectTouches(poseData) {
        if (!this.touchPoints) return;
        
        const touchThreshold = this.config.touchRadius;
        
        // 检查每个触碰点（手和脚）
        const touchPointsArray = [
            { name: 'leftHand', point: this.touchPoints.leftHand },
            { name: 'rightHand', point: this.touchPoints.rightHand },
            { name: 'leftFoot', point: this.touchPoints.leftFoot },
            { name: 'rightFoot', point: this.touchPoints.rightFoot }
        ];
        
        this.circles.forEach(circle => {
            let isTouching = false;
            
            touchPointsArray.forEach(({ name, point }) => {
                if (!point) return;
                
                const distance = Math.sqrt(
                    Math.pow(point.x - circle.x, 2) + 
                    Math.pow(point.y - circle.y, 2)
                );
                
                if (distance < touchThreshold + circle.radius) {
                    isTouching = true;
                    
                    // 增加触碰进度
                    if (!circle.isSelected) {
                        circle.touchProgress += 0.03;
                        
                        if (circle.touchProgress >= 1) {
                            this.selectCircle(circle);
                        }
                    }
                }
            });
            
            circle.isTouched = isTouching;
            
            // 如果没有触碰，减少进度
            if (!isTouching && !circle.isSelected) {
                circle.touchProgress = Math.max(0, circle.touchProgress - 0.02);
            }
        });
    }

    // 选中圆形
    selectCircle(circle) {
        if (circle.isSelected) return;
        
        circle.isSelected = true;
        circle.touchProgress = 0;
        this.selectedCircles.push(circle);
        
        // 播放选择音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('select');
        }
        
        // 触发回调
        if (this.onCircleTouched) {
            this.onCircleTouched(circle);
        }
        
        console.log(`选中: ${circle.displayText} (${circle.isWord ? '单词' : '翻译'})`);
        
        // 检查是否选中了两个
        if (this.selectedCircles.length === 2) {
            this.checkMatch();
        }
    }

    // 检查匹配
    checkMatch() {
        if (this.selectedCircles.length !== 2) return;
        if (this.isProcessingMatch) return; // 防止重复处理
        
        this.isProcessingMatch = true;
        
        const [circle1, circle2] = this.selectedCircles;
        
        // 必须是一个单词和一个翻译
        if (circle1.isWord === circle2.isWord) {
            this.handleWrongMatch('请选择一个单词和一个翻译');
            return;
        }
        
        // 检查是否匹配
        if (circle1.wordData.word === circle2.wordData.word) {
            this.handleCorrectMatch(circle1, circle2);
        } else {
            this.handleWrongMatch('单词和翻译不匹配');
        }
    }

    // 处理正确匹配
    handleCorrectMatch(circle1, circle2) {
        console.log('✅ 正确匹配!', circle1.displayText, '+', circle2.displayText);
        
        // 启动冷却期，阻止任何新的触碰检测
        this.matchCooldown = true;
        
        // 播放正确音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('correct');
        }
        
        // 从数组中移除匹配的圆形
        const id1 = circle1.id;
        const id2 = circle2.id;
        this.circles = this.circles.filter(c => c.id !== id1 && c.id !== id2);
        this.selectedCircles = [];
        
        const remaining = this.circles.length;
        console.log(`🔢 剩余圆形数量: ${remaining}`);
        
        // 重置剩余圆形的状态
        this.circles.forEach(circle => {
            circle.isSelected = false;
            circle.isTouched = false;
            circle.touchProgress = 0;
        });
        
        // 触发回调
        if (this.onMatchFound) {
            this.onMatchFound({
                isCorrect: true,
                word: circle1.wordData.word,
                circles: [circle1, circle2],
                remaining: remaining
            });
        }
        
        // 2秒后结束冷却期，允许继续游戏
        setTimeout(() => {
            this.isProcessingMatch = false;
            this.matchCooldown = false;
            console.log('✅ 冷却期结束，可以继续选择');
        }, 2000);
    }

    // 处理错误匹配
    handleWrongMatch(reason) {
        console.log('❌ 错误匹配:', reason);
        
        // 播放错误音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('wrong');
        }
        
        // 重置处理标志
        this.isProcessingMatch = false;
        
        // 重置选中状态
        this.selectedCircles.forEach(circle => {
            circle.isSelected = false;
            circle.touchProgress = 0;
        });
        this.selectedCircles = [];
        
        // 触发回调
        if (this.onMatchFound) {
            this.onMatchFound({
                isCorrect: false,
                reason: reason
            });
        }
    }

    // 创建消失动画效果（简化版，避免独立动画循环）
    createDisappearEffect(circle) {
        // 简单的闪烁效果，不创建独立的动画循环
        // 避免内存泄漏和性能问题
        console.log(`✨ 圆形消失: ${circle.displayText}`);
    }

    // 清除所有圆形
    clearCircles() {
        this.circles = [];
        this.selectedCircles = [];
    }

    // 获取剩余圆形数量
    getRemainingCircles() {
        return this.circles.length;
    }

    // 停止渲染
    stop() {
        this.isRendering = false; // 先设置标志位
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // 清理资源
    cleanup() {
        this.stop();
        this.circles = [];
        this.selectedCircles = [];
        this.currentPose = null;
        this.touchPoints = null;
        this.isInitialized = false;
    }
}

// 创建全局实例
const game2DRenderer = new Game2DRenderer();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2DRenderer;
}
