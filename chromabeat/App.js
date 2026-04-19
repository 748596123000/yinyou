import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable, ScrollView, SafeAreaView, Platform } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import MainMenuScreen from './MainMenuScreen';
import GameplayScreen from './GameplayScreen';
import ResultScreen from './ResultScreen';

// 安全获取屏幕尺寸
const getSafeDimensions = () => {
  try {
    const { width, height } = Dimensions.get('window');
    return {
      width: width > 0 ? width : 375,
      height: height > 0 ? height : 812,
    };
  } catch (e) {
    return { width: 375, height: 812 };
  }
};

const { width: safeWidth, height: safeHeight } = getSafeDimensions();
const centerX = safeWidth / 2;
const centerY = safeHeight / 2;
const trackCount = 8;
const trackAngle = (Math.PI * 2) / trackCount;

// 音乐文件配置
const songs = [
  {
    id: 1,
    name: '爱琴海',
    artist: '周杰伦',
    filename: '周杰伦 - 爱琴海.mp3',
    path: Platform.select({
      ios: null,
      android: null,
      default: 'E:/music/周杰伦 - 爱琴海.mp3',
    }),
    bpm: 88,
    theme: 'blue',
    duration: 254,
    isLocalFile: false,
  },
];

const DEFAULT_BPM = 120;

// 颜色主题配置
const colorThemes = {
  red: { primary: '#FF4444', dark: '#8B0000', medium: '#DC143C', light: '#FF8888', extremeLight: '#FFB3B3' },
  blue: { primary: '#44AAFF', dark: '#00008B', medium: '#1E90FF', light: '#88CCFF', extremeLight: '#B3E0FF' },
  purple: { primary: '#AA44FF', dark: '#4B0082', medium: '#8A2BE2', light: '#CC88FF', extremeLight: '#E6B3FF' },
  green: { primary: '#44CC44', dark: '#006400', medium: '#228B22', light: '#88EE88', extremeLight: '#B3FFB3' },
  gold: { primary: '#FFD700', dark: '#8B6914', medium: '#DAA520', light: '#FFEC88', extremeLight: '#FFF5CC' },
  orange: { primary: '#FFAA44', dark: '#8B4500', medium: '#FF8C00', light: '#FFCC88', extremeLight: '#FFE0BB' },
  cyan: { primary: '#44EEDD', dark: '#006666', medium: '#00CED1', light: '#88FFEE', extremeLight: '#BBFFF5' },
  pink: { primary: '#FF88CC', dark: '#8B3A62', medium: '#FF69B4', light: '#FFBBDD', extremeLight: '#FFDDEE' },
  darkRed: { primary: '#993344', dark: '#330000', medium: '#660022', light: '#CC6677', extremeLight: '#DDAABB' },
  warmYellow: { primary: '#FFDAB9', dark: '#8B7355', medium: '#D2B48C', light: '#FFEEDD', extremeLight: '#FFF5EE' },
};

// 错误颜色配置
const errorColors = {
  red: ['#44AAFF', '#44CC44'],
  blue: ['#FF4444', '#44CC44'],
  purple: ['#FF4444', '#44AAFF'],
  green: ['#FF4444', '#44AAFF'],
  gold: ['#44AAFF', '#AA44FF'],
  orange: ['#44AAFF', '#44CC44'],
  cyan: ['#FF4444', '#AA44FF'],
  pink: ['#44AAFF', '#44CC44'],
  darkRed: ['#44AAFF', '#44CC44'],
  warmYellow: ['#44AAFF', '#FF4444'],
};

// 难度配置
const difficultyConfig = {
  beginner: {
    label: '入门',
    sublabel: '4方向 | 慢速 | 简单',
    directions: 4,
    rippleTypes: ['basic'],
    speed: [0.15, 0.25],
    circleEnabled: false,
    colorDepth: 'dark',
    errorColorCount: 2,
    spawnInterval: 1800,
    maxSimultaneousRipples: 4,
    uiScale: 1.2,
    colorTone: 'pastel',
    timingWindow: 0.8,
    showTutorialHints: true,
  },
  intermediate: {
    label: '进阶',
    sublabel: '8方向 | 标准 | 双击',
    directions: 8,
    rippleTypes: ['basic', 'big'],
    speed: [0.3, 0.45],
    circleEnabled: false,
    colorDepth: 'medium',
    errorColorCount: 3,
    spawnInterval: 1200,
    maxSimultaneousRipples: 6,
    uiScale: 1.0,
    colorTone: 'standard',
    timingWindow: 0.6,
    showTutorialHints: false,
  },
  expert: {
    label: '大师',
    sublabel: '8方向 | 快速 | 全类型',
    directions: 8,
    rippleTypes: ['basic', 'big', 'ring'],
    speed: [0.45, 0.65],
    circleEnabled: true,
    colorDepth: 'light',
    errorColorCount: 5,
    spawnInterval: 800,
    maxSimultaneousRipples: 10,
    uiScale: 0.95,
    colorTone: 'neon',
    timingWindow: 0.45,
    showTutorialHints: false,
  },
  nightmare: {
    label: '噩梦',
    sublabel: '8方向 | 极速 | 弹幕模式',
    directions: 8,
    rippleTypes: ['all'],
    speed: [0.65, 0.9],
    circleEnabled: true,
    colorDepth: 'extremeLight',
    errorColorCount: 7,
    spawnInterval: 450,
    maxSimultaneousRipples: 15,
    uiScale: 0.9,
    colorTone: 'intense',
    timingWindow: 0.3,
    showTutorialHints: false,
    enableVignette: true,
    enableScreenShake: true,
    comboPressureMode: true,
  },
};

// 波纹类（升级版 - 支持反弹机制）
class Ripple {
  constructor(id, direction, isCorrect, size, speed, type = 'basic', hitCount = 1, ringId = null) {
    this.id = id;
    this.direction = direction;
    this.isCorrect = isCorrect;
    this.size = size;
    this.speed = speed;
    this.position = isCorrect ? 0 : 1;
    this.type = type;
    this.hitCount = hitCount;
    this.currentHits = 0;
    this.trailPositions = [];
    this.ringId = ringId;
    this.hasBouncedBack = false;
    this.bounceSpeed = speed * 0.7;
    this.isTimedOut = false;
    this.lastHitTime = null;
  }

