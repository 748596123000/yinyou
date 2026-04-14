import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const centerX = width / 2;
const centerY = height / 2;
const trackCount = 8;
const trackAngle = (Math.PI * 2) / trackCount;

// 颜色主题配置
const colorThemes = {
  red: {
    primary: '#FF4444',
    dark: '#8B0000',
    medium: '#DC143C',
    light: '#FF8888',
    extremeLight: '#FFB3B3',
  },
  blue: {
    primary: '#44AAFF',
    dark: '#00008B',
    medium: '#1E90FF',
    light: '#88CCFF',
    extremeLight: '#B3E0FF',
  },
  purple: {
    primary: '#AA44FF',
    dark: '#4B0082',
    medium: '#8A2BE2',
    light: '#CC88FF',
    extremeLight: '#E6B3FF',
  },
  green: {
    primary: '#44CC44',
    dark: '#006400',
    medium: '#228B22',
    light: '#88EE88',
    extremeLight: '#B3FFB3',
  },
};

// 错误颜色配置
const errorColors = {
  red: ['#44AAFF', '#44CC44'], // 蓝色和绿色
  blue: ['#FF4444', '#44CC44'], // 红色和绿色
  purple: ['#FF4444', '#44AAFF'], // 红色和蓝色
  green: ['#FF4444', '#44AAFF'], // 红色和蓝色
};

// 波纹类
class Ripple {
  constructor(id, direction, isCorrect, size, speed) {
    this.id = id;
    this.direction = direction;
    this.isCorrect = isCorrect;
    this.size = size;
    this.speed = speed;
    this.position = 0; // 0-1 表示从中心到边缘的位置
  }

  update(deltaTime) {
    this.position += this.speed * deltaTime;
    return this.position <= 1;
  }
}

// 难度级别配置
const difficultyLevels = {
  easy: {
    name: '简单',
    rippleInterval: 1200, // 毫秒
    rippleSpeed: { min: 0.2, max: 0.3 },
    rippleSize: { min: 15, max: 25 },
    correctRate: 0.7, // 70% 正确波纹
    trackCount: 6, // 减少轨道数量
  },
  normal: {
    name: '普通',
    rippleInterval: 1000,
    rippleSpeed: { min: 0.3, max: 0.4 },
    rippleSize: { min: 15, max: 20 },
    correctRate: 0.7,
    trackCount: 8,
  },
  hard: {
    name: '困难',
    rippleInterval: 800,
    rippleSpeed: { min: 0.4, max: 0.5 },
    rippleSize: { min: 10, max: 15 },
    correctRate: 0.6, // 60% 正确波纹
    trackCount: 8,
  },
  expert: {
    name: '专家',
    rippleInterval: 600,
    rippleSpeed: { min: 0.5, max: 0.6 },
    rippleSize: { min: 8, max: 12 },
    correctRate: 0.5, // 50% 正确波纹
    trackCount: 10, // 增加轨道数量
  },
};

