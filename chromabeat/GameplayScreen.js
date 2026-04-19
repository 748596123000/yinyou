import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const GameplayScreen = ({
  combo,
  score,
  purity,
  accuracy,
  songProgress,
  currentSong,
  isPlaying,
  onPause,
  onResume,
  ripples,
  onPrev,
  onNext,
  children
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = formatTime((songProgress || 0) * (currentSong?.duration || 254));
  const totalTime = formatTime(currentSong?.duration || 254);

  return (
    <View style={styles.container}>
      {/* 顶部HUD栏 */}
      <View style={styles.topHUD}>
        <Pressable onPress={isPlaying ? onPause : onResume} style={styles.pauseButton}>
          <Text style={styles.pauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {currentSong?.name || 'STARDUST DRIFT'}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {currentSong?.artist || 'NOW PLAYING'}
          </Text>
        </View>
        
        <View style={styles.comboContainer}>
          <Text style={styles.comboLabel}>COMBO</Text>
          <Text style={styles.comboNumber}>{combo || 0}</Text>
        </View>
      </View>

      {/* 主游戏区域 */}
      <View style={styles.gameArea}>
        {children}
        
        {/* 右侧统计面板 */}
        <View style={styles.statsPanel}>
          <View style={styles.accuracyCircle}>
            <Text style={styles.accuracyValue}>{(accuracy || 95).toFixed(1)}%</Text>
            <Text style={styles.accuracyLabel}>ACCURACY</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{(score || 0).toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* 底部控制区 */}
      <View style={styles.bottomArea}>
        {/* 进度条 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTime}>{currentTime}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(songProgress || 0) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressTime}>{totalTime}</Text>
        </View>

        {/* 播放控制按钮 */}
        <View style={styles.controlsRow}>
          <Pressable onPress={onPrev} style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏮</Text>
          </Pressable>
          
          <Pressable 
            onPress={isPlaying ? onPause : onResume} 
            style={[styles.controlButton, styles.playButton]}
          >
            <Text style={[styles.controlIcon, styles.playIcon]}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </Pressable>
          
          <Pressable onPress={onNext} style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏭</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  topHUD: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(68, 170, 255, 0.1)',
  },
  pauseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(68, 170, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(68, 170, 255, 0.4)',
  },
  pauseIcon: {
    fontSize: 16,
    color: '#44AAFF',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  songArtist: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  comboContainer: {
    alignItems: 'flex-end',
  },
  comboLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF88CC',
    letterSpacing: 1,
  },
  comboNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF44FF',
    textShadowColor: '#FF44FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statsPanel: {
    position: 'absolute',
    right: 16,
    top: '30%',
    backgroundColor: 'rgba(12, 12, 18, 0.75)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(68, 170, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  accuracyCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#44AAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  accuracyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44AAFF',
  },
  accuracyLabel: {
    fontSize: 9,
    color: '#888888',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTime: {
    fontSize: 11,
    color: '#AAAAAA',
    fontFamily: 'monospace',
    width: 45,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#44AAFF',
    borderRadius: 3,
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButton: {
    backgroundColor: 'rgba(68, 170, 255, 0.2)',
    borderColor: '#44AAFF',
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  controlIcon: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  playIcon: {
    color: '#44AAFF',
    fontSize: 20,
  },
});

export default GameplayScreen;