  update(deltaTime) {
    if (this.trailPositions.length >= 3) {
      this.trailPositions.shift();
    }
    this.trailPositions.push(this.position);

    if (this.isCorrect) {
      this.position += this.speed * deltaTime;
      return this.position <= 1;
    } else {
      if (!this.hasBouncedBack) {
        this.position -= this.speed * deltaTime;

        if (this.position <= 0.15) {
          this.hasBouncedBack = true;
        }

        return this.position >= 0;
      } else {
        this.position += this.bounceSpeed * deltaTime;
        return this.position <= 1;
      }
    }
  }
}

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>⚠️ 应用出错</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || '未知错误'}
          </Text>
          <Pressable
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorStyles.buttonText}>重试</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#44AAFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// 主游戏组件
const ChromaBeatGame = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [purity, setPurity] = useState(100);
  const [ripples, setRipples] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [songProgress, setSongProgress] = useState(0);
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [touchPath, setTouchPath] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [showPurgeEffect, setShowPurgeEffect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(songs[0].bpm);

  const [stats, setStats] = useState({
    totalCorrectRipples: 0,
    absorbedCorrect: 0,
    totalErrorRipples: 0,
    repelledError: 0,
    circleSuccesses: 0,
    perfectHits: 0,
    totalHits: 0,
  });

  const [ballScale, setBallScale] = useState(1);
  const [ballGlow, setBallGlow] = useState(1);
  const [isBallPressed, setIsBallPressed] = useState(false);

  // 新增系统状态
  const [pendingBigRipple, setPendingBigRipple] = useState(null);
  const BIG_RIPPLE_TIMEOUT = 1500;
  const [purgeEnergy, setPurgeEnergy] = useState(0);
  const [isPurgeReady, setIsPurgeReady] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const INVINCIBILITY_DURATION = 2500;
  const [circleType, setCircleType] = useState('normal');
  const [circleMessage, setCircleMessage] = useState('PURGE!');

  // 粒子系统状态
  const [ballParticles, setBallParticles] = useState([]);
  const [hitEffects, setHitEffects] = useState([]);
  const [comboExplosions, setComboExplosions] = useState([]);
  const [purgeReadyParticles, setPurgeReadyParticles] = useState([]);
  const [showComboText, setShowComboText] = useState({ text: '', visible: false, timestamp: 0 });
  const prevPurgeReady = useRef(false);

  const rippleIdCounter = useRef(0);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const soundRef = useRef(null);
  const contaminationParticlesRef = useRef(null);
  const purgeRef = useRef(null);
  const invincibleTimerRef = useRef(null);
  const bigRippleTimerRef = useRef(null);

  // 全局错误处理
  useEffect(() => {
    if (__DEV__) {
      console.log('📱 ChromaBeat 启动中...');
      console.log('📐 屏幕尺寸:', safeWidth, 'x', safeHeight);
      console.log('🎵 当前平台:', Platform.OS);
    }
  }, []);

  // 中心球动画
  useEffect(() => {
    const pulseAnimation = setInterval(() => {
      setBallScale(prev => prev === 1 ? 1.1 : 1);
    }, 500);

    const glowAnimation = setInterval(() => {
      setBallGlow(prev => prev === 1 ? 1.2 : 1);
    }, 1000);

    return () => {
      clearInterval(pulseAnimation);
      clearInterval(glowAnimation);
    };
  }, []);

  // 充能系统计时器
  useEffect(() => {
    if (gameActive) {
      purgeRef.current = setInterval(() => {
        setPurgeEnergy(prev => {
          let chargeRate = 0.5;
          if (purity > 90) chargeRate = 2;
          else if (purity > 70) chargeRate = 1;

          const newEnergy = Math.min(100, prev + chargeRate);

          if (newEnergy >= 100 && !isPurgeReady) {
            setIsPurgeReady(true);
            setBallGlow(1.5);
            setTimeout(() => setBallGlow(1.2), 1000);
          }

          return newEnergy;
        });
      }, 1000);

      return () => {
        if (purgeRef.current) clearInterval(purgeRef.current);
      };
    }
  }, [gameActive, purity]);

  // 粒子自动清理机制 - 防止内存泄漏
  useEffect(() => {
    if (!gameActive) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();

      setHitEffects(prev =>
        prev.filter(effect => now - effect.createdAt < effect.duration)
      );

      setComboExplosions(prev =>
        prev.filter(particle => now - particle.createdAt < particle.duration)
      );
    }, 500);

    return () => clearInterval(cleanupInterval);
  }, [gameActive]);

  // 游戏循环
  useEffect(() => {
    if (gameActive && !hasError) {
      try {
        const config = difficultyConfig[selectedDifficulty];
        const beatInterval = currentBPM > 0 ? (60000 / currentBPM) : config.spawnInterval;

        let lastBeatTime = 0;
        let beatCount = 0;

        const gameLoop = (timestamp) => {
          try {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            // 检查错误波纹反弹造成的污染
            checkBounceContamination();

            setRipples(prevRipples => {
              const updatedRipples = prevRipples.filter(ripple => ripple.update(deltaTime));
              return updatedRipples;
            });

            const elapsed = timestamp - lastBeatTime;
            if (elapsed >= beatInterval) {
              lastBeatTime = timestamp;
              beatCount++;

              generateRipple();

              if (beatCount % 4 === 0 && config.rippleTypes.includes('big')) {
                setTimeout(() => generateRipple(), beatInterval * 0.3);
              }

              if (beatCount % 8 === 0 && config.rippleTypes.includes('ring')) {
                setTimeout(() => generateRipple(), beatInterval * 0.5);
              }
            }

            gameLoopRef.current = requestAnimationFrame(gameLoop);
          } catch (loopError) {
            console.error('Game loop error:', loopError);
          }
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
          if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
          }
        };
      } catch (setupError) {
        console.error('Game setup error:', setupError);
        setHasError(true);
        setErrorMessage(setupError.message);
      }
    }
  }, [gameActive, selectedDifficulty, currentBPM, hasError]);

  // 检查错误波纹反弹污染
  const checkBounceContamination = () => {
    setRipples(prevRipples => {
      let contaminationTriggered = false;

      const updatedRipples = prevRipples.map(ripple => {
        if (!ripple.isCorrect && !ripple.hasBouncedBack && ripple.position <= 0.15 && !isInvincible) {
          contaminationTriggered = true;
          return { ...ripple, hasBouncedBack: true };
        }
        return ripple;
      });

      if (contaminationTriggered) {
        setPurity(prev => Math.max(0, prev - 8));
        console.log('☠️ 错误波纹反弹造成污染！-8%纯净度');
      }

      return updatedRipples;
    });
  };

  // 生成波纹
  const generateRipple = () => {
    try {
      const config = difficultyConfig[selectedDifficulty];

      if (ripples.length >= config.maxSimultaneousRipples) {
        return;
      }

      const direction = Math.floor(Math.random() * config.directions);
      const isCorrect = Math.random() > 0.3;

      let type = 'basic';
      if (config.rippleTypes.length > 1) {
        const typeIndex = Math.floor(Math.random() * config.rippleTypes.length);
        type = config.rippleTypes[typeIndex];
        if (config.rippleTypes.includes('all')) {
          const types = ['basic', 'big', 'ring'];
          type = types[Math.floor(Math.random() * types.length)];
        }
      }

      let size, speed, hitCount;
      if (type === 'big') {
        size = 30 + Math.random() * 15;
        speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]) * 0.7;
        hitCount = 2;
      } else if (type === 'ring') {
        size = 20 + Math.random() * 10;
        speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
        hitCount = 1;
      } else {
        size = isCorrect ? 20 + Math.random() * 10 : 15 + Math.random() * 5;
        speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
        hitCount = 1;
      }

      if (type === 'ring') {
        const ringDirections = [];
        const numDirections = 3 + Math.floor(Math.random() * 3);
        const ringId = `ring-${Date.now()}`;

        for (let i = 0; i < numDirections; i++) {
          ringDirections.push(Math.floor(Math.random() * config.directions));
        }

        ringDirections.forEach(dir => {
          setRipples(prevRipples => [
            ...prevRipples,
            new Ripple(rippleIdCounter.current++, dir, true, size, speed, 'ring', hitCount, ringId)
          ]);
        });

        setStats(prev => ({ ...prev, totalCorrectRipples: prev.totalCorrectRipples + numDirections }));
      } else {
        const newRipple = new Ripple(rippleIdCounter.current++, direction, isCorrect, size, speed, type, hitCount);

        if (isCorrect) {
          setStats(prev => ({ ...prev, totalCorrectRipples: prev.totalCorrectRipples + 1 }));
        } else {
          setStats(prev => ({ ...prev, totalErrorRipples: prev.totalErrorRipples + 1 }));
        }

        setRipples(prevRipples => [...prevRipples, newRipple]);
      }
    } catch (genError) {
      console.error('Generate ripple error:', genError);
    }
  };

  // 计算触摸方向
  const calculateDirection = (x, y, directions = 8) => {
    try {
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx);
      let normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
      const angleStep = (Math.PI * 2) / directions;
      normalizedAngle += angleStep / 2;
      if (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;
      return Math.floor(normalizedAngle / angleStep);
    } catch (e) {
      return 0;
    }
  };

  // 计算触摸距离
  const calculateDistance = (x, y) => {
    try {
      const dx = x - centerX;
      const dy = y - centerY;
      return Math.sqrt(dx * dx + dy * dy);
    } catch (e) {
      return 0;
    }
  };

  // 计算触摸路径的总弧度
  const calculateTotalArc = (path) => {
    try {
      if (!path || path.length < 2) return 0;

      let totalArc = 0;
      for (let i = 1; i < path.length; i++) {
        const prev = path[i - 1];
        const curr = path[i];

        const prevAngle = Math.atan2(prev.y, prev.x);
        const currAngle = Math.atan2(curr.y, curr.x);

        let angleDiff = currAngle - prevAngle;

        if (angleDiff > Math.PI) {
          angleDiff -= 2 * Math.PI;
        } else if (angleDiff < -Math.PI) {
          angleDiff += 2 * Math.PI;
        }

        totalArc += Math.abs(angleDiff);
      }

      return totalArc * (180 / Math.PI);
    } catch (e) {
      return 0;
    }
  };

  // 处理滑动手势（升级版）
  const handleSwipe = (event) => {
    if (!gameActive || hasError) return;

    try {
      const { x, y, translationX, translationY } = event;
      const startDistance = calculateDistance(x - translationX, y - translationY);
      const endDistance = calculateDistance(x, y);
      const config = difficultyConfig[selectedDifficulty];
      const direction = calculateDirection(x, y, config.directions);

      const isInward = endDistance < startDistance;

      setRipples(prevRipples => {
        const hitRippleIndex = prevRipples.findIndex(ripple =>
          ripple.direction === direction &&
          Math.abs(ripple.position - (endDistance / (Math.min(safeWidth, safeHeight) / 2))) < 0.15
        );

        if (hitRippleIndex !== -1) {
          const hitRipple = prevRipples[hitRippleIndex];

          // 大团波纹双击逻辑
          if (hitRipple.type === 'big') {
            if (hitRipple.currentHits === 0) {
              // 第一次滑动成功
              const updatedRipple = {
                ...hitRipple,
                currentHits: 1,
                lastHitTime: Date.now()
              };

              // 设置待处理状态
              setPendingBigRipple({
                id: hitRipple.id,
                index: hitRippleIndex,
                deadline: Date.now() + BIG_RIPPLE_TIMEOUT
              });

              // 启动超时计时器
              bigRippleTimerRef.current = setTimeout(() => {
                setPendingBigRipple(prev => {
                  if (prev && prev.id === hitRipple.id && Date.now() > prev.deadline) {
                    console.log('⏰ 大团波纹超时！');
                    setPurity(p => Math.max(0, p - 3));

                    // 视觉反馈：超时标记
                    setRipples(r => r.map((rpl, idx) =>
                      idx === hitRippleIndex ? { ...rpl, isTimedOut: true } : rpl
                    ));

                    setTimeout(() => {
                      setRipples(r => r.map((rpl, idx) =>
                        idx === hitRippleIndex ? { ...rpl, isTimedOut: false, currentHits: 0 } : rpl
                      ));
                    }, 500);

                    return null;
                  }
                  return prev;
                });
              }, BIG_RIPPLE_TIMEOUT);

              const newRipples = [...prevRipples];
              newRipples[hitRippleIndex] = updatedRipple;
              return newRipples;

            } else if (hitRipple.currentHits >= 1) {
              // 第二次滑动成功！完全吸收/弹开
              clearTimeout(bigRippleTimerRef.current);
              setPendingBigRipple(null);

              const newCombo = combo + 1;
              setCombo(newCombo);
              setMaxCombo(prev => Math.max(prev, newCombo));
              setPurity(prev => Math.min(100, prev + 8));
              setScore(prev => prev + 150 * (newCombo));

              // 充能加成
              setPurgeEnergy(prev => Math.min(100, prev + 3));

              if (hitRipple.isCorrect) {
                setStats(prev => ({
                  ...prev,
                  absorbedCorrect: prev.absorbedCorrect + 1,
                  totalHits: prev.totalHits + 1
                }));
              } else {
                setStats(prev => ({
                  ...prev,
                  repelledError: prev.repelledError + 1,
                  totalHits: prev.totalHits + 1
                }));
              }

              return prevRipples.filter((_, index) => index !== hitRippleIndex);
            }
          }

          // 普通波纹和大团波纹第二次滑动后的通用逻辑
          if ((isInward && hitRipple.isCorrect) || (!isInward && !hitRipple.isCorrect)) {
            const newCombo = combo + 1;
            setCombo(newCombo);
            setMaxCombo(prev => Math.max(prev, newCombo));
            setPurity(prev => Math.min(100, prev + 5));

            const isPerfect = Math.abs(hitRipple.position - 0.5) < 0.08;

            const baseScore = 100 * (newCombo);
            const finalScore = isPerfect ? baseScore * 1.5 : baseScore;
            setScore(prev => prev + finalScore);

            // 充能加成
            setPurgeEnergy(prev => Math.min(100, prev + (hitRipple.isCorrect ? 3 : 2)));

            if (hitRipple.isCorrect) {
              setStats(prev => ({
                ...prev,
                absorbedCorrect: prev.absorbedCorrect + 1,
                totalHits: prev.totalHits + 1,
                perfectHits: isPerfect ? prev.perfectHits + 1 : prev.perfectHits
              }));
            } else {
              setStats(prev => ({
                ...prev,
                repelledError: prev.repelledError + 1,
                totalHits: prev.totalHits + 1,
                perfectHits: isPerfect ? prev.perfectHits + 1 : prev.perfectHits
              }));
            }

            // 创建击中特效粒子
            const config = difficultyConfig[selectedDifficulty];
            const maxRadius = Math.min(safeWidth, safeHeight) / 2;
            const angle = (hitRipple.direction * Math.PI * 2) / config.directions;
            const radius = hitRipple.position * maxRadius;
            const hitX = Math.cos(angle) * radius;
            const hitY = Math.sin(angle) * radius;
            
            const theme = colorThemes[selectedTheme];
            setHitEffects(prev => [
              ...prev,
              {
                id: Date.now(),
                x: centerX + hitX,
                y: centerY + hitY,
                type: hitRipple.isCorrect ? 'absorb' : 'repel',
                color: hitRipple.isCorrect ? theme.primary : '#FFAA44',
                createdAt: Date.now(),
                duration: 500,
              }
            ]);
          } else {
            setCombo(0);
            setPurity(prev => Math.max(0, prev - 10));
          }

          return prevRipples.filter((_, index) => index !== hitRippleIndex);
        }

        return prevRipples;
      });
    } catch (swipeError) {
      console.error('Handle swipe error:', swipeError);
    }
  };

  // 处理画圆手势（升级版 - 支持多种画圆类型）
  const handleCircle = () => {
    if (!gameActive || hasError) return;

    try {
      const config = difficultyConfig[selectedDifficulty];
      if (!config.circleEnabled) return;

      // 检查充能是否足够（仅对普通净化需要）
      const ringRipples = ripples.filter(r => r.type === 'ring');
      const correctRipplesNearby = ripples.filter(r =>
        r.isCorrect && r.position > 0.3 && r.position < 0.8
      );

      let circleBonusMultiplier = 1;
      let newCircleType = 'normal';

      // 判断画圆类型
      if (ringRipples.length > 0) {
        circleBonusMultiplier = 1.5;
        newCircleType = 'ring';
        console.log('🎯 环形波纹画圆! 1.5x 连击加成');
      }

      if (correctRipplesNearby.length >= 3) {
        circleBonusMultiplier = 1.5;
        newCircleType = 'combo';
        console.log(`🔥 连击画圆! ${correctRipplesNearby.length}个波纹 + 1.5x 加成`);
      }

      // 如果是普通净化，检查充能
      if (newCircleType === 'normal' && purgeEnergy < 100) {
        console.log(`⚡ 充能不足: ${purgeEnergy.toFixed(1)}%/100%`);
        setCircleType('insufficient');
        setCircleMessage(`⚡ 充能不足 ${Math.round(purgeEnergy)}%`);
        setShowPurgeEffect(true);
        setTimeout(() => {
          setShowPurgeEffect(false);
          setCircleType('normal');
          setCircleMessage('PURGE!');
        }, 1000);
        return;
      }

      // 设置画圆类型用于显示不同效果
      setCircleType(newCircleType);
      if (newCircleType === 'ring') setCircleMessage('RING ABSORB! ×1.5');
      else if (newCircleType === 'combo') setCircleMessage(`COMBO ×${correctRipplesNearby.length}! ×1.5`);
      else setCircleMessage('PURGE!');

      // 触发净化特效
      setShowPurgeEffect(true);
      setTimeout(() => setShowPurgeEffect(false), 2500);

      // 清除/吸收波纹
      let absorbedCount = 0;
      let repelledCount = 0;

      setRipples(prevRipples => {
        if (newCircleType === 'ring') {
          const ringIds = new Set(ringRipples.map(r => r.ringId));
          absorbedCount = prevRipples.filter(r => ringIds.has(r.ringId)).length;
          return prevRipples.filter(r => !ringIds.has(r.ringId));

        } else if (newCircleType === 'combo') {
          const absorbed = prevRipples.filter(r =>
            r.isCorrect && r.position > 0.2 && r.position < 0.9
          );
          absorbedCount = absorbed.length;
          return prevRipples.filter(r =>
            !(r.isCorrect && r.position > 0.2 && r.position < 0.9)
          );

        } else {
          // 普通净化
          repelledCount = prevRipples.filter(r => !r.isCorrect).length;
          setPurgeEnergy(0);  // 消耗充能
          setIsPurgeReady(false);
          return prevRipples.filter(r => r.isCorrect);
        }
      });

      // 计算分数（带加成）
      const baseComboAddition = 3;
      const finalComboAddition = Math.floor(baseComboAddition * circleBonusMultiplier);

      const newCombo = combo + finalComboAddition;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      // 纯净度提升
      const purityBoost = 20 + (absorbedCount * 5) + (repelledCount * 3);
      setPurity(prev => Math.min(100, prev + purityBoost));

      // 分数计算
      const baseScore = 500 + (absorbedCount * 200) + (repelledCount * 150);
      const finalScore = baseScore * (1 + newCombo * 0.1) * circleBonusMultiplier;
      setScore(prev => prev + finalScore);

      // 更新统计
      setStats(prev => ({
        ...prev,
        circleSuccesses: prev.circleSuccesses + 1,
        absorbedCorrect: prev.absorbedCorrect + absorbedCount,
        repelledError: prev.repelledError + repelledCount,
        totalHits: prev.totalHits + absorbedCount + repelledCount,
      }));

      // 触发无敌时间（仅对普通净化）
      if (newCircleType === 'normal') {
        startInvincibilityPeriod();
      }

      console.log(`✨ ${circleMessage} 吸收${absorbedCount}个 | 弹开${repelledCount}个 | ${circleBonusMultiplier}x加成`);

    } catch (circleError) {
      console.error('Handle circle error:', circleError);
    }
  };

  // 启动无敌时间
  const startInvincibilityPeriod = () => {
    setIsInvincible(true);

    invincibleTimerRef.current = setTimeout(() => {
      setIsInvincible(false);
      console.log('🛡️ 无敌时间结束');
    }, INVINCIBILITY_DURATION);

    console.log(`🛡️ 无敌时间开始 (${INVINCIBILITY_DURATION / 1000}秒)`);
  };

  // 加载并播放音乐
  const loadAndPlayMusic = async () => {
    try {
      if (!currentSong.path || !currentSong.isLocalFile) {
        console.log('⚠️ 跳过音乐加载');
        setAudioLoaded(false);
        setIsPlaying(false);
        return;
      }

      console.log('正在加载音乐:', currentSong.path);

      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {
          console.log('清理旧音乐失败:', e);
        }
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentSong.path },
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setAudioLoaded(true);
      setCurrentBPM(currentSong.bpm || DEFAULT_BPM);

      console.log('✅ 音乐加载成功:', currentSong.name, 'BPM:', currentSong.bpm);
    } catch (error) {
      console.error('❌ 音乐加载失败:', error.message);
      setAudioLoaded(false);
      setIsPlaying(false);
    }
  };

  // 播放状态更新回调
  const onPlaybackStatusUpdate = (status) => {
    try {
      if (!status.isLoaded) return;

      if (status.durationMillis > 0) {
        const progress = (status.positionMillis / status.durationMillis) * 100;
        setSongProgress(progress);
      }

      if (status.didJustFinish) {
        console.log('🎵 音乐播放结束');
        endGame();
      }
    } catch (e) {
      console.error('Playback status update error:', e);
    }
  };

  // 暂停/继续音乐
  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('暂停/继续失败:', error);
    }
  };

  // 停止音乐
  const stopMusic = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.error('停止音乐失败:', error.message);
      } finally {
        soundRef.current = null;
        setIsPlaying(false);
        setAudioLoaded(false);
      }
    }
  };

  // 选择歌曲
  const selectSong = (song) => {
    try {
      setCurrentSong(song);
      setSelectedTheme(song.theme || 'blue');
      setCurrentBPM(song.bpm || DEFAULT_BPM);
    } catch (e) {
      console.error('Select song error:', e);
    }
  };

  // 开始游戏
  const startGame = () => {
    try {
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setPurity(100);
      setRipples([]);
      setGameActive(true);
      setCurrentScreen('playing');
      setGameResult(null);
      setHasError(false);
      setErrorMessage('');

      // 重置新系统状态
      setPendingBigRipple(null);
      setPurgeEnergy(0);
      setIsPurgeReady(false);
      setIsInvincible(false);
      setCircleType('normal');
      setCircleMessage('PURGE!');

      // 清除所有计时器
      if (bigRippleTimerRef.current) clearTimeout(bigRippleTimerRef.current);
      if (invincibleTimerRef.current) clearTimeout(invincibleTimerRef.current);

      contaminationParticlesRef.current = null;

      setStats({
        totalCorrectRipples: 0,
        absorbedCorrect: 0,
        totalErrorRipples: 0,
        repelledError: 0,
        circleSuccesses: 0,
        perfectHits: 0,
        totalHits: 0,
      });

      loadAndPlayMusic();
    } catch (startError) {
      console.error('Start game error:', startError);
      setHasError(true);
      setErrorMessage(startError.message);
    }
  };

  // 返回菜单
  const returnToMenu = () => {
    setCurrentScreen('menu');
    setGameResult(null);
  };

  // 重试当前难度
  const retryGame = () => {
    startGame();
  };

  // 结束游戏
  const endGame = () => {
    try {
      setGameActive(false);

      // 清除所有计时器
      if (purgeRef.current) clearInterval(purgeRef.current);
      if (invincibleTimerRef.current) clearTimeout(invincibleTimerRef.current);
      if (bigRippleTimerRef.current) clearTimeout(bigRippleTimerRef.current);

      contaminationParticlesRef.current = null;

      stopMusic().catch(e => console.log('停止音乐时出错:', e));

      const grade = calculateGrade(purity);

      const correctRate = stats.totalCorrectRipples > 0
        ? (stats.absorbedCorrect / stats.totalCorrectRipples) * 100
        : 0;
      const errorRate = stats.totalErrorRipples > 0
        ? (stats.repelledError / stats.totalErrorRipples) * 100
        : 0;
      const timingAccuracy = stats.totalHits > 0
        ? (stats.perfectHits / stats.totalHits) * 100
        : 0;

      setGameResult({
        purity,
        score,
        maxCombo,
        correctRate,
        errorRate,
        circleCount: stats.circleSuccesses,
        timingAccuracy,
        grade,
      });

      setCurrentScreen('result');
    } catch (endError) {
      console.error('End game error:', endError);
    }
  };

  // 计算评级
  const calculateGrade = (purityValue) => {
    try {
      if (purityValue >= 95) return { letter: 'S', label: '纯净', color: '#FFD700' };
      if (purityValue >= 85) return { letter: 'A', label: '优秀', color: '#C0C0C0' };
      if (purityValue >= 70) return { letter: 'B', label: '良好', color: '#CD7F32' };
      if (purityValue >= 50) return { letter: 'C', label: '及格', color: '#888888' };
      return { letter: 'D', label: '混浊', color: '#666666' };
    } catch (e) {
      return { letter: '?', label: '未知', color: '#666666' };
    }
  };

  // 动画样式
  const getBallAnimatedStyle = () => {
    try {
      const theme = colorThemes[selectedTheme];
      const glowIntensity = purity / 100 * ballGlow;

      return {
        transform: [{ scale: ballScale }],
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6 + 0.4 * glowIntensity,
        shadowRadius: (15 + 15 * glowIntensity),
        borderWidth: isInvincible ? 4 : 2,
        borderColor: isInvincible ? '#FFD700' : `rgba(255, 255, 255, ${0.3 + 0.4 * glowIntensity})`,
      };
    } catch (e) {
      return {};
    }
  };

  // 计算污染颜色（增强版）
  const getContaminatedColor = () => {
    try {
      const theme = colorThemes[selectedTheme];
      const contamination = 1 - (purity / 100);
      const enhancedContamination = Math.pow(contamination, 0.7);

      const errorColorsList = errorColors[selectedTheme];
      const errorColor = errorColorsList[Math.floor(Date.now() / 500) % errorColorsList.length];

      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 68, g: 170, b: 255 };
      };

      const rgbToHex = (r, g, b) => {
        return "#" + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        }).join('');
      };

      const errorRGB = hexToRgb(errorColor);
      const primaryRGB = hexToRgb(theme.primary);

      const mixedR = Math.round(primaryRGB.r * (1 - enhancedContamination) + errorRGB.r * enhancedContamination);
      const mixedG = Math.round(primaryRGB.g * (1 - enhancedContamination) + errorRGB.g * enhancedContamination);
      const mixedB = Math.round(primaryRGB.b * (1 - enhancedContamination) + errorRGB.b * enhancedContamination);

      return rgbToHex(mixedR, mixedG, mixedB);
    } catch (e) {
      return purity > 50 ? '#44AAFF' : '#FF6666';
    }
  };

  // ========== 粒子系统函数 ==========

  // 处理中心球按压
  const handleCenterBallPress = () => {
    if (!gameActive) return;
    
    setIsBallPressed(true);
    setBallScale(0.9);
    
    setTimeout(() => {
      setIsBallPressed(false);
      setBallScale(1);
    }, 150);
    
    console.log('🎯 中心球被按下!');
  };

  // 生成中心球发光粒子
  useEffect(() => {
    if (!gameActive) return;
    
    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 30) * (Math.PI / 180),
      distance: 30 + Math.random() * 15,
      size: 3 + Math.random() * 3,
      speed: 0.5 + Math.random() * 0.5,
      opacity: 0.4 + Math.random() * 0.4,
    }));
    
    setBallParticles(particles);
  }, [gameActive]);

  // 渲染中心球发光粒子
  const renderBallParticles = () => {
    if (!gameActive || ballParticles.length === 0) return null;
    
    const theme = colorThemes[selectedTheme];
    const time = Date.now();
    
    return ballParticles.map((particle, idx) => {
      const currentAngle = particle.angle + time / (1000 * particle.speed);
      const x = Math.cos(currentAngle) * particle.distance;
      const y = Math.sin(currentAngle) * particle.distance;
      
      return (
        <View
          key={`ball-particle-${idx}`}
          style={{
            position: 'absolute',
            left: centerX + x - particle.size / 2,
            top: centerY + y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: theme.primary,
            opacity: particle.opacity * (isInvincible ? 1.5 : 1),
            shadowColor: theme.primary,
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
      );
    });
  };

  // 渲染波纹击中特效粒子
  const renderHitEffects = () => {
    if (hitEffects.length === 0) return null;
    
    const now = Date.now();
    
    return hitEffects.map(effect => {
      const age = now - effect.createdAt;
      const progress = age / effect.duration;
      
      if (progress >= 1) return null;
      
      return Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const distance = progress * 40;
        const px = effect.x + Math.cos(angle) * distance;
        const py = effect.y + Math.sin(angle) * distance;
        
        return (
          <View
            key={`${effect.id}-particle-${i}`}
            style={{
              position: 'absolute',
              left: px - 3,
              top: py - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: effect.color,
              opacity: (1 - progress) * 0.8,
              transform: [{ scale: 1 - progress * 0.5 }],
            }}
          />
        );
      });
    }).flat().filter(Boolean);
  };

  // 连击里程碑
  const COMBO_MILESTONES = [10, 25, 50, 100];

  // 监听连击变化，触发爆发粒子
  useEffect(() => {
    if (COMBO_MILESTONES.includes(combo) && gameActive) {
      triggerComboExplosion(combo);
    }
  }, [combo]);

  // 触发连击爆发
  const triggerComboExplosion = (comboCount) => {
    const explosionSize = Math.min(Math.floor(comboCount / 10), 10);
    const particlesPerRing = 12;
    
    const newParticles = [];
    
    for (let ring = 0; ring < explosionSize; ring++) {
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i * (360 / particlesPerRing)) * (Math.PI / 180);
        newParticles.push({
          id: `combo-${Date.now()}-${ring}-${i}`,
          angle: angle,
          distance: 30 + ring * 15,
          speed: 0.05 + Math.random() * 0.03,
          size: 4 + Math.random() * 4,
          color: comboCount >= 50 ? '#FFD700' : 
                  comboCount >= 25 ? '#FF4444' : 
                  '#44AAFF',
          createdAt: Date.now(),
          duration: 800 + ring * 100,
        });
      }
    }
    
    setComboExplosions(prev => [...prev, ...newParticles]);
    
    setShowComboText({
      text: `${comboCount} COMBO!`,
      visible: true,
      timestamp: Date.now()
    });
    
    setTimeout(() => {
      setShowComboText(prev => ({ ...prev, visible: false }));
    }, 1000);
  };

  // 渲染连击爆发粒子
  const renderComboExplosions = () => {
    if (comboExplosions.length === 0) return null;
    
    const now = Date.now();
    
    return comboExplosions.map(particle => {
      const age = now - particle.createdAt;
      const progress = age / particle.duration;
      
      if (progress >= 1) return null;
      
      const currentAngle = particle.angle + progress * Math.PI * 2;
      const currentDistance = particle.distance + progress * 50;
      const x = Math.cos(currentAngle) * currentDistance;
      const y = Math.sin(currentAngle) * currentDistance;
      
      return (
        <View
          key={particle.id}
          style={{
            position: 'absolute',
            left: centerX + x - particle.size / 2,
            top: centerY + y - particle.size / 2,
            width: particle.size * (1 - progress),
            height: particle.size * (1 - progress),
            borderRadius: particle.size / 2,
            backgroundColor: particle.color,
            opacity: (1 - progress) * 0.9,
            shadowColor: particle.color,
            shadowOpacity: 0.6,
            shadowRadius: 6,
          }}
        />
      );
    }).filter(Boolean);
  };

  // 监听充能完成，触发金色辐射粒子
  useEffect(() => {
    if (isPurgeReady && !prevPurgeReady.current && gameActive) {
      triggerPurgeReadyEffect();
    }
    prevPurgeReady.current = isPurgeReady;
  }, [isPurgeReady]);

  // 触发充能完成特效
  const triggerPurgeReadyEffect = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: `purge-ready-${Date.now()}-${i}`,
      angle: (i * 18) * (Math.PI / 180),
      distance: 25,
      targetDistance: 80 + Math.random() * 40,
      speed: 800 + Math.random() * 400,
      size: 4 + Math.random() * 4,
      delay: i * 30,
      startTime: Date.now() + i * 30,
    }));
    
    setPurgeReadyParticles(particles);
    
    setTimeout(() => {
      setPurgeReadyParticles([]);
    }, 2000);
  };

  // 渲染充能完成粒子
  const renderPurgeReadyParticles = () => {
    if (purgeReadyParticles.length === 0) return null;
    
    const now = Date.now();
    
    return purgeReadyParticles.map(particle => {
      if (now < particle.startTime) return null;
      
      const elapsed = now - particle.startTime;
      const progress = Math.min(elapsed / particle.speed, 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentDistance = particle.distance + 
        (particle.targetDistance - particle.distance) * easedProgress;
      
      const x = Math.cos(particle.angle) * currentDistance;
      const y = Math.sin(particle.angle) * currentDistance;
      
      return (
        <View
          key={particle.id}
          style={{
            position: 'absolute',
            left: centerX + x - particle.size / 2,
            top: centerY + y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: '#FFD700',
            opacity: (1 - progress) * 0.9,
            shadowColor: '#FFD700',
            shadowOpacity: 1,
            shadowRadius: 8,
          }}
        />
      );
    }).filter(Boolean);
  };

  // 在handleSwipe成功分支添加击中特效（需要修改原函数）
  // 已在handleSwipe中集成：创建hitEffect并添加到hitEffects状态

  // 绘制轨道
  const renderTracks = () => {
    try {
      const config = difficultyConfig[selectedDifficulty];
      const theme = colorThemes[selectedTheme];
      const trackLength = Math.min(safeWidth, safeHeight) / 2;

      return Array.from({ length: config.directions }).map((_, index) => {
        const angle = (index * Math.PI * 2) / config.directions;

        const hasNearbyRipple = ripples.some(ripple =>
          ripple.direction === index &&
          ripple.position > 0.3 &&
          ripple.position < 0.8 &&
          ripple.isCorrect
        );

        return (
          <View key={index} style={styles.track}>
            <View
              style={[
                styles.trackLine,
                {
                  left: '50%',
                  top: '50%',
                  height: trackLength,
                  transform: [
                    { rotate: `${angle * 180 / Math.PI}deg` }
                  ],
                  backgroundColor: hasNearbyRipple ? theme.primary : 'rgba(255, 255, 255, 0.2)',
                  shadowColor: hasNearbyRipple ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: hasNearbyRipple ? 0.8 : 0,
                  shadowRadius: hasNearbyRipple ? 8 : 0,
                }
              ]}
            />
          </View>
        );
      });
    } catch (e) {
      console.error('Render tracks error:', e);
      return null;
    }
  };

  // 生成污染粒子（增强版 - 动态浮动）
  const renderContaminationParticles = () => {
    try {
      if (!contaminationParticlesRef.current) {
        contaminationParticlesRef.current = Array.from({ length: 10 }).map((_, index) => ({
          key: index,
          left: centerX + (Math.random() - 0.5) * 90,
          top: centerY + (Math.random() - 0.5) * 90,
          opacity: 0.2 + Math.random() * 0.3,
          rotate: Math.random() * 360,
          scale: 0.5 + Math.random(),
          colorIndex: index,
        }));
      }

      const particleCount = Math.floor((100 - purity) / 5);  // 更多粒子

      return (
        <View style={styles.contaminationParticles}>
          {contaminationParticlesRef.current.slice(0, particleCount).map((particle, index) => (
            <View
              key={particle.key}
              style={[
                styles.particle,
                {
                  left: particle.left + (Math.sin(Date.now() / 500 + index) * 5),
                  top: particle.top + (Math.cos(Date.now() / 400 + index) * 5),
                  opacity: particle.opacity * (1 + Math.sin(Date.now() / 300) * 0.3),
                  transform: [
                    { rotate: `${particle.rotate + Date.now() / 50}deg` },
                    { scale: particle.scale * (1 + Math.sin(Date.now() / 200) * 0.2) }
                  ],
                  backgroundColor: errorColors[selectedTheme][particle.colorIndex % errorColors[selectedTheme].length],
                }
              ]}
            />
          ))}
        </View>
      );
    } catch (e) {
      console.error('Render particles error:', e);
      return null;
    }
  };

  // 绘制波纹（全面升级版 - 发光圆环、噪点质感、反弹视觉等）
  const renderRipples = () => {
    try {
      const theme = colorThemes[selectedTheme];
      const maxRadius = Math.min(safeWidth, safeHeight) / 2;

      return ripples.map((ripple, idx) => {
        if (!ripple || typeof ripple === 'undefined' || typeof ripple.position === 'undefined') {
          return null;
        }

        const config = difficultyConfig[selectedDifficulty];
        const angle = (ripple.direction * Math.PI * 2) / config.directions;
        const radius = ripple.position * maxRadius;

        let color;
        if (ripple.isCorrect) {
          color = theme.primary;
        } else {
          const errorPalette = ['#FF6677', '#FFBBDD', '#FF4444', '#8B3A62'];
          color = errorPalette[Math.abs(ripple.id || idx) % errorPalette.length];
        }

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        let rippleStyle = {};

        // 正确波纹：发光圆环效果
        if (ripple.isCorrect) {
          rippleStyle = {
            left: x - (ripple.size || 14) / 2,
            top: y - (ripple.size || 14) / 2,
            width: ripple.size || 14,
            height: ripple.size || 14,
            backgroundColor: 'transparent',  // 透明核心
            borderWidth: 3,
            borderColor: color,
            opacity: 0.9 - ripple.position * 0.5,
            borderRadius: (ripple.size || 14) / 2,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9 + 0.1 * (1 - ripple.position),
            shadowRadius: 15 + 10 * (1 - ripple.position),
          };
        } else {
          // 错误波纹：实心+噪点质感
          const jitterScale = 1 + (Math.sin(Date.now() / 100 + idx) * 0.05);  // 轻微抖动

          rippleStyle = {
            left: x - (ripple.size || 14) / 2,
            top: y - (ripple.size || 14) / 2,
            width: (ripple.size || 14) * jitterScale,
            height: (ripple.size || 14) * jitterScale,
            backgroundColor: color,
            opacity: ripple.hasBouncedBack
              ? 0.6  // 反弹后半透明
              : (0.3 + (1 - ripple.position) * 0.6),
            borderRadius: (ripple.size || 14) / 2,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            borderWidth: ripple.hasBouncedBack ? 2 : 0,  // 反弹后红色边框
            borderColor: ripple.hasBouncedBack ? '#FF0000' : 'transparent',
            transform: [{ scale: ripple.hasBouncedBack ? 1.3 : 1 }],  // 反弹后变大
          };
        }

        // 大团波纹增强
        if (ripple.type === 'big') {
          const progress = (ripple.currentHits || 0) / (ripple.hitCount || 2);

          rippleStyle.width = (ripple.size || 14) * 1.8;
          rippleStyle.height = (ripple.size || 14) * 1.8;
          rippleStyle.left = x - ((ripple.size || 14) * 1.8) / 2;
          rippleStyle.top = y - ((ripple.size || 14) * 1.8) / 2;
          rippleStyle.borderWidth = 4;
          rippleStyle.borderColor = 'rgba(255, 255, 255, 0.8)';
          rippleStyle.shadowOpacity = 1;
          rippleStyle.shadowRadius = 25;

          if (ripple.currentHits > 0) {
            rippleStyle.transform = [{ scale: 1.2 - progress * 0.2 }];
          }

          if (ripple.isTimedOut) {
            rippleStyle.borderColor = '#FF0000';  // 超时红色边框
            rippleStyle.opacity = 0.5;
          }
        }

        // 环形波纹增强
        if (ripple.type === 'ring') {
          rippleStyle.shadowOpacity = 1;
          rippleStyle.shadowRadius = 20;
          rippleStyle.transform = [{ scale: 1.1 + Math.sin(Date.now() / 100) * 0.1 }];
        }

        // 拖尾效果
        const trails = [];
        const safeTrails = Array.isArray(ripple.trailPositions) ? ripple.trailPositions : [];
        if (safeTrails.length >= 2) {
          for (let i = 0; i < Math.min(safeTrails.length, 3); i++) {
            const trailPos = safeTrails[i];
            const trailRadius = (trailPos || 0) * maxRadius;
            const trailX = Math.cos(angle) * trailRadius;
            const trailY = Math.sin(angle) * trailRadius;
            const trailSizeRatio = [0.6, 0.55, 0.5][i] || 0.5;
            const trailOpacity = [0.25, 0.15, 0.05][i] || 0.05;

            trails.push(
              <View
                key={`${ripple.id || idx}-trail-${i}`}
                style={[
                  styles.rippleTrail,
                  {
                    left: trailX - (ripple.size || 14) * trailSizeRatio / 2,
                    top: trailY - (ripple.size || 14) * trailSizeRatio / 2,
                    width: (ripple.size || 14) * trailSizeRatio,
                    height: (ripple.size || 14) * trailSizeRatio,
                    backgroundColor: color,
                    opacity: trailOpacity,
                  }
                ]}
              />
            );
          }
        }

        // 警告指示器
        let warningIndicator = null;
        if (!ripple.isCorrect && !ripple.hasBouncedBack && ripple.position < 0.25) {
          warningIndicator = (
            <View style={[styles.warningRing, {
              left: x - (ripple.size || 14),
              top: y - (ripple.size || 14),
              width: (ripple.size || 14) * 3,
              height: (ripple.size || 14) * 3,
              borderColor: `rgba(255, 68, 68, ${1 - ripple.position * 4})`,
              transform: [{ rotate: `${Date.now() / 20}deg` }]
            }]}>
              <Text style={styles.warningText}>⚠</Text>
            </View>
          );
        }

        // 噪点颗粒（仅错误波纹）
        const noiseParticles = [];
        if (!ripple.isCorrect && !ripple.hasBouncedBack) {
          for (let i = 0; i < 5; i++) {
            noiseParticles.push(
              <View
                key={`noise-${ripple.id || idx}-${i}`}
                style={{
                  position: 'absolute',
                  width: 2 + Math.random() * 3,
                  height: 2 + Math.random() * 3,
                  backgroundColor: '#FFFFFF',
                  opacity: 0.3 + Math.random() * 0.4,
                  borderRadius: 1,
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
              />
            );
          }
        }

        // 大团波纹进度环
        let progressRing = null;
        if (ripple.type === 'big' && pendingBigRipple?.id === ripple.id) {
          const timeLeft = (pendingBigRipple.deadline - Date.now()) / BIG_RIPPLE_TIMEOUT;
          progressRing = (
            <View style={[styles.bigRippleProgressRing, {
              left: x - (ripple.size || 14) * 1.8 / 2 - 5,
              top: y + (ripple.size || 14) * 1.8 / 2 + 5,
              width: (ripple.size || 14) * 1.8 + 10,
              height: 4,
            }]}>
              <View style={[
                styles.bigRippleProgressFill,
                {
                  width: `${timeLeft * 100}%`,
                  backgroundColor: timeLeft > 0.5 ? '#44CC44' : '#FFAA44'
                }
              ]} />
            </View>
          );
        }

        return (
          <View key={ripple.id || idx}>
            {trails}
            {warningIndicator}
            <View style={[styles.ripple, rippleStyle]}>
              {/* 内核光晕（正确波纹） */}
              {ripple.isCorrect && (
                <View style={[
                  styles.correctRippleGlow,
                  {
                    position: 'absolute',
                    width: '80%',
                    height: '80%',
                    borderRadius: '50%',
                    backgroundColor: `${color}30`,
                    left: '10%',
                    top: '10%',
                  }
                ]} />
              )}
              {/* 噪点颗粒（错误波纹） */}
              {!ripple.isCorrect && noiseParticles}
            </View>
            {progressRing}
          </View>
        );
      }).filter(Boolean);
    } catch (e) {
      console.error('Render ripples error:', e);
      return null;
    }
  };

  // 手势配置
  const swipeGesture = Gesture.Pan()
    .onEnd(handleSwipe);

  const circleGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      setTouchPath([]);
    })
    .onUpdate((event) => {
      const relativeX = event.translationX;
      const relativeY = event.translationY;

      const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
      if (distance > 30) {
        setTouchPath(prev => {
          const newPath = [...prev, { x: relativeX, y: relativeY }];
          if (newPath.length > 50) {
            return newPath.slice(-50);
          }
          return newPath;
        });
      }
    })
    .onEnd(() => {
      const totalArc = calculateTotalArc(touchPath);

      if (totalArc >= 270) {
        handleCircle();
      }

      setTouchPath([]);
    });

  const composedGesture = Gesture.Simultaneous(swipeGesture, circleGesture);

  // 错误状态显示
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ 出现错误</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colorThemes[selectedTheme].primary }]}
            onPress={() => {
              setHasError(false);
              setErrorMessage('');
              setCurrentScreen('menu');
              setGameActive(false);
            }}
          >
            <Text style={styles.retryButtonText}>返回主菜单</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 根据当前屏幕状态渲染不同界面
  if (currentScreen === 'menu') {
    return (
      <MainMenuScreen
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        currentSong={currentSong}
        currentBPM={currentBPM}
        onStartGame={() => {
          setCurrentScreen('playing');
          setGameActive(true);
        }}
      />
    );
  }

  if (currentScreen === 'result') {
    return (
      <ResultScreen
        grade={gameResult?.grade || 'S'}
        purity={Math.round(purity)}
        accuracy={(stats.totalCorrectRipples / (stats.totalCorrectRipples + stats.totalErrorRipples)) || 0.95}
        maxCombo={maxCombo}
        circleSuccesses={stats.circleSuccesses}
        totalScore={score}
        onRetry={() => {
          setGameResult(null);
          setCurrentScreen('menu');
          setScore(0);
          setCombo(0);
          setMaxCombo(0);
          setPurity(100);
          setStats({
            totalCorrectRipples: 0,
            absorbedCorrect: 0,
            totalErrorRipples: 0,
            repelledError: 0,
            circleSuccesses: 0,
            perfectHits: 0,
            totalHits: 0,
          });
        }}
        onBackToMenu={() => {
          setCurrentScreen('menu');
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* 背景层 - 不参与手势 */}
      <View style={styles.background} pointerEvents="none">
        {/* 静态星点 */}
        {Array.from({ length: 80 }).map((_, index) => (
          <View
            key={`star-${index}`}
            style={[
              styles.star,
              {
                left: Math.random() * safeWidth,
                top: Math.random() * safeHeight,
                opacity: 0.3 + Math.random() * 0.7,
                transform: [{ scale: 0.5 + Math.random() }]
              }
            ]}
          />
        ))}
        
        {/* 动态闪烁星 */}
        {Array.from({ length: 20 }).map((_, index) => {
          const twinklePhase = Math.sin(Date.now() / (500 + index * 100)) * 0.5 + 0.5;
          return (
            <View
              key={`twinkle-${index}`}
              style={{
                position: 'absolute',
                left: Math.random() * safeWidth,
                top: Math.random() * safeHeight,
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: '#FFFFFF',
                opacity: twinklePhase * 0.9,
                shadowColor: '#FFFFFF',
                shadowOpacity: twinklePhase,
                shadowRadius: 4,
              }}
            />
          );
        })}
      </View>

      {/* 游戏层 - 完全接收手势 */}
      <GestureDetector gesture={composedGesture}>
        <View style={styles.gameArea} pointerEvents="auto">
          {currentScreen === 'menu' && (
            <>
              {renderTracks()}
              <Pressable
                style={[styles.centerBall, styles.centerBallTouchable]}
                onPressIn={handleCenterBallPress}
              >
                <View
                  style={[
                    styles.centerBallInner,
                    getBallAnimatedStyle(),
                    { backgroundColor: colorThemes[selectedTheme].primary }
                  ]}
                />
              </Pressable>
            </>
          )}

          {currentScreen === 'playing' && (
            <>
              {renderTracks()}
              {renderRipples()}
              
              {/* 所有粒子效果 */}
              {renderBallParticles()}
              {renderHitEffects()}
              {renderComboExplosions()}
              {renderPurgeReadyParticles()}
              {purity < 80 && renderContaminationParticles()}

            <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menu}>
              <Text style={styles.title}>ChromaBeat</Text>
              <Text style={styles.subtitle}>色彩守护者</Text>

              <View style={styles.songSelector}>
                <Text style={styles.sectionTitle}>🎵 选择歌曲</Text>
                {songs.map(song => (
                  <Pressable
                    key={song.id}
                    style={[
                      styles.songCard,
                      currentSong?.id === song.id && styles.songCardActive,
                      {
                        borderColor: colorThemes[song.theme || 'blue'].primary,
                        backgroundColor: currentSong?.id === song.id
                          ? `${colorThemes[song.theme || 'blue'].primary}20`
                          : 'rgba(0, 0, 0, 0.5)'
                      }
                    ]}
                    onPress={() => selectSong(song)}
                  >
                    <View style={[styles.songColorDot, { backgroundColor: colorThemes[song.theme || 'blue'].primary }]} />
                    <View style={styles.songInfo}>
                      <Text style={styles.songName}>{song.name}</Text>
                      <Text style={styles.songArtist}>{song.artist}</Text>
                    </View>
                    <View style={styles.songMeta}>
                      <Text style={styles.songBPM}>{song.bpm} BPM</Text>
                      <Text style={styles.songDuration}>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              <View style={styles.themeSelector}>
                <Text style={styles.sectionTitle}>🎨 选择主题</Text>
                {Object.keys(colorThemes).map(theme => (
                  <Pressable
                    key={theme}
                    style={[
                      styles.themeButton,
                      selectedTheme === theme && styles.themeButtonActive,
                      { backgroundColor: colorThemes[theme].primary }
                    ]}
                    onPress={() => setSelectedTheme(theme)}
                  />
                ))}
              </View>

              <View style={styles.difficultySelector}>
                <Text style={styles.sectionTitle}>⚡ 选择难度</Text>
                {Object.keys(difficultyConfig).map(difficulty => (
                  <Pressable
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      selectedDifficulty === difficulty && styles.difficultyButtonActive,
                      { borderColor: colorThemes[selectedTheme].primary }
                    ]}
                    onPress={() => setSelectedDifficulty(difficulty)}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      selectedDifficulty === difficulty && { color: '#FFFFFF' }
                    ]}>
                      {difficultyConfig[difficulty].label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.bpmDisplay}>
                <Text style={styles.bpmLabel}>当前节拍</Text>
                <Text style={styles.bpmValue}>{currentBPM} BPM</Text>
                <Text style={styles.bpmHint}>波纹将与音乐同步生成</Text>
              </View>

              <Pressable
                style={[
                  styles.startButton,
                  { backgroundColor: colorThemes[selectedTheme].primary }
                ]}
                onPress={startGame}
              >
                <Text style={styles.startButtonText}>▶ 开始游戏</Text>
              </Pressable>
            </ScrollView>
          </>
        )}

        {currentScreen === 'playing' && (
          <GameplayScreen
            combo={combo}
            score={score}
            purity={purity}
            accuracy={(stats.totalCorrectRipples / (stats.totalCorrectRipples + stats.totalErrorRipples)) || 0.95}
            songProgress={songProgress / 100}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPause={() => setIsPlaying(false)}
            onResume={() => setIsPlaying(true)}
            ripples={ripples}
            onPrev={() => {}}
            onNext={() => {}}
            purgeEnergy={purgeEnergy}
            isPurgeReady={isPurgeReady}
            isInvincible={isInvincible}
          >
            <View style={styles.gameArea}>
              {renderTracks()}
              {renderRipples()}
              {purity < 80 && renderContaminationParticles()}

              {/* 大团波纹待处理提示 */}
              {pendingBigRipple && (
                <View style={styles.pendingBigRippleIndicator}>
                  <Text style={styles.pendingText}>⚡ 再滑一次!</Text>
                  <View style={styles.timeoutBar}>
                    <View
                      style={[
                        styles.timeoutFill,
                        {
                          width: `${((pendingBigRipple.deadline - Date.now()) / BIG_RIPPLE_TIMEOUT) * 100}%`
                        }
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* 充能环 */}
              <View style={styles.energyRingBackground} />
              {purgeEnergy > 0 && (
                <View style={[
                  styles.energyRingFill,
                  {
                    transform: [{ rotate: `${(purgeEnergy / 100) * 360}deg` }],
                    borderColor: isPurgeReady ? '#FFD700' : '#44AAFF',
                    opacity: isPurgeReady ? 1 : 0.7,
                  }
                ]} />
              )}

              {showPurgeEffect && (
                <View style={styles.purgeEffect}>
                  <View style={styles.purgeFlash} />

                  {[...Array(20)].map((_, i) => (
                    <View
                      key={`ray-${i}`}
                      style={[
                        styles.purgeRays,
                        {
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: 4,
                          height: Math.max(safeWidth, safeHeight) * 0.8,
                          backgroundColor: `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`,
                          transform: [
                            { rotate: `${i * 18}deg` },
                            { translateX: -2 },
                            { translateY: -Math.max(safeWidth, safeHeight) * 0.4 }
                          ],
                          opacity: 0.8,
                          borderRadius: 2,
                        }
                      ]}
                    />
                  ))}

                  <Text style={[
                    styles.purgeText,
                    circleType === 'ring' && { color: '#44FF44', textShadowColor: '#44FF44' },
                    circleType === 'combo' && { color: '#FFD700', textShadowColor: '#FFD700' },
                    circleType === 'insufficient' && { color: '#FF6666', textShadowColor: '#FF6666', fontSize: 32 }
                  ]}>
                    {circleMessage}
                  </Text>
                </View>
              )}

              {/* 无敌护盾 */}
              {isInvincible && (
                <>
                  <View style={styles.invincibilityShield}>
                    {[...Array(12)].map((_, i) => (
                      <View
                        key={`shield-segment-${i}`}
                        style={[
                          styles.shieldSegment,
                          {
                            transform: [
                              { rotate: `${i * 30 + Date.now() / 30}deg` },  // 旋转
                              { translateX: -1.5 },
                              { translateY: -26 }
                            ]
                          }
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}

              {/* 污染警告 */}
              {purity < 50 && (
                <View style={styles.contaminationWarning}>
                  <View style={[styles.warningPulse, { opacity: (50 - purity) / 50 }]} />
                  <Text style={styles.warningText}>⚠️ 污染严重!</Text>
                  <Text style={styles.warningSubtext}>纯净度: {Math.round(purity)}%</Text>
                </View>
              )}

              {purity < 30 && (
                <View style={styles.screenVignette} />
              )}

              {/* 无敌光环粒子 */}
              {isInvincible && Array.from({ length: 16 }, (_, i) => {
                const time = Date.now();
                const baseAngle = (i * 22.5) * (Math.PI / 180);
                const rotationSpeed = time / 800;
                const pulsePhase = Math.sin(time / 300 + i) * 0.3;

                const currentAngle = baseAngle + rotationSpeed;
                const distance = 35 + pulsePhase * 10;

                return (
                  <View
                    key={`invincible-particle-${i}`}
                    style={{
                      position: 'absolute',
                      left: centerX + Math.cos(currentAngle) * distance - 3,
                      top: centerY + Math.sin(currentAngle) * distance - 3,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#FFD700',
                      opacity: 0.7 + Math.sin(time / 200 + i * 0.5) * 0.3,
                      shadowColor: '#FFD700',
                      shadowOpacity: 1,
                      shadowRadius: 6,
                      transform: [{ scale: 1 + Math.sin(time / 150 + i) * 0.2 }],
                    }}
                  />
                );
              })}

              {/* 连击文字显示 */}
              {showComboText.visible && (
                <View style={styles.comboTextContainer}>
                  <Text style={[
                    styles.comboText,
                    combo >= 50 ? { color: '#FFD700', textShadowColor: '#FFD700' } :
                    combo >= 25 ? { color: '#FF4444', textShadowColor: '#FF4444' } :
                    { color: '#44AAFF', textShadowColor: '#44AAFF' }
                  ]}>
                    {showComboText.text}
                  </Text>
                </View>
              )}

              {/* 中心球 - 扩展触摸区域 */}
              <Pressable
                style={[styles.centerBall, styles.centerBallTouchable]}
                onPressIn={handleCenterBallPress}
              >
                <View
                  style={[
                    styles.centerBallInner,
                    getBallAnimatedStyle(),
                    { backgroundColor: getContaminatedColor() }
                  ]}
                />
              </Pressable>

              {/* 充能数值显示 */}
              {purgeEnergy > 50 && (
                <Text style={styles.energyPercent}>
                  {Math.round(purgeEnergy)}%
                </Text>
              )}
            </View>
          </GameplayScreen>
        )}

        {currentScreen === 'result' && gameResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>游戏结束</Text>

            <View style={styles.purityDisplay}>
              <Text style={[styles.gradeLetter, { color: gameResult.grade.color }]}>
                {gameResult.grade.letter}
              </Text>
              <Text style={styles.purityNumber}>{Math.round(gameResult.purity)}%</Text>
              <Text style={styles.gradeLabel}>{gameResult.grade.label}</Text>
            </View>

            <View style={styles.colorComparison}>
              <View style={[styles.colorBall, { backgroundColor: getContaminatedColor() }]} />
              <Text style={styles.vsText}>VS</Text>
              <View style={[styles.colorBall, { backgroundColor: colorThemes[selectedTheme].primary }]} />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>正确吸收率</Text>
                <View style={styles.statBarBg}>
                  <View style={[styles.statBarFill, { width: `${gameResult.correctRate}%`, backgroundColor: '#44CC44' }]} />
                </View>
                <Text style={styles.statValue}>{Math.round(gameResult.correctRate)}%</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>错误弹开率</Text>
                <View style={styles.statBarBg}>
                  <View style={[styles.statBarFill, { width: `${gameResult.errorRate}%`, backgroundColor: '#44AAFF' }]} />
                </View>
                <Text style={styles.statValue}>{Math.round(gameResult.errorRate)}%</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最大连击</Text>
                <Text style={styles.statValueLarge}>{gameResult.maxCombo}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>画圆成功</Text>
                <Text style={styles.statValueLarge}>{gameResult.circleCount}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>总得分</Text>
                <Text style={styles.statValueLarge}>{gameResult.score}</Text>
              </View>
            </View>

            <View style={styles.resultButtons}>
              <Pressable
                style={[styles.resultButton, { backgroundColor: colorThemes[selectedTheme].primary }]}
                onPress={retryGame}
              >
                <Text style={styles.resultButtonText}>重试</Text>
              </Pressable>

              <Pressable
                style={[styles.resultButton, styles.resultButtonSecondary]}
                onPress={returnToMenu}
              >
                <Text style={[styles.resultButtonText, { color: '#FFFFFF' }]}>返回菜单</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

// 使用安全的尺寸常量
const width = safeWidth;
const height = safeHeight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameArea: {
    position: 'absolute',
    width: Math.min(width, height),
    height: Math.min(width, height),
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackLine: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transformOrigin: 'center top',
  },
  centerBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: 20,
    elevation: Platform.OS === 'android' ? 10 : 0,
  },
  centerBallTouchable: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 50,
  },
  correctRippleGlow: {
    borderRadius: '50%',
  },
  rippleTrail: {
    position: 'absolute',
    borderRadius: 50,
  },
  warningRing: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  contaminationParticles: {
    position: 'absolute',
    width: 150,
    height: 150,
    left: -75,
    top: -75,
  },
  particle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  purgeEffect: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  purgeFlash: {
    width: width,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  purgeRays: {
    position: 'absolute',
  },
  purgeText: {
    position: 'absolute',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#44AAFF',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
    zIndex: 101,
  },
  menu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingBottom: 30,
  },
  menuScroll: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  songSelector: {
    width: '90%',
    marginBottom: 20,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  songCardActive: {
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  songColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  songName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  songArtist: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  songMeta: {
    alignItems: 'flex-end',
  },
  songBPM: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#44AAFF',
    marginBottom: 2,
  },
  songDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#FF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 25,
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  themeButtonActive: {
    borderColor: '#FFFFFF',
  },
  difficultySelector: {
    width: '85%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
    textAlign: 'center',
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 8,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
  },
  difficultyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bpmDisplay: {
    width: '85%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  bpmLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 3,
  },
  bpmValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#44AAFF',
    marginBottom: 3,
  },
  bpmHint: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
    textShadowColor: '#FF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  purityDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeLetter: {
    fontSize: 60,
    fontWeight: 'bold',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  purityNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: -8,
  },
  gradeLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  colorComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  colorBall: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  vsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 3,
  },
  statBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'right',
    marginTop: 2,
    fontWeight: 'bold',
  },
  statValueLarge: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  resultButton: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  resultButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#0A0A0F',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // 新增样式：大团波纹进度环
  bigRippleProgressRing: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bigRippleProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  // 新增样式：待处理提示
  pendingBigRippleIndicator: {
    position: 'absolute',
    top: 80,
    alignItems: 'center',
    zIndex: 50,
  },
  pendingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 5,
  },
  timeoutBar: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timeoutFill: {
    height: '100%',
    backgroundColor: '#44CC44',
    borderRadius: 2,
  },
  // 新增样式：充能环
  energyRingBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  energyRingFill: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  energyPercent: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    bottom: -18,
  },
  // 新增样式：无敌护盾
  invincibilityShield: {
    position: 'absolute',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldSegment: {
    position: 'absolute',
    width: 3,
    height: 10,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    opacity: 0.8,
    shadowColor: '#FFD700',
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  // 新增样式：污染警告
  contaminationWarning: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  warningPulse: {
    position: 'absolute',
    width: safeWidth,
    height: 4,
    backgroundColor: '#FF4444',
    opacity: 0.6,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#FF8888',
    marginTop: 2,
  },
  screenVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    pointerEvents: 'none',
    zIndex: 40,
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ChromaBeatGame />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