// 主游戏组件
const ChromaBeatGame = () => {
  // 状态管理
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [purity, setPurity] = useState(100);
  const [ripples, setRipples] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('red');
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
  const [songProgress, setSongProgress] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [particles, setParticles] = useState([]);
  const [beatTimestamps, setBeatTimestamps] = useState([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  
  // 计算当前难度配置
  const currentDifficulty = difficultyLevels[selectedDifficulty];
  const trackCount = currentDifficulty.trackCount;
  const trackAngle = (Math.PI * 2) / trackCount;
  
  // 动画值
  const ballScale = useSharedValue(1);
  const ballGlow = useSharedValue(1);
  
  // 引用
  const rippleIdCounter = useRef(0);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const soundRef = useRef(null);
  const gameStartTimeRef = useRef(0);
  
  // 中心球动画
  useEffect(() => {
    ballScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    ballGlow.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  
  // 粒子类
  class Particle {
    constructor(x, y, color, size, velocityX, velocityY, life) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = size;
      this.velocityX = velocityX;
      this.velocityY = velocityY;
      this.life = life;
      this.maxLife = life;
    }

    update(deltaTime) {
      this.x += this.velocityX * deltaTime;
      this.y += this.velocityY * deltaTime;
      this.life -= deltaTime;
      return this.life > 0;
    }
  }

  // 生成粒子效果
  const generateParticles = (x, y, color, count = 10) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 3;
      const life = 0.5 + Math.random() * 0.5;
      newParticles.push(new Particle(x, y, color, size, velocityX, velocityY, life));
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // 生成基于节拍的谱面
  const generateBeatMap = () => {
    const beats = [];
    const totalBeats = 60; // 假设60个节拍
    const interval = currentDifficulty.rippleInterval;
    
    for (let i = 0; i < totalBeats; i++) {
      const timestamp = i * interval;
      beats.push({
        timestamp,
        direction: Math.floor(Math.random() * trackCount),
        isCorrect: Math.random() > (1 - currentDifficulty.correctRate),
        size: currentDifficulty.rippleSize.min + Math.random() * (currentDifficulty.rippleSize.max - currentDifficulty.rippleSize.min),
        speed: currentDifficulty.rippleSpeed.min + Math.random() * (currentDifficulty.rippleSpeed.max - currentDifficulty.rippleSpeed.min),
      });
    }
    return beats;
  };

  // 游戏循环
  useEffect(() => {
    if (gameActive) {
      const gameLoop = (timestamp) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const deltaTime = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;
        
        // 更新波纹位置
        setRipples(prevRipples => {
          const updatedRipples = prevRipples.filter(ripple => ripple.update(deltaTime));
          return updatedRipples;
        });
        
        // 更新粒子
        setParticles(prevParticles => {
          const updatedParticles = prevParticles.filter(particle => particle.update(deltaTime));
          return updatedParticles;
        });
        
        // 检查节拍
        const elapsedTime = timestamp - gameStartTimeRef.current;
        while (currentBeatIndex < beatTimestamps.length && elapsedTime >= beatTimestamps[currentBeatIndex].timestamp) {
          const beat = beatTimestamps[currentBeatIndex];
          setRipples(prev => [
            ...prev,
            new Ripple(rippleIdCounter.current++, beat.direction, beat.isCorrect, beat.size, beat.speed)
          ]);
          setCurrentBeatIndex(prev => prev + 1);
        }
        
        // 更新歌曲进度
        setSongProgress(prev => Math.min(100, prev + (deltaTime * 100) / 60)); // 假设60秒歌曲
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      
      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    }
  }, [gameActive, currentBeatIndex, beatTimestamps]);
  
  // 生成波纹（用于手动触发）
  const generateRipple = () => {
    const direction = Math.floor(Math.random() * trackCount);
    const isCorrect = Math.random() > (1 - currentDifficulty.correctRate);
    const size = currentDifficulty.rippleSize.min + Math.random() * (currentDifficulty.rippleSize.max - currentDifficulty.rippleSize.min);
    const speed = currentDifficulty.rippleSpeed.min + Math.random() * (currentDifficulty.rippleSpeed.max - currentDifficulty.rippleSpeed.min);
    
    setRipples(prevRipples => [
      ...prevRipples,
      new Ripple(rippleIdCounter.current++, direction, isCorrect, size, speed)
    ]);
  };
  
  // 计算触摸方向
  const calculateDirection = (x, y) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);
    let normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    normalizedAngle += trackAngle / 2; // 调整起始角度
    if (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;
    return Math.floor(normalizedAngle / trackAngle);
  };
  
  // 计算触摸距离
  const calculateDistance = (x, y) => {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // 处理滑动手势
  const handleSwipe = (event) => {
    if (!gameActive) return;
    
    const { x, y, translationX, translationY } = event;
    const startDistance = calculateDistance(x - translationX, y - translationY);
    const endDistance = calculateDistance(x, y);
    const direction = calculateDirection(x, y);
    
    // 判定是向内还是向外滑动
    const isInward = endDistance < startDistance;
    
    // 检查是否击中波纹
    setRipples(prevRipples => {
      const hitRipple = prevRipples.find(ripple => 
        ripple.direction === direction && 
        Math.abs(ripple.position - (endDistance / (Math.min(width, height) / 2))) < 0.1
      );
      
      if (hitRipple) {
        const theme = colorThemes[selectedTheme];
        const color = hitRipple.isCorrect ? theme.primary : errorColors[selectedTheme][0];
        
        // 生成粒子效果
        const hitX = centerX + Math.cos(hitRipple.direction * trackAngle) * (endDistance);
        const hitY = centerY + Math.sin(hitRipple.direction * trackAngle) * (endDistance);
        generateParticles(hitX, hitY, color);
        
        // 正确操作
        if ((isInward && hitRipple.isCorrect) || (!isInward && !hitRipple.isCorrect)) {
          setCombo(prev => prev + 1);
          setPurity(prev => Math.min(100, prev + 5));
          setScore(prev => prev + 100 * (combo + 1));
        } else {
          // 错误操作
          setCombo(0);
          setPurity(prev => Math.max(0, prev - 10));
        }
        
        // 移除被击中的波纹
        return prevRipples.filter(ripple => ripple.id !== hitRipple.id);
      }
      
      return prevRipples;
    });
  };
  
  // 处理画圆手势
  const handleCircle = (event) => {
    if (!gameActive) return;
    
    // 清除屏幕上所有错误波纹
    setRipples(prevRipples => {
      const errorRipples = prevRipples.filter(ripple => !ripple.isCorrect);
      // 为每个错误波纹生成粒子效果
      errorRipples.forEach(ripple => {
        const theme = colorThemes[selectedTheme];
        const color = errorColors[selectedTheme][0];
        const rippleX = centerX + Math.cos(ripple.direction * trackAngle) * (ripple.position * (Math.min(width, height) / 2));
        const rippleY = centerY + Math.sin(ripple.direction * trackAngle) * (ripple.position * (Math.min(width, height) / 2));
        generateParticles(rippleX, rippleY, color, 5);
      });
      return prevRipples.filter(ripple => ripple.isCorrect);
    });
    
    // 生成中心爆炸粒子效果
    const theme = colorThemes[selectedTheme];
    generateParticles(centerX, centerY, theme.primary, 20);
    
    setCombo(prev => prev + 3);
    setPurity(prev => Math.min(100, prev + 15));
    setScore(prev => prev + 500 * (combo + 1));
  };
  
  // 加载并播放音乐
  const loadAndPlayMusic = async () => {
    try {
      // 尝试加载音频文件
      // 注意：实际项目中需要添加真实的音频文件
      // const { sound } = await Audio.Sound.createAsync(
      //   require('./assets/sounds/sample.mp3'),
      //   { isLooping: true }
      // );
      // soundRef.current = sound;
      // await sound.playAsync();
      // setCurrentSong(sound);
      console.log('Music would play here');
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };
  
  // 停止音乐
  const stopMusic = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setCurrentSong(null);
      } catch (error) {
        console.error('Error stopping music:', error);
      }
    }
  };
  
  // 开始游戏
  const startGame = () => {
    setScore(0);
    setCombo(0);
    setPurity(100);
    setRipples([]);
    setParticles([]);
    setSongProgress(0);
    setCurrentBeatIndex(0);
    const beatMap = generateBeatMap();
    setBeatTimestamps(beatMap);
    gameStartTimeRef.current = performance.now();
    setGameActive(true);
    loadAndPlayMusic();
  };
  
  // 结束游戏
  const endGame = () => {
    setGameActive(false);
    stopMusic();
  };
  
  // 动画样式
  const ballAnimatedStyle = useAnimatedStyle(() => {
    const theme = colorThemes[selectedTheme];
    const glowIntensity = purity / 100 * ballGlow.value;
    
    return {
      transform: [{ scale: ballScale.value }],
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8 * glowIntensity,
      shadowRadius: 20 * glowIntensity,
    };
  });
  
  // 计算污染颜色
  const getContaminatedColor = () => {
    const theme = colorThemes[selectedTheme];
    const contamination = 1 - (purity / 100);
    
    // 混合错误颜色
    const errorColor = errorColors[selectedTheme][0];
    const errorColorR = parseInt(errorColor.slice(1, 3), 16);
    const errorColorG = parseInt(errorColor.slice(3, 5), 16);
    const errorColorB = parseInt(errorColor.slice(5, 7), 16);
    
    const primaryColorR = parseInt(theme.primary.slice(1, 3), 16);
    const primaryColorG = parseInt(theme.primary.slice(3, 5), 16);
    const primaryColorB = parseInt(theme.primary.slice(5, 7), 16);
    
    const mixedR = Math.round(primaryColorR * (1 - contamination) + errorColorR * contamination);
    const mixedG = Math.round(primaryColorG * (1 - contamination) + errorColorG * contamination);
    const mixedB = Math.round(primaryColorB * (1 - contamination) + errorColorB * contamination);
    
    return `#${mixedR.toString(16).padStart(2, '0')}${mixedG.toString(16).padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
  };
  
  // 绘制轨道
  const renderTracks = () => {
    return Array.from({ length: trackCount }).map((_, index) => {
      const angle = index * trackAngle;
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + Math.cos(angle) * (Math.min(width, height) / 2);
      const y2 = centerY + Math.sin(angle) * (Math.min(width, height) / 2);
      
      return (
        <View key={index} style={styles.track}>
          <View 
            style={[
              styles.trackLine,
              {
                transform: [
                  { translateX: x1 },
                  { translateY: y1 },
                  { rotate: `${angle * 180 / Math.PI}deg` }
                ]
              }
            ]} 
          />
        </View>
      );
    });
  };
  
  // 绘制波纹
  const renderRipples = () => {
    return ripples.map(ripple => {
      const angle = ripple.direction * trackAngle;
      const radius = ripple.position * (Math.min(width, height) / 2);
      const theme = colorThemes[selectedTheme];
      const color = ripple.isCorrect ? theme.primary : errorColors[selectedTheme][0];
      
      return (
        <View 
          key={ripple.id} 
          style={[
            styles.ripple,
            {
              left: centerX + Math.cos(angle) * radius - ripple.size / 2,
              top: centerY + Math.sin(angle) * radius - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color,
              opacity: 0.8 - ripple.position * 0.8,
            }
          ]} 
        />
      );
    });
  };
  
  // 绘制粒子效果
  const renderParticles = () => {
    return particles.map((particle, index) => {
      const alpha = particle.life / particle.maxLife;
      return (
        <View 
          key={`particle-${index}`} 
          style={[
            styles.particle,
            {
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: alpha,
            }
          ]} 
        />
      );
    });
  };
  
  // 手势配置
  const swipeGesture = Gesture.Pan()
    .onEnd(handleSwipe);
  
  const circleGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onUpdate((event) => {
      // 收集手势轨迹点
      // 这里可以添加更复杂的轨迹分析逻辑
    })
    .onEnd((event) => {
      // 优化的画圆判定：检查移动距离、方向变化和轨迹
      const { translationX, translationY, velocityX, velocityY } = event;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      // 更严格的画圆判定条件
      // 1. 移动距离足够大
      // 2. 速度适中
      // 3. 轨迹应该形成一个近似圆形
      if (distance > 150 && velocity > 100) {
        // 计算轨迹的圆形度（简化版）
        // 这里可以添加更复杂的圆形度计算
        const aspectRatio = Math.abs(translationX / translationY);
        if (aspectRatio > 0.5 && aspectRatio < 2) {
          handleCircle(event);
        }
      }
    });
  
  const composedGesture = Gesture.Simultaneous(swipeGesture, circleGesture);
  
  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        {/* 背景 */}
        <View style={styles.background}>
          {/* 星空粒子效果 */}
          {Array.from({ length: 50 }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.star,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: 0.3 + Math.random() * 0.7,
                  transform: [{ scale: 0.5 + Math.random() }]
                }
              ]} 
            />
          ))}
        </View>
        
        {/* 轨道 */}
        {renderTracks()}
        
        {/* 波纹 */}
        {renderRipples()}
        
        {/* 粒子效果 */}
        {renderParticles()}
        
        {/* 中心小球 */}
        <Animated.View 
          style={[
            styles.centerBall,
            ballAnimatedStyle,
            { backgroundColor: getContaminatedColor() }
          ]} 
        />
        
        {/* 游戏信息 */}
        {gameActive && (
          <View style={styles.gameInfo}>
            <Text style={styles.comboText}>{combo > 0 ? `COMBO: ${combo}` : ''}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${songProgress}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        {/* 游戏控制 */}
        {!gameActive && (
          <View style={styles.menu}>
            <Text style={styles.title}>ChromaBeat</Text>
            <Text style={styles.subtitle}>色彩守护者</Text>
            
            <View style={styles.themeSelector}>
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
            
            <Text style={styles.sectionTitle}>难度选择</Text>
            <View style={styles.difficultySelector}>
              {Object.keys(difficultyLevels).map(difficulty => (
                <Pressable 
                  key={difficulty} 
                  style={[
                    styles.difficultyButton,
                    selectedDifficulty === difficulty && styles.difficultyButtonActive,
                    { backgroundColor: selectedDifficulty === difficulty ? colorThemes[selectedTheme].primary : 'rgba(255, 255, 255, 0.2)' }
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    selectedDifficulty === difficulty && styles.difficultyButtonTextActive
                  ]}>
                    {difficultyLevels[difficulty].name}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Pressable 
              style={[
                styles.startButton,
                { backgroundColor: colorThemes[selectedTheme].primary }
              ]}
              onPress={startGame}
            >
              <Text style={styles.startButtonText}>开始游戏</Text>
            </Pressable>
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  trackLine: {
    position: 'absolute',
    width: 2,
    height: Math.min(width, height) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerBall: {
    position: 'absolute',
    left: centerX - 30,
    top: centerY - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 10,
  },
  ripple: {
    position: 'absolute',
    borderRadius: 50,
  },
  gameInfo: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comboText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressBar: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  menu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#FF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 60,
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
    gap: 20,
  },
  themeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  themeButtonActive: {
    borderColor: '#FFFFFF',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  difficultySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 60,
    gap: 10,
  },
  difficultyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  difficultyButtonActive: {
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
  },
  difficultyButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  startButton: {
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 30,
    boxShadow: '0 0 30px rgba(255, 68, 68, 0.8)',
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ChromaBeatGame />
    </GestureHandlerRootView>
  );
}