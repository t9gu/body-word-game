// 游戏逻辑管理器
// 版本: v6.0 - 使用2D渲染器，支持触碰检测
console.log('✅ GameLogic v6.0 已加载');

class GameLogic {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTopic = null;
        this.currentWordPairs = [];
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.use2DRenderer = true; // 使用2D渲染器
        this.startTime = null;
        this.elapsedTime = 0;
        this.gameTimer = null;
        this.roundTimer = null;
        this.currentRound = 0;
        this.maxRounds = 10;
        this.selectionPhase = false;
        this.gestureTimeout = null;
        
        // 游戏配置
        this.config = {
            roundDuration: 30000, // 30秒每轮
            gestureTimeout: 3000,  // 3秒手势超时
            scorePerCorrect: 10,
            scoreBonus: 5,
            minConfidence: 0.6
        };
        
        // 回调函数
        this.onScoreUpdate = null;
        this.onGameStart = null;
        this.onGameEnd = null;
        this.onRoundStart = null;
        this.onRoundEnd = null;
        this.onCorrectMatch = null;
        this.onWrongMatch = null;
        this.onFeedback = null;
    }

    // 初始化游戏
    async init() {
        try {
            // 初始化音频管理器
            await audioManager.init();
            
            // 初始化2D游戏渲染器
            const rendererInitialized = game2DRenderer.init('gameCanvas', 'poseCanvas');
            if (!rendererInitialized) {
                throw new Error('2D渲染器初始化失败');
            }
            
            // 设置2D渲染器回调
            this.isStartingNextRound = false; // 防止重复启动下一轮
            
            game2DRenderer.onMatchFound = (result) => {
                console.log('📨 收到匹配回调:', result.isCorrect ? '正确' : '错误');
                
                if (result.isCorrect) {
                    this.correctCount++;
                    this.score += this.config.scorePerCorrect;
                    this.updateScore();
                    this.showFeedback('正确! 🎉', 'correct');
                    
                    // 使用回调中的remaining值，更可靠
                    const remaining = result.remaining !== undefined ? result.remaining : game2DRenderer.getRemainingCircles();
                    console.log(`📊 剩余圆形: ${remaining}, isStartingNextRound: ${this.isStartingNextRound}`);
                    
                    // 只有当所有圆形都匹配完且没有在启动下一轮时才启动
                    if (remaining === 0 && !this.isStartingNextRound) {
                        this.isStartingNextRound = true;
                        console.log('⏳ 准备开始下一轮（3秒后）...');
                        setTimeout(() => {
                            console.log('🚀 开始下一轮');
                            this.isStartingNextRound = false;
                            this.startNextRound();
                        }, 3000); // 增加到3秒延迟
                    }
                } else {
                    this.wrongCount++;
                    this.updateScore();
                    this.showFeedback('错误! ' + result.reason, 'wrong');
                }
            };
            
            // 设置姿态检测回调
            poseDetector.setPoseDetectedCallback(this.onPoseDetected.bind(this));
            poseDetector.setPoseLostCallback(this.onPoseLost.bind(this));
            
            this.isInitialized = true;
            console.log('✅ 游戏逻辑初始化成功');
            
            return true;
        } catch (error) {
            console.error('❌ 游戏逻辑初始化失败:', error);
            return false;
        }
    }

    // 开始游戏
    async startGame(topicId) {
        if (!this.isInitialized) {
            console.error('游戏未初始化');
            return false;
        }

        try {
            this.currentTopic = topicId;
            this.score = 0;
            this.correctCount = 0;
            this.wrongCount = 0;
            this.currentRound = 0;
            this.isPlaying = true;
            this.isPaused = false;
            this.startTime = Date.now();
            
            // 播放游戏开始音效
            audioManager.playSound('gameStart');
            
            // 开始背景音乐
            audioManager.startBackgroundMusic();
            
            // 开始游戏计时
            this.startGameTimer();
            
            // 开始第一轮
            await this.startNextRound();
            
            // 触发游戏开始回调
            if (this.onGameStart) {
                this.onGameStart({
                    topic: this.currentTopic,
                    maxRounds: this.maxRounds
                });
            }
            
            console.log('游戏开始');
            return true;
        } catch (error) {
            console.error('开始游戏失败:', error);
            return false;
        }
    }

    // 开始下一轮
    async startNextRound() {
        // 严格检查：如果还有圆形存在，不启动新轮
        const existingCircles = game2DRenderer.getRemainingCircles();
        if (existingCircles > 0) {
            console.warn(`⚠️ 阻止启动新轮：还有 ${existingCircles} 个圆形`);
            return;
        }
        
        if (!this.isPlaying || this.isPaused) return;
        
        this.currentRound++;
        console.log(`🎮 开始第 ${this.currentRound} 轮`);
        
        // 检查是否达到最大轮数
        if (this.currentRound > this.maxRounds) {
            this.endGame();
            return;
        }
        
        try {
            // 获取新的单词对（4个：2个单词配2个翻译）
            const allWords = getRandomWordPairs(this.currentTopic, 2);
            // 创建配对数组：[单词1, 单词2, 翻译1, 翻译2]
            this.currentWordPairs = [
                allWords[0], // 左上 - 单词1
                allWords[1], // 左下 - 单词2
                allWords[0], // 右上 - 翻译1（对应单词1）
                allWords[1]  // 右下 - 翻译2（对应单词2）
            ];
            
            // 使用2D渲染器创建圆形
            game2DRenderer.createCircles(this.currentWordPairs);
            
            // 开始选择阶段
            this.startSelectionPhase();
            
            // 触发轮次开始回调
            if (this.onRoundStart) {
                this.onRoundStart({
                    round: this.currentRound,
                    wordPairs: this.currentWordPairs
                });
            }
            
            console.log(`第${this.currentRound}轮开始`);
        } catch (error) {
            console.error('开始轮次失败:', error);
            // 停止游戏，防止错误累积
            this.endGame();
            alert('游戏初始化失败: ' + error.message + '\n\n请刷新页面重试。');
        }
    }

    // 开始选择阶段（2D模式下不使用计时器，由触碰检测控制）
    startSelectionPhase() {
        this.selectionPhase = true;
        // 2D渲染器模式下，不设置自动结束计时器
        // 匹配由触碰检测自动处理
        console.log('选择阶段开始');
    }

    // 结束选择阶段（2D模式下由渲染器回调触发）
    endSelectionPhase() {
        this.selectionPhase = false;
        console.log('选择阶段结束');
        // 2D模式下，匹配检测由渲染器处理，这里不需要额外逻辑
    }
    
    // 处理姿态检测
    onPoseDetected(poseData) {
        if (!this.isPlaying || this.isPaused) return;
        
        // 将姿态数据传递给2D渲染器（渲染器会处理骨骼显示和触碰检测）
        game2DRenderer.updatePose(poseData);
    }

    // 处理姿态丢失
    onPoseLost() {
        // 清除姿态数据
        game2DRenderer.updatePose(null);
    }

    // 处理手势选择
    handleGestureSelection(gestures) {
        if (this.gestureTimeout) return; // 防止重复触发
        
        // 左手举手选择左侧球体
        if (gestures.leftHandUp) {
            this.selectBallByGesture('left');
        }
        
        // 右手举手选择右侧球体
        if (gestures.rightHandUp) {
            this.selectBallByGesture('right');
        }
        
        // 双手举手确认选择
        if (gestures.bothHandsUp) {
            this.confirmSelection();
        }
    }

    // 根据手势选择球体
    selectBallByGesture(side) {
        const availableBalls = threeSceneManager.wordBalls.filter(ball => 
            !ball.userData.isSelected
        );
        
        let targetBall = null;
        
        if (side === 'left') {
            // 选择左侧的球体（索引0或1）
            targetBall = availableBalls.find(ball => ball.userData.index < 2);
        } else if (side === 'right') {
            // 选择右侧的球体（索引2或3）
            targetBall = availableBalls.find(ball => ball.userData.index >= 2);
        }
        
        if (targetBall) {
            const success = threeSceneManager.selectBall(targetBall.userData.index);
            if (success) {
                audioManager.playSound('select');
                this.showFeedback('选择了一个球体', 'info');
                
                // 检查是否已选择两个球体
                const selectedBalls = threeSceneManager.getSelectedBalls();
                if (selectedBalls.length === 2) {
                    setTimeout(() => this.confirmSelection(), 500);
                }
            }
        }
        
        // 设置手势超时
        this.setGestureTimeout();
    }

    // 确认选择
    confirmSelection() {
        if (!this.selectionPhase) return;
        
        this.endSelectionPhase();
    }

    // 设置手势超时
    setGestureTimeout() {
        if (this.gestureTimeout) {
            clearTimeout(this.gestureTimeout);
        }
        
        this.gestureTimeout = setTimeout(() => {
            this.gestureTimeout = null;
        }, this.config.gestureTimeout);
    }

    // 检查匹配
    checkMatch(selectedBalls) {
        if (!selectedBalls || selectedBalls.length !== 2) return;
        
        const ball1 = selectedBalls[0];
        const ball2 = selectedBalls[1];
        
        // 安全检查 - getSelectedBalls()返回的是userData对象本身
        if (!ball1 || !ball2 || ball1.index === undefined || ball2.index === undefined) {
            console.warn('选中的球体数据无效');
            return;
        }
        
        // 检查是否是单词和图片的匹配
        // 左侧球体(index 0,1)是单词，右侧球体(index 2,3)是图片
        const isWordImageMatch = (ball1.index < 2 && ball2.index >= 2) ||
                                 (ball1.index >= 2 && ball2.index < 2);
        
        if (!isWordImageMatch) {
            this.handleWrongMatch('请选择一个单词和一个图片');
            return;
        }
        
        // 检查单词是否匹配
        const wordData1 = ball1.wordData;
        const wordData2 = ball2.wordData;
        
        if (!wordData1 || !wordData2) {
            console.warn('单词数据无效');
            return;
        }
        
        if (wordData1.word === wordData2.word) {
            this.handleCorrectMatch(selectedBalls);
        } else {
            this.handleWrongMatch('单词不匹配');
        }
    }

    // 处理正确匹配
    handleCorrectMatch(selectedBalls) {
        this.correctCount++;
        this.score += this.config.scorePerCorrect;
        
        // 播放正确音效
        audioManager.playSound('correct');
        
        // 显示反馈
        this.showFeedback('正确! 🎉', 'correct');
        
        // 移除匹配的球体 - selectedBalls已经是userData对象
        const ballIndices = selectedBalls.map(ball => ball.index);
        threeSceneManager.removeBalls(ballIndices);
        
        // 更新分数显示
        this.updateScore();
        
        // 触发正确匹配回调
        if (this.onCorrectMatch) {
            this.onCorrectMatch({
                balls: selectedBalls,
                score: this.score,
                correctCount: this.correctCount
            });
        }
        
        console.log('正确匹配');
    }

    // 处理错误匹配
    handleWrongMatch(reason) {
        this.wrongCount++;
        
        // 播放错误音效
        audioManager.playSound('wrong');
        
        // 显示反馈
        this.showFeedback(`错误! ${reason}`, 'wrong');
        
        // 清除选择
        threeSceneManager.clearAllSelected();
        
        // 更新分数显示
        this.updateScore();
        
        // 触发错误匹配回调
        if (this.onWrongMatch) {
            this.onWrongMatch({
                reason: reason,
                score: this.score,
                wrongCount: this.wrongCount
            });
        }
        
        console.log('错误匹配:', reason);
    }

    // 显示反馈信息
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message show ${type}`;
        
        // 自动隐藏
        setTimeout(() => {
            feedbackElement.className = 'feedback-message';
        }, 2000);
        
        // 触发反馈回调
        if (this.onFeedback) {
            this.onFeedback({ message, type });
        }
    }

    // 更新分数
    updateScore() {
        // 更新UI
        const scoreElement = document.getElementById('scoreValue');
        const correctElement = document.getElementById('correctCount');
        const wrongElement = document.getElementById('wrongCount');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (correctElement) correctElement.textContent = this.correctCount;
        if (wrongElement) wrongElement.textContent = this.wrongCount;
        
        // 触发分数更新回调
        if (this.onScoreUpdate) {
            this.onScoreUpdate({
                score: this.score,
                correctCount: this.correctCount,
                wrongCount: this.wrongCount
            });
        }
    }

    // 开始游戏计时器
    startGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (!this.isPaused && this.isPlaying) {
                this.elapsedTime = Date.now() - this.startTime;
                this.updateTimer();
            }
        }, 1000);
    }

    // 更新计时器显示
    updateTimer() {
        const timeElement = document.getElementById('timeValue');
        if (timeElement) {
            const seconds = Math.floor(this.elapsedTime / 1000);
            timeElement.textContent = seconds;
        }
    }

    // 暂停游戏
    pauseGame() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        
        // 暂停音频
        audioManager.suspend();
        
        // 暂停姿态检测
        poseDetector.stopDetection();
        
        console.log('游戏暂停');
    }

    // 恢复游戏
    resumeGame() {
        if (!this.isPlaying || !this.isPaused) return;
        
        this.isPaused = false;
        
        // 恢复音频
        audioManager.resume();
        
        // 恢复姿态检测
        poseDetector.startDetection();
        
        console.log('游戏恢复');
    }

    // 结束游戏
    endGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.selectionPhase = false;
        
        // 清除计时器
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }
        
        if (this.gestureTimeout) {
            clearTimeout(this.gestureTimeout);
            this.gestureTimeout = null;
        }
        
        // 停止音频
        audioManager.stopBackgroundMusic();
        
        // 停止姿态检测
        poseDetector.stopDetection();
        
        // 清理2D渲染器
        game2DRenderer.clearCircles();
        
        // 播放结束音效
        audioManager.playSound('levelComplete');
        
        // 计算统计数据
        const stats = this.calculateStats();
        
        // 触发游戏结束回调
        if (this.onGameEnd) {
            this.onGameEnd(stats);
        }
        
        console.log('游戏结束', stats);
    }

    // 计算游戏统计数据
    calculateStats() {
        const totalAttempts = this.correctCount + this.wrongCount;
        const accuracy = totalAttempts > 0 ? (this.correctCount / totalAttempts * 100).toFixed(1) : 0;
        const timeInSeconds = Math.floor(this.elapsedTime / 1000);
        
        return {
            score: this.score,
            correctCount: this.correctCount,
            wrongCount: this.wrongCount,
            totalAttempts: totalAttempts,
            accuracy: parseFloat(accuracy),
            timeInSeconds: timeInSeconds,
            roundsCompleted: this.currentRound - 1,
            topic: this.currentTopic
        };
    }

    // 设置回调函数
    setCallback(event, callback) {
        switch (event) {
            case 'scoreUpdate':
                this.onScoreUpdate = callback;
                break;
            case 'gameStart':
                this.onGameStart = callback;
                break;
            case 'gameEnd':
                this.onGameEnd = callback;
                break;
            case 'roundStart':
                this.onRoundStart = callback;
                break;
            case 'roundEnd':
                this.onRoundEnd = callback;
                break;
            case 'correctMatch':
                this.onCorrectMatch = callback;
                break;
            case 'wrongMatch':
                this.onWrongMatch = callback;
                break;
            case 'feedback':
                this.onFeedback = callback;
                break;
            default:
                console.warn(`未知事件类型: ${event}`);
        }
    }

    // 获取游戏状态
    getGameState() {
        return {
            isInitialized: this.isInitialized,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            currentTopic: this.currentTopic,
            score: this.score,
            correctCount: this.correctCount,
            wrongCount: this.wrongCount,
            currentRound: this.currentRound,
            elapsedTime: this.elapsedTime,
            selectionPhase: this.selectionPhase
        };
    }

    // 清理资源
    cleanup() {
        this.endGame();
        
        // 清理各个管理器
        if (audioManager) {
            audioManager.cleanup();
        }
        
        if (poseDetector) {
            poseDetector.cleanup();
        }
        
        if (threeSceneManager) {
            threeSceneManager.cleanup();
        }
        
        // 重置状态
        this.isInitialized = false;
        this.currentTopic = null;
        this.currentWordPairs = [];
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.currentRound = 0;
        
        // 清除回调
        this.onScoreUpdate = null;
        this.onGameStart = null;
        this.onGameEnd = null;
        this.onRoundStart = null;
        this.onRoundEnd = null;
        this.onCorrectMatch = null;
        this.onWrongMatch = null;
        this.onFeedback = null;
        
        console.log('游戏逻辑已清理');
    }
}

// 创建全局游戏逻辑实例
const gameLogic = new GameLogic();

// 导出游戏逻辑
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLogic;
}
