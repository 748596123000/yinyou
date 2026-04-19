import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const TestScreen = () => {
  const [screen, setScreen] = useState('menu');
  
  if (screen === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>CHROMABEAT</Text>
        <Text style={styles.subtitle}>色彩守护者</Text>
        
        <View style={styles.orbContainer}>
          <View style={styles.coreOrb} />
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.track,
                { transform: [{ rotate: `${i * 45}deg` }] }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.themeRow}>
          {['#FF4444', '#44AAFF', '#AA44FF', '#44CC44', '#FFD700'].map((color, i) => (
            <View key={i} style={[styles.themeDot, { backgroundColor: color }]} />
          ))}
        </View>
        
        <Pressable 
          onPress={() => setScreen('game')} 
          style={styles.startButton}
        >
          <Text style={styles.startText}>▶ 开始游戏</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>游戏进行中</Text>
      <Text style={styles.info}>COMBO: 0 | SCORE: 0</Text>
      
      <View style={styles.gameArea}>
        <View style={styles.coreOrb} />
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.track,
              { transform: [{ rotate: `${i * 45}deg` }] }
            ]}
          />
        ))}
      </View>
      
      <Pressable 
        onPress={() => setScreen('menu')} 
        style={styles.backButton}
      >
        <Text style={styles.backText}>← 返回菜单</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ACBFF',
    marginBottom: 40,
  },
  orbContainer: {
    width: Math.min(width, height) * 0.6,
    height: Math.min(width, height) * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  coreOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#44AAFF',
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  track: {
    position: 'absolute',
    width: 2,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    left: '50%',
    top: '10%',
    transformOrigin: 'top center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  themeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  startButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#44AAFF',
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  startText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gameArea: {
    width: Math.min(width, height) * 0.7,
    height: Math.min(width, height) * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 30,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default TestScreen;
