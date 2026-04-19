import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MainMenuScreen = ({
  selectedTheme,
  setSelectedTheme,
  selectedDifficulty,
  setSelectedDifficulty,
  currentSong,
  currentBPM,
  onStartGame
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const themes = [
    { key: 'red', color: '#FF4444' },
    { key: 'blue', color: '#44AAFF' },
    { key: 'purple', color: '#AA44FF' },
    { key: 'green', color: '#44CC44' },
    { key: 'gold', color: '#FFD700' },
    { key: 'orange', color: '#FFAA44' },
    { key: 'cyan', color: '#44EEDD' },
    { key: 'pink', color: '#FF88CC' },
    { key: 'darkRed', color: '#993344' },
    { key: 'warmYellow', color: '#FFDAB9' },
  ];

  const difficulties = [
    { key: 'beginner', label: '入门' },
    { key: 'intermediate', label: '进阶' },
    { key: 'expert', label: '大师' },
    { key: 'nightmare', label: '噩梦' },
  ];

  return (
    <Pressable
      style={styles.container}
      onPress={() => isDropdownOpen && setIsDropdownOpen(false)}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isDropdownOpen}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部标题区域 */}
        <View style={styles.header}>
          <Text style={styles.title}>CHROMABEAT</Text>
          <Text style={styles.subtitle}>色彩守护者</Text>
        </View>

        {/* 中心光球和轨道 */}
        <View style={styles.centerOrbContainer}>
          <View style={[styles.orbitRing, styles.orbitRing1]} />
          <View style={[styles.orbitRing, styles.orbitRing2]} />
          <View style={[styles.orbitRing, styles.orbitRing3]} />
          <View style={styles.coreOrb} />

          {/* 8条轨道线 */}
          {[...Array(8)].map((_, i) => (
            <View
              key={`track-${i}`}
              style={[
                styles.trackLine,
                {
                  transform: [
                    { rotate: `${i * 45}deg` }
                  ]
                }
              ]}
            />
          ))}
        </View>

        {/* 主题选择器 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择主题</Text>
          <View style={styles.themeSelector}>
            {themes.map((theme) => (
              <Pressable
                key={theme.key}
                onPress={() => setSelectedTheme(theme.key)}
                style={[
                  styles.themeOrb,
                  { backgroundColor: theme.color },
                  selectedTheme === theme.key && styles.themeOrbSelected
                ]}
              />
            ))}
          </View>
        </View>

        {/* 歌曲信息卡片 */}
        <View style={styles.songCard}>
          <View style={styles.songColorDot} />
          <View style={styles.songInfo}>
            <Text style={styles.songName}>{currentSong?.name || '爱琴海'}</Text>
            <Text style={styles.songArtist}>{currentSong?.artist || '周杰伦'}</Text>
          </View>
          <View style={styles.songMeta}>
            <Text style={styles.bpmValue}>{currentBPM || 88}</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>
        </View>

        {/* 难度选择 - 下拉菜单 */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.sectionTitle}>选择难度</Text>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <Text style={styles.dropdownTriggerText}>
              {difficulties.find(d => d.key === selectedDifficulty)?.label || '入门'}
            </Text>
            <Text style={styles.dropdownArrow}>
              {isDropdownOpen ? '▲' : '▼'}
            </Text>
          </Pressable>

          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {difficulties.map((diff) => (
                <Pressable
                  key={diff.key}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedDifficulty(diff.key);
                    setIsDropdownOpen(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    selectedDifficulty === diff.key && styles.dropdownItemSelected
                  ]}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedDifficulty === diff.key && styles.dropdownItemTextSelected
                  ]}>
                    {diff.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* BPM 显示 - 紧凑版 */}
        <View style={styles.bpmDisplayCompact}>
          <Text style={styles.bpmNumberCompact}>{currentBPM || 88}</Text>
          <Text style={styles.bpmUnitCompact}>BPM</Text>
        </View>

        {/* 开始按钮 */}
        <Pressable onPress={onStartGame} style={styles.startButton}>
          <LinearGradient
            colors={['#44AAFF', '#0066FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>▶ 开始游戏</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9ACBFF',
    marginTop: 5,
    letterSpacing: 2,
  },
  centerOrbContainer: {
    width: Math.min(width, height) * 0.45,
    height: Math.min(width, height) * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  coreOrb: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#44AAFF',
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  orbitRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(68, 170, 255, 0.2)',
  },
  orbitRing1: {
    width: 90,
    height: 90,
  },
  orbitRing2: {
    width: 135,
    height: 135,
  },
  orbitRing3: {
    width: 180,
    height: 180,
  },
  trackLine: {
    position: 'absolute',
    width: 2,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    left: '50%',
    top: '10%',
    transformOrigin: 'top center',
  },
  section: {
    width: '100%',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E1E9',
    marginBottom: 8,
    textAlign: 'center',
  },
  themeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  themeOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.7,
  },
  themeOrbSelected: {
    opacity: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.15 }],
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 19, 25, 0.8)',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(154, 203, 255, 0.2)',
  },
  songColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#44AAFF',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    color: '#888888',
  },
  songMeta: {
    alignItems: 'flex-end',
  },
  bpmValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44AAFF',
  },
  bpmLabel: {
    fontSize: 11,
    color: '#888888',
  },
  // 下拉选择器样式
  dropdownContainer: {
    width: '100%',
    marginBottom: 18,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 31, 37, 0.8)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(68, 170, 255, 0.4)',
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#44AAFF',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: 'rgba(19, 19, 25, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(68, 170, 255, 0.3)',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(68, 170, 255, 0.15)',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#BFC7D3',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#44AAFF',
    fontWeight: 'bold',
  },
  // 紧凑版BPM显示
  bpmDisplayCompact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  bpmNumberCompact: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bpmUnitCompact: {
    fontSize: 14,
    color: '#44AAFF',
    marginLeft: 6,
  },
  startButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    width: width * 0.85,
    height: 50,
  },
  startButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});

export default MainMenuScreen;
