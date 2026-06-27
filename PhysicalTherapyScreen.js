import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { currentUser } from './config';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PhysicalTherapyScreen({ navigation }) {
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123'; // Use mock data if no user is logged in, or if it's the mock user

  const [exercises, setExercises] = useState(isMockUser ? [
    { id: '1', name: 'Quad Sets', desc: '3 sets × 15 reps • 2x daily', completed: true },
    { id: '2', name: 'Straight Leg Raises', desc: '3 sets × 10 reps • 2x daily', completed: true },
    { id: '3', name: 'Heel Slides', desc: '3 sets × 12 reps • 2x daily', completed: false },
    { id: '4', name: 'Ankle Pumps', desc: '3 sets × 20 reps • 3x daily', completed: false },
  ] : []);
  
  const [upcomingSessions, setUpcomingSessions] = useState(isMockUser ? [
    { id: 's1', type: 'In-Person Session', focus: 'Strength & Mobility', status: 'Scheduled', date: 'April 2, 2026', time: '3:00 PM', location: 'PT Clinic - Room 201' },
    { id: 's2', type: 'In-Person Session', focus: 'Range of Motion', status: 'Scheduled', date: 'April 9, 2026', time: '3:00 PM', location: 'PT Clinic - Room 201' },
  ] : []);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());

  const toggleExercise = (id) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, completed: true } : ex));
  };

  const handleReschedule = () => {
    if (sessionToReschedule && newDate && newTime) {
      setUpcomingSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionToReschedule.id
            ? { ...session, date: newDate, time: newTime }
            : session
        )
      );
      setShowRescheduleModal(false);
      setSessionToReschedule(null);
      setNewDate('');
      setNewTime(null);
    }
  };

  const openRescheduleModal = (session) => {
    setSessionToReschedule(session);
    // The date string format 'Month Day, Year' (e.g., 'April 2, 2026') is not
    // reliably parsed by `new Date()` across all JavaScript engines (like Hermes).
    // A more robust approach is to parse the string's components manually.
    const dateParts = session.date.replace(',', '').split(' '); // -> ['April', '2', '2026']
    const monthIndex = MONTH_NAMES.findIndex(m => m.toLowerCase() === dateParts[0].toLowerCase());
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
      // Constructing with parts is more reliable than string parsing.
      setViewDate(new Date(year, monthIndex, day));
    } else {
      setViewDate(new Date()); // Fallback to prevent crash
    }
    setNewDate(session.date);
    setNewTime(session.time);
    setShowRescheduleModal(true);
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

        {isMockUser ? (
          <>
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

              <TouchableOpacity style={styles.fullScheduleBtn} onPress={() => navigation.navigate('Appointments')}>
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
                    <TouchableOpacity style={styles.exOutlineBtn} onPress={() => Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}>
                      <Ionicons name="play-circle-outline" size={16} color="#089FB4" style={{ marginRight: 4 }} />
                      <Text style={styles.exOutlineBtnText}>Watch Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exBlueBtn} onPress={() => toggleExercise(ex.id)}>
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
                  <TouchableOpacity style={styles.sessOutlineBtn} onPress={() => openRescheduleModal(sess)}>
                    <Text style={styles.sessOutlineBtnText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sessOutlineBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sess.location)}`)}>
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
          </>
        ) : (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
            <Ionicons name="fitness-outline" size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <Text style={styles.programTitle}>No Active Programs</Text>
            <Text style={[styles.programTherapist, { textAlign: 'center', marginTop: 4 }]}>
              You don't have any active physical therapy programs. Book a session to get started.
            </Text>
          </View>
        )}

      </ScrollView>

      <Modal visible={showRescheduleModal} transparent={true} animationType="slide" onRequestClose={() => setShowRescheduleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Session</Text>
              <TouchableOpacity onPress={() => setShowRescheduleModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.modalSubtitle}>
                Rescheduling for <Text style={{ fontWeight: 'bold' }}>{sessionToReschedule?.focus}</Text> on <Text style={{ fontWeight: 'bold' }}>{sessionToReschedule?.date}</Text> at <Text style={{ fontWeight: 'bold' }}>{sessionToReschedule?.time}</Text>.
              </Text>
              
              <Text style={styles.inputLabel}>Select New Date</Text>
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}><Ionicons name="chevron-back" size={20} color="#45627F" /></TouchableOpacity>
                  <Text style={styles.calendarMonthText}>
                    {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </Text>
                  <TouchableOpacity onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}><Ionicons name="chevron-forward" size={20} color="#45627F" /></TouchableOpacity>
                </View>
                <View style={styles.calendarGridHeader}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.calendarDayContainer} />
                  ))}
                  {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    // Using a hardcoded month name array is more reliable than `toLocaleString`
                    // which can vary based on device locale and cause selection bugs.
                    const dateStr = `${MONTH_NAMES[viewDate.getMonth()]} ${day}, ${viewDate.getFullYear()}`;
                    const isSelected = newDate === dateStr;
                    return (
                      <TouchableOpacity
                        key={day}
                        style={styles.calendarDayContainer}
                        onPress={() => setNewDate(dateStr)}
                      >
                        <View style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}>
                          <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{day}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {newDate?.length > 0 && (
                <>
                  <Text style={[styles.inputLabel, { marginTop: 16 }]}>Select New Time</Text>
                  <View style={styles.timeGrid}>
                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map((t, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.timeButton, newTime === t && styles.timeButtonSelected]}
                        onPress={() => setNewTime(t)}
                      >
                        <Text style={[styles.timeButtonText, newTime === t && styles.timeButtonTextSelected]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowRescheduleModal(false)}>
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSaveButton, (!newDate || !newTime) && styles.modalSaveButtonDisabled]} 
                  onPress={handleReschedule}
                  disabled={!newDate || !newTime}
                >
                  <Text style={styles.modalSaveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarMonthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  calendarGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarDayHeader: {
    width: 32,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayContainer: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDaySelected: {
    backgroundColor: '#089FB4',
  },
  calendarDayText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  timeButtonSelected: {
    borderColor: '#089FB4',
    backgroundColor: '#E0F7FA',
  },
  timeButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  timeButtonTextSelected: {
    color: '#089FB4',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingBottom: 24,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#089FB4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
