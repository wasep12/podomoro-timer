import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePomodoro } from '@/context/PomodoroContext';
import { Clock, Calendar, Timer } from 'lucide-react-native';

export default function StatisticsScreen() {
  const { stats } = usePomodoro();
  
  const statCards = [
    {
      title: 'Focus Sessions',
      value: stats.completedFocus,
      icon: <Timer size={24} color="#6366f1" />,
      color: '#ede9fe',
    },
    {
      title: 'Short Breaks',
      value: stats.completedShortBreaks,
      icon: <Clock size={24} color="#10b981" />,
      color: '#ecfdf5',
    },
    {
      title: 'Long Breaks',
      value: stats.completedLongBreaks,
      icon: <Calendar size={24} color="#0ea5e9" />,
      color: '#f0f9ff',
    },
    {
      title: 'Total Focus Time',
      value: `${stats.totalFocusTime} min`,
      icon: <Clock size={24} color="#8b5cf6" />,
      color: '#f5f3ff',
    },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: stat.color }]}
            >
              <View style={styles.statIcon}>{stat.icon}</View>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Summary</Text>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average Focus Time</Text>
              <Text style={styles.summaryValue}>
                {stats.completedFocus > 0
                  ? Math.round(stats.totalFocusTime / stats.completedFocus)
                  : 0}{' '}
                min
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Sessions</Text>
              <Text style={styles.summaryValue}>
                {stats.completedFocus + stats.completedShortBreaks + stats.completedLongBreaks}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Productivity Score</Text>
              <Text style={styles.summaryValue}>
                {stats.completedFocus > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (stats.completedFocus /
                          (stats.completedFocus +
                            Math.max(0, stats.completedShortBreaks - stats.completedFocus) * 0.5 +
                            Math.max(0, stats.completedLongBreaks - stats.completedFocus / 4) * 0.25)) *
                          100
                      )
                    )
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statIcon: {
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  summary: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#334155',
  },
  summaryContent: {
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#475569',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#334155',
  },
});