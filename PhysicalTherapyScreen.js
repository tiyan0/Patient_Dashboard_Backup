import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhysicalTherapyScreen({ navigation }) {
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Quad Sets', desc: '3 sets × 15 reps • 2x daily', completed: true },
    { id: '2', name: 'Straight Leg Raises', desc: '3 sets × 10 reps • 2x daily', completed: true },
    { id: '3', name: 'Heel Slides', desc: '3 sets × 12 reps • 2x daily', completed: false },
    { id: '4', name: 'Ankle Pumps', desc: '3 sets × 20 reps • 3x daily', completed: false },
  ]);

  const upcomingSessions = [
    { id: 's1', type: 'In-Person Session', focus: 'Strength & Mobility', status: 'Scheduled', date: 'April 2, 2026', time: '3:00 PM', location: 'PT Clinic - Room 201' },
    { id: 's2', type: 'In-Person Session', focus: 'Range of Motion', status: 'Scheduled', date: 'April 9, 2026', time: '3:00 PM', location: 'PT Clinic - Room 201' },
  ];

  const toggleExercise = (id) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, completed: true } : ex));
  };

  const completedCount = exercises.filter(ex => ex.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Dashboard');
            }
          }}
        >
          <Ionicons name="chevron-back" size={23} color="#071C3A" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="fitness-outline" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Physical Therapy</Text>
          <Text style={styles.headerSubtitle}>Track your rehabilitation progress and exercises</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.topActionRow}>
          <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('BookTherapy')}>
            <Ionicons name="calendar-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>

        {/* Active Program Box */}
        <View style={styles.card}>
          <View style={styles.rowSpaceBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.programTitle}>Knee Rehabilitation</Text>
              <Text style={styles.programTherapist}>Dr. Emily Rodriguez, PT, DPT</Text>
            </View>
            <View style={styles.badgeActive}><Text style={styles.badgeActiveText}>Active</Text></View>
          </View>
          
          <View style={{ marginTop: 16 }}>
            <Text style={styles.progressLabel}>Progress <Text style={{fontWeight: '700', color: '#0F172A'}}>3 / 12 sessions</Text></Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
          </View>

          <View style={styles.nextSessionBox}>
            <Text style={styles.nextSessionLabel}>Next Session</Text>
            <Text style={styles.nextSessionValue}>April 2, 2026 • 3:00 PM</Text>
            <View style={styles.nextSessionRow}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.nextSessionLocation}>PT Clinic - Room 201</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.fullScheduleBtn}>
            <Text style={styles.fullScheduleBtnText}>View Full Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Metrics */}
        <Text style={styles.sectionTitle}>Progress Metrics</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Pain Level</Text>
            <Text style={styles.metricValue}>3/10</Text>
            <Text style={styles.metricBaseline}>Baseline: 8/10</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Flexibility</Text>
            <Text style={styles.metricValue}>75%</Text>
            <Text style={styles.metricBaseline}>Baseline: 40%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Strength</Text>
            <Text style={styles.metricValue}>60%</Text>
            <Text style={styles.metricBaseline}>Baseline: 30%</Text>
          </View>
        </View>

        {/* Today's Home Exercises */}
        <View style={[styles.rowSpaceBetween, { marginTop: 4, alignItems: 'flex-end', marginBottom: 12 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Today's Home Exercises</Text>
          <Text style={styles.completedCount}>{completedCount} / {exercises.length} completed</Text>
        </View>

        {exercises.map(ex => (
          <View key={ex.id} style={styles.exerciseCard}>
            <View style={styles.rowSpaceBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exName, ex.completed && styles.exNameCompleted]}>{ex.name}</Text>
                <Text style={styles.exDesc}>{ex.desc}</Text>
              </View>
              {ex.completed && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
            </View>
            {!ex.completed && (
              <View style={styles.exActionRow}>
                <TouchableOpacity style={styles.exOutlineBtn}>
                  <Ionicons name="play-circle-outline" size={16} color="#089FB4" style={{ marginRight: 4 }} />
                  <Text style={styles.exOutlineBtnText}>Watch Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exBlueBtn} onPress={() => {}}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.exBlueBtnText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Upcoming Sessions */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Upcoming Sessions</Text>
        {upcomingSessions.map(sess => (
          <View key={sess.id} style={styles.card}>
            <View style={styles.rowSpaceBetween}>
              <Text style={styles.sessType}>{sess.type}</Text>
              <View style={styles.badgeScheduled}><Text style={styles.badgeScheduledText}>{sess.status}</Text></View>
            </View>
            <Text style={styles.sessFocus}>Focus: {sess.focus}</Text>
            
            <View style={styles.sessDetails}>
              <View style={styles.sessDetailRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.sessDetailText}>{sess.date}</Text>
              </View>
              <View style={styles.sessDetailRow}>
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.sessDetailText}>{sess.time}</Text>
              </View>
              <View style={styles.rowSpaceBetween}>
                <View style={styles.sessDetailRow}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.sessDetailText}>{sess.location}</Text>
                </View>
              </View>
            </View>

            <View style={styles.exActionRow}>
              <TouchableOpacity style={styles.sessOutlineBtn}>
                <Text style={styles.sessOutlineBtnText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sessOutlineBtn}>
                <Text style={styles.sessOutlineBtnText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Achievement Box */}
        <View style={styles.achievementBox}>
          <View style={styles.achievementIconBg}>
            <Ionicons name="trophy" size={24} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.achievementTitle}>Great Progress!</Text>
            <Text style={styles.achievementSub}>You've completed 25% of your rehabilitation program. Keep it up!</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'android' ? 8 : 5,
    paddingBottom: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#089FB4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071C3A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#45627F',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topActionRow: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#089FB4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  programTherapist: {
    fontSize: 13,
    color: '#64748B',
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  nextSessionBox: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nextSessionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  nextSessionValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  nextSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextSessionLocation: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
  },
  fullScheduleBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  fullScheduleBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricBaseline: {
    fontSize: 11,
    color: '#94A3B8',
  },
  completedCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  exerciseCard: {
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
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  exNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  exDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  exActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  exOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#089FB4',
    borderRadius: 8,
    paddingVertical: 8,
  },
  exOutlineBtnText: {
    color: '#089FB4',
    fontSize: 12,
    fontWeight: '700',
  },
  exBlueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 8,
  },
  exBlueBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sessType: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sessFocus: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
    marginTop: 4,
  },
  sessDetails: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sessDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessDetailText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 6,
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
  badgeScheduled: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeScheduledText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  sessOutlineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
  },
  sessOutlineBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  achievementBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  achievementIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementTitle: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  achievementSub: {
    color: '#047857',
    fontSize: 13,
    lineHeight: 18,
  },
});
