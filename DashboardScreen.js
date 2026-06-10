import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { API_URL, currentUser } from './config';

export default function DashboardScreen({ navigation, route }) {
  const isMockUser = !currentUser; // Use mock data only if no user is logged in

  const [pendingReferrals, setPendingReferrals] = useState(isMockUser ? [
    {
      title: 'Specialist Referral - Orthopedic Surgeon',
      subtitle: 'Referred by Dr. Sofia Lim (Cardiologist)',
      reason: 'Knee pain after exercise',
      date: 'February 10, 2026',
      actionType: 'BookSpecialist',
      preselectedDoctor: 'Dr. Miguel Garcia'
    }
  ] : []);

  // Fetch initial referrals from the Sails backend when Dashboard loads
  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`${API_URL}/referral?user=${currentUser.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status} - ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          // Sort so the newest referrals show up at the top
          const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPendingReferrals(prev => {
            const newItems = sortedData.filter(sd => !prev.some(p => (p.id && p.id === sd.id) || p.title === sd.title));
            return [...newItems, ...prev];
          });
        }
      })
      .catch((err) => console.error('Error fetching referrals from API:', err));
  }, [currentUser?.id]);

  // Handle newly requested referrals navigating back to the Dashboard
  useEffect(() => {
    if (route?.params?.newReferralRequest) {
      // Post the new referral to the database
      fetch(`${API_URL}/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...route.params.newReferralRequest,
          user: String(currentUser?.id)
        }),
      })
        .then((res) => res.json())
        .then((newReferral) => {
          setPendingReferrals((prev) => [newReferral, ...prev]);
        })
        .catch((err) => console.error('Error posting new referral:', err));

      navigation.setParams({ newReferralRequest: undefined });
    }
  }, [route?.params?.newReferralRequest, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Custom Header (Sticky) */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIconText}>O+</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>OkieDoc+</Text>
            <Text style={styles.logoSubtitle}>Your Health Partner</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellIcon}>
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- HERO SECTION --- */}
        <View style={styles.heroSection}>
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Good afternoon, {currentUser?.firstName || 'Sarah'} 👋</Text>
            <Text style={styles.subGreetingText}>How can we help you today?</Text>
          </View>

          {/* Quick Actions (2x2 Grid) */}
          <View style={styles.quickActionsGrid}>
            {[
              { title: 'Video Consult', sub: 'Connect with a doctor', icon: 'videocam', route: 'VideoConsult' },
              { title: 'Medical Records', sub: 'View your health history', icon: 'document-text', route: 'MedicalRecords' },
              { title: 'Call Doctor', sub: 'Choose consultation type', icon: 'call', route: 'VideoConsult' },
              { title: 'Message', sub: 'Chat with your care team', icon: 'chatbubble-ellipses', route: 'Messages' }
            ].map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionCard}
                onPress={() => {
                  if (action.route) {
                    navigation.navigate(action.route);
                  }
                }}
              >
                <View style={styles.actionIconWrapper}>
                  <Ionicons name={action.icon} size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSub}>{action.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- MAIN CONTENT AREA --- */}
        <View style={styles.mainContent}>
          
          {/* Next Appointment Card */}
          {isMockUser && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeTextCyan}>Today</Text>
                </View>
                <Text style={styles.cardSubTitle}>Next Appointment</Text>
              </View>
              
              <View style={styles.appointmentRow}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.doctorName}>Dr. Sarah Johnson</Text>
                  <Text style={styles.specialtyText}>Family Medicine</Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                    <Text style={styles.timeText}>2:30 PM</Text>
                    <Ionicons name="videocam-outline" size={14} color="#64748B" style={{marginLeft: 8}} />
                    <Text style={styles.timeText}>Video Consultation</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('JoinVideoCall')}
                >
                  <Ionicons name="videocam" size={16} color="#FFFFFF" style={styles.btnIcon} />
                  <Text style={styles.primaryButtonText}>Join Video Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Pending Referrals */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Pending Referrals - Action Required</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ReferralDetails')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {pendingReferrals.map((ref, idx) => (
            <View key={ref.id || idx} style={[styles.card, styles.cardLeftBorderWarning]}>
              <View style={styles.rowSpaceBetween}>
                <Text style={styles.cardPrimaryTitle}>{ref.title}</Text>
                <View style={styles.badgeWarning}>
                  <Text style={styles.badgeWarningText}>
                    Pending
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDetailText}>{ref.subtitle}</Text>
              
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Ionicons name="medical-outline" size={14} color="#64748B" />
                  <Text style={styles.bulletText}><Text style={styles.boldText}>Reason:</Text> {ref.reason}</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.bulletText}><Text style={styles.boldText}>Date:</Text> {ref.date}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.warningButton}
                  onPress={() => {
                    if (ref.actionType === 'BookTherapy') navigation.navigate('BookTherapy', { preselectedTherapy: ref.specialty });
                    else if (ref.actionType === 'BookSpecialist') navigation.navigate('BookSpecialist', { preselectedDoctor: ref.preselectedDoctor, preselectedSpecialty: ref.specialty });
                    else navigation.navigate('BookSpecialist');
                  }}
                >
                  <Ionicons name="person-add" size={16} color="#FFFFFF" style={styles.btnIcon} />
                  <Text style={styles.warningButtonText}>Book Appointment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ReferralDetails', { referralData: ref })}>
                  <Text style={styles.outlineButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={[styles.outlineButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#089FB4', backgroundColor: '#F8FCFF', marginBottom: 24, paddingVertical: 14 }]}
            onPress={() => navigation.navigate('RequestReferral')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#089FB4" style={{ marginRight: 8 }} />
            <Text style={{ color: '#089FB4', fontWeight: '700', fontSize: 14 }}>Request a New Referral</Text>
          </TouchableOpacity>

          {isMockUser && (
            <>
              {/* Pending Payments */}
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>Pending Payments - Action Required</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Invoice')}>
                  <Text style={styles.viewAllText}>View All →</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.card, styles.cardLeftBorderWarning]}>
                <View style={styles.rowSpaceBetween}>
                  <Text style={styles.cardPrimaryTitle}>Consultation with Dr. Maria Santos</Text>
                  <View style={styles.badgeWarning}><Text style={styles.badgeWarningText}>Pending</Text></View>
                </View>
                <Text style={styles.cardDetailText}>Consultation Date: March 28, 2026</Text>
                
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons name="document-text-outline" size={14} color="#64748B" />
                    <Text style={styles.bulletText}><Text style={styles.boldText}>Medical Certificate:</Text> $350 (unpaid)</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons name="document-outline" size={14} color="#64748B" />
                    <Text style={styles.bulletText}><Text style={styles.boldText}>Medical Clearance:</Text> $450 (unpaid)</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.outlineButton}
                    onPress={() => navigation.navigate('Invoice')}
                  >
                    <Text style={styles.outlineButtonText}>View Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Health Overview */}
          <Text style={[styles.sectionTitle, {marginTop: 8, marginBottom: 12}]}>Health Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScrollContainer}>
            {[
              { value: isMockUser ? '3' : '0', label: 'Active Medications', icon: 'bandage-outline', color: '#3B82F6' },
              { value: isMockUser ? '2' : '0', label: 'Upcoming Appointments', icon: 'calendar-outline', color: '#0AB4B5' },
              { value: isMockUser ? '1 New' : '0', label: 'Lab Results', icon: 'pulse-outline', color: '#8B5CF6', badge: isMockUser ? 'New' : null },
            ].map((metric, idx) => (
              <View key={idx} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBg, { backgroundColor: metric.color + '15' }]}>
                    <Ionicons name={metric.icon} size={20} color={metric.color} />
                  </View>
                  {metric.badge && <View style={styles.badgeWarningSmall}><Text style={styles.badgeWarningTextSmall}>{metric.badge}</Text></View>}
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </ScrollView>

          {isMockUser && (
            <>
              {/* Bottom Split (Prescriptions & Quick Access) - Stacked vertically for mobile */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Prescriptions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Prescriptions')}>
                  <Text style={styles.viewAllText}>View All →</Text>
                </TouchableOpacity>
              </View>

              {/* Prescriptions List */}
              <View style={styles.prescriptionCard}>
                 <View style={styles.rowSpaceBetween}>
                    <View>
                      <Text style={styles.medName}>Lisinopril</Text>
                      <Text style={styles.medDose}>10mg</Text>
                    </View>
                    <View style={styles.badgeWarningSmall}><Text style={styles.badgeWarningTextSmall}>Due Soon</Text></View>
                 </View>
                 <View style={[styles.rowSpaceBetween, {marginTop: 12}]}>
                   <Text style={styles.refillText}>Refill in 5 days</Text>
                   <TouchableOpacity style={styles.refillButton} onPress={() => navigation.navigate('Prescriptions')}><Text style={styles.refillButtonText}>Refill Now</Text></TouchableOpacity>
                 </View>
              </View>

              <View style={styles.prescriptionCard}>
                 <View style={styles.rowSpaceBetween}>
                    <View>
                      <Text style={styles.medName}>Metformin</Text>
                      <Text style={styles.medDose}>500mg</Text>
                    </View>
                 </View>
                 <View style={[styles.rowSpaceBetween, {marginTop: 12}]}>
                   <Text style={styles.refillText}>Refill in 30 days</Text>
                   <TouchableOpacity style={styles.refillButton} onPress={() => navigation.navigate('Prescriptions')}><Text style={styles.refillButtonText}>Refill Now</Text></TouchableOpacity>
                 </View>
              </View>
            </>
          )}

          <Text style={[styles.sectionTitle, {marginTop: 16, marginBottom: 12}]}>Quick Access</Text>
          
          {/* Quick Access List */}
          {[
            { title: 'Medical Records', sub: 'View your health history', icon: 'document-text', color: '#3B82F6' },
            { title: 'Physical Therapy', sub: 'Track your progress', icon: 'fitness', color: '#10B981' },
            { title: 'Pharmacy Orders', sub: 'Manage deliveries', icon: 'medkit', color: '#F59E0B' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickAccessRow}
              onPress={() => {
                if (item.title === 'Medical Records') {
                  navigation.navigate('MedicalRecords');
                } else if (item.title === 'Physical Therapy') {
                  navigation.navigate('PhysicalTherapy');
                } else {
                  navigation.navigate('Pharmacy');
                }
              }}
            >
              <View style={[styles.qaIconBg, { backgroundColor: item.color + '15' }]}>
                 <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.qaTextContainer}>
                <Text style={styles.qaTitle}>{item.title}</Text>
                <Text style={styles.qaSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}

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
  scrollContent: {
    backgroundColor: '#ffffff',
    paddingBottom: 40,
  },
  // --- HERO SECTION ---
  heroSection: {
    backgroundColor: '#14B8C9',
    paddingTop: 42,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 14,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#089FB4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  logoTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  logoSubtitle: {
    color: '#64748B',
    fontSize: 10,
  },
  bellIcon: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444', // Red badge
    borderRadius: 10,
    width: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  greetingContainer: {
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 4,
  },
  subGreetingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  },
  actionCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 18,
    width: '48.3%',
    minHeight: 132,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#089FB4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textAlign: 'center',
  },

  // --- MAIN CONTENT AREA ---
  mainContent: {
    paddingHorizontal: 11,
    paddingTop: 28,
  },
  card: {
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLeftBorderWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    backgroundColor: '#E0F2FE', // Light blue tint
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeTextCyan: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardSubTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  appointmentRow: {
    alignItems: 'stretch',
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  specialtyText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeText: {
    fontSize: 12,
    color: '#0F172A',
    marginLeft: 4,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#089FB4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  btnIcon: {
    marginRight: 6,
  },

  // --- SECTION HEADERS ---
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },
  viewAllText: {
    fontSize: 13,
    color: '#0AB4B5',
    fontWeight: '600',
  },

  // --- WARNING CARDS (Referrals & Payments) ---
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardPrimaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeWarningText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDetailText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 6,
  },
  boldText: {
    fontWeight: '600',
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  warningButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  outlineButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },

  // --- HEALTH OVERVIEW ---
  metricsScrollContainer: {
    paddingBottom: 8,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeWarningSmall: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeWarningTextSmall: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // --- PRESCRIPTIONS ---
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  medName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  medDose: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refillText: {
    fontSize: 12,
    color: '#64748B',
    alignSelf: 'center',
  },
  refillButton: {
    borderWidth: 1,
    borderColor: '#0AB4B5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  refillButtonText: {
    color: '#0AB4B5',
    fontSize: 12,
    fontWeight: '600',
  },

  // --- QUICK ACCESS ---
  quickAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  qaIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qaTextContainer: {
    flex: 1,
  },
  qaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  qaSub: {
    fontSize: 13,
    color: '#64748B',
  },
});
