// 音频管理器 - 使用Web Audio API创建音效
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.sounds = {};
        this.backgroundMusic = null;
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.3;
    }

    // 初始化音频上下文
    async init() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建音效
            await this.createSounds();
            
            this.isInitialized = true;
            console.log('音频系统初始化成功');
        } catch (error) {
            console.error('音频系统初始化失败:', error);
        }
    }

    // 创建各种音效
    async createSounds() {
        // 正确答案音效 - 欢快的上升音调
        this.sounds.correct = () => this.createCorrectSound();
        
        // 错误答案音效 - 下降音调
        this.sounds.wrong = () => this.createWrongSound();
        
        // 选择音效 - 轻柔的点击声
        this.sounds.select = () => this.createSelectSound();
        
        // 完成关卡音效 - 胜利旋律
        this.sounds.levelComplete = () => this.createLevelCompleteSound();
        
        // 游戏开始音效
        this.sounds.gameStart = () => this.createGameStartSound();
        
        // 倒计时音效
        this.sounds.tick = () => this.createTickSound();
        
        // 背景音乐
        this.createBackgroundMusic();
    }

    // 创建正确答案音效
    createCorrectSound() {
        if (!this.audioContext) return;
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 设置音调
        oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator1.frequency.exponentialRampToValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
        
        oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
        oscillator2.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + 0.1); // G5
        
        // 设置音量包络
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.5);
        oscillator2.stop(this.audioContext.currentTime + 0.5);
    }

    // 创建错误答案音效
    createWrongSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 设置音调 - 下降的低音
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        // 设置音量包络
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    // 创建选择音效
    createSelectSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 创建关卡完成音效
    createLevelCompleteSound() {
        if (!this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((frequency, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 100);
        });
    }

    // 创建游戏开始音效
    createGameStartSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }

    // 创建倒计时音效
    createTickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // 创建背景音乐
    createBackgroundMusic() {
        if (!this.audioContext) return;
        
        // 创建简单的循环背景音乐
        const playBackgroundNote = () => {
            if (!this.backgroundMusic || !this.isInitialized) return;
            
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66]; // C4, D4, E4, F4, G4, F4, E4, D4
            const noteIndex = Math.floor(Math.random() * notes.length);
            const frequency = notes[noteIndex];
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1);
            
            // 随机间隔播放下一个音符
            const nextInterval = 500 + Math.random() * 1000;
            setTimeout(playBackgroundNote, nextInterval);
        };
        
        this.backgroundMusic = { play: playBackgroundNote };
    }

    // 播放音效
    playSound(soundName) {
        if (!this.isInitialized || !this.sounds[soundName]) {
            console.warn(`音效 ${soundName} 不存在或音频系统未初始化`);
            return;
        }
        
        try {
            this.sounds[soundName]();
        } catch (error) {
            console.error(`播放音效 ${soundName} 失败:`, error);
        }
    }

    // 开始播放背景音乐
    startBackgroundMusic() {
        if (this.backgroundMusic && this.isInitialized) {
            this.backgroundMusic.play();
        }
    }

    // 停止背景音乐
    stopBackgroundMusic() {
        this.backgroundMusic = null;
    }

    // 设置主音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    // 设置音效音量
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    // 设置音乐音量
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    // 更新所有音量
    updateVolumes() {
        // 这里可以添加实际的音量控制逻辑
    }

    // 暂停音频上下文
    suspend() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    // 恢复音频上下文
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // 清理资源
    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isInitialized = false;
        this.sounds = {};
        this.backgroundMusic = null;
    }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager();

// 导出音频管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
