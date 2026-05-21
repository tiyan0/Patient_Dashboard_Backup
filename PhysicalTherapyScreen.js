import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  LinearProgress,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhysicalTherapyScreen({ navigation }) {
  const sessions = [
    {
      id: '1',
      therapist: 'Dr. Michael Chen',
      specialty: 'Sports Medicine',
      date: 'March 20, 2026',
      time: '2:00 PM',
      status: 'Scheduled',
      progress: 65,
    },
    {
      id: '2',
      therapist: 'Lisa Rodriguez',
      specialty: 'Orthopedic Rehab',
      date: 'March 22, 2026',
      time: '10:30 AM',
      status: 'Scheduled',
      progress: 65,
    },
    {
      id: '3',
      therapist: 'Dr. Michael Chen',
      specialty: 'Sports Medicine',
      date: 'March 27, 2026',
      time: '2:00 PM',
      status: 'Pending',
      progress: 65,
    },
  ];

  const rootNavigation = navigation.getParent?.()?.getParent?.() || navigation.getParent?.() || navigation;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (rootNavigation.canGoBack()) {
              rootNavigation.goBack();
            } else {
              rootNavigation.navigate('Dashboard');
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Physical Therapy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Recovery Progress</Text>
            <Text style={styles.progressPercent}>65%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressText}>
            You're 65% through your recovery plan. Great work!
          </Text>
        </View>

        {/* Sessions List */}
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        <FlatList
          data={sessions}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.rowSpaceBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.therapistName}>{item.therapist}</Text>
                  <Text style={styles.specialty}>{item.specialty}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    item.status === 'Scheduled'
                      ? styles.badgeActive
                      : styles.badgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.status === 'Scheduled'
                        ? styles.badgeActiveText
                        : styles.badgePendingText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.dateTimeText}>{item.date}</Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.dateTimeText}>{item.time}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  therapistName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    color: '#64748B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#E0F2FE',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeActiveText: {
    color: '#0284C7',
  },
  badgePendingText: {
    color: '#D97706',
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#0AB4B5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#0AB4B5',
    fontSize: 13,
    fontWeight: '600',
  },
});
