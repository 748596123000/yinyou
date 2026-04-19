import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ResultScreen = ({
  grade,
  purity,
  accuracy,
  maxCombo,
  circleSuccesses,
  totalScore,
  onRetry,
  onBackToMenu
}) => {
  const getGradeColor = (g) => {
    switch (g?.toUpperCase()) {
      case 'S': return '#FFD700';
      case 'A': return '#C0C0C0';
      case 'B': return '#CD7F32';
      case 'C': return '#888888';
      default: return '#666666';
    }
  };

  const getGradeLabel = (purityValue) => {
    if (purityValue >= 95) return '纯净';
    if (purityValue >= 85) return '优秀';
    if (purityValue >= 70) return '良好';
    if (purityValue >= 60) return '及格';
    return '混浊';
  };

  const absorptionRate = Math.round((accuracy || 0.95) * 100);
  const repelRate = 100 - absorptionRate;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 顶部标题 */}
        <Text style={styles.headerTitle}>SESSION COMPLETE</Text>

        {/* 等级评定 */}
        <View style={styles.gradeSection}>
          <Text style={[styles.gradeLetter, { color: getGradeColor(grade) || '#FFD700' }]}>
            {grade || 'S'}
          </Text>
          <Text style={styles.purityNumber}>{purity || 96}%</Text>
          <Text style={styles.purityLabel}>PURITY</Text>
          <Text style={styles.gradeLabel}>
            {getGradeLabel(purity || 96)}
          </Text>
        </View>

        {/* 颜色对比 */}
        <View style={styles.colorComparison}>
          <View style={styles.colorOrbContainer}>
            <View style={[styles.colorOrb, styles.playerOrb]} />
            <Text style={styles.orbLabel}>PLAYER</Text>
          </View>
          
          <Text style={styles.vsText}>VS</Text>
          
          <View style={styles.colorOrbContainer}>
            <View style={[styles.colorOrb, styles.idealOrb]} />
            <Text style={styles.orbLabel}>IDEAL</Text>
          </View>
        </View>

        {/* 统计数据面板 */}
        <View style={styles.statsPanel}>
          {/* 正确吸收率 */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>正确吸收率</Text>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBar, { width: `${absorptionRate}%`, backgroundColor: '#44CC44' }]}/>
            </View>
            <Text style={styles.statValue}>{absorptionRate}%</Text>
          </View>

          {/* 错误弹开率 */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>错误弹开率</Text>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBar, { width: `${repelRate}%`, backgroundColor: '#FF4488' }]}/>
            </View>
            <Text style={styles.statValue}>{repelRate}%</Text>
          </View>

          {/* 最大连击 */}
          <View style={styles.statRowLarge}>
            <View style={styles.statItemCentered}>
              <Text style={styles.statMiniLabel}>MAX COMBO</Text>
              <Text style={styles.statBigNumber}>{maxCombo || 156}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItemCentered}>
              <Text style={styles.statMiniLabel}>CIRCLE WIN</Text>
              <Text style={styles.statBigNumber}>{circleSuccesses || 8}x</Text>
            </View>
          </View>

          {/* 总得分 */}
          <View style={styles.totalScoreSection}>
            <Text style={styles.totalScoreLabel}>TOTAL SCORE</Text>
            <Text style={styles.totalScoreNumber}>
              {(totalScore || 1248390).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.buttonRow}>
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <LinearGradient
              colors={['#44AAFF', '#0066FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButtonGradient}
            >
              <Text style={styles.retryButtonText}>↺ 重试</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onBackToMenu} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>返回菜单</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ACBFF',
    letterSpacing: 2,
    marginBottom: 30,
  },
  gradeSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  gradeLetter: {
    fontSize: 80,
    fontWeight: 'bold',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  purityNumber: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#44AAFF',
    marginTop: 8,
  },
  purityLabel: {
    fontSize: 18,
    color: '#E4E1E9',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 1,
  },
  gradeLabel: {
    fontSize: 16,
    color: '#888888',
    marginTop: 6,
  },
  colorComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 35,
    gap: 24,
  },
  colorOrbContainer: {
    alignItems: 'center',
  },
  colorOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  playerOrb: {
    backgroundColor: '#4A5A5A',
    borderWidth: 2,
    borderColor: '#3A4A4A',
  },
  idealOrb: {
    backgroundColor: '#44AAFF',
    shadowColor: '#44AAFF',
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  orbLabel: {
    fontSize: 11,
    color: '#888888',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  vsText: {
    fontSize: 16,
    color: '#555555',
    fontWeight: 'bold',
  },
  statsPanel: {
    width: '100%',
    backgroundColor: 'rgba(15, 15, 20, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(68, 170, 255, 0.15)',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  statLabel: {
    fontSize: 13,
    color: '#AAAAAA',
    width: 90,
    fontWeight: '500',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: 45,
    textAlign: 'right',
  },
  statRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statItemCentered: {
    alignItems: 'center',
  },
  statMiniLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statBigNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalScoreSection: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(68, 170, 255, 0.15)',
  },
  totalScoreLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 1,
  },
  totalScoreNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#44AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
    height: 54,
  },
  retryButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  menuButton: {
    flex: 1,
    height: 54,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default ResultScreen;
