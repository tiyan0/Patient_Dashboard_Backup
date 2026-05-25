import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const teal = '#0AB4B5';
const cyan = '#089FB4';
const bg = '#F1FAFE';
const ink = '#071C3A';
const muted = '#45627F';

function Header({ title, subtitle, icon, navigation, hideBackButton }) {
  return (
    <View style={styles.header}>
      {!hideBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else {
              navigation?.navigate?.('Dashboard');
            }
          }}
        >
          <Ionicons name="chevron-back" size={23} color={ink} />
        </TouchableOpacity>
      )}
      <View style={styles.headerIcon}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function Screen({ children, title, subtitle, icon, navigation, hideBackButton }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={title} subtitle={subtitle} icon={icon} navigation={navigation} hideBackButton={hideBackButton} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label, color = teal }) {
  return (
    <View style={[styles.pill, { borderColor: color + '55', backgroundColor: color + '12' }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function PrimaryButton({ label, icon = 'arrow-forward', color = cyan, onPress }) {
  return (
    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name={icon} size={16} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppointmentsScreen({ navigation, route }) {
  const [selected, setSelected] = useState('Upcoming');

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: '1',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Family Medicine',
      status: 'Confirmed',
      date: 'March 31, 2026',
      time: '2:30 PM',
      type: 'Video Consultation',
      color: '#089FB4',
      actions: ['Join Call', 'Message']
    },
    {
      id: '2',
      doctor: 'Dr. Miguel Reyes',
      specialty: 'Orthopedic Surgeon',
      status: 'Pending',
      date: 'April 2, 2026',
      time: '10:00 AM',
      type: 'Clinic Visit',
      color: '#F59E0B',
      actions: ['Message']
    }
  ]);

  useEffect(() => {
    if (route?.params?.newAppointment) {
      setUpcomingAppointments(prev => {
        const exists = prev.find(a => a.id === route.params.newAppointment.id);
        if (exists) return prev;
        return [route.params.newAppointment, ...prev];
      });
      navigation.setParams({ newAppointment: undefined });
    }
  }, [route?.params?.newAppointment]);

  const pastAppointments = [
    {
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Family Medicine',
      status: 'Completed',
      date: 'March 15, 2026',
      time: '1:00 PM',
      type: 'Video Consultation',
      color: '#10B981',
      actions: []
    }
  ];

  const displayList = selected === 'Upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <Screen title="Appointments" subtitle="Manage your care schedule" icon="calendar-outline" navigation={navigation}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <View style={[styles.segmentRow, { marginBottom: 0, flex: 1, marginRight: 10 }]}>
          {['Upcoming', 'Past'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segment, selected === item && styles.segmentActive]}
              onPress={() => setSelected(item)}
            >
              <Text style={[styles.segmentText, selected === item && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: cyan, paddingHorizontal: 12, height: 34, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => navigation.navigate('VideoConsult')}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Book Appt</Text>
        </TouchableOpacity>
      </View>

      {displayList.map((appt, idx) => (
        <Card key={`${appt.doctor}-${idx}`}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{appt.doctor}</Text>
              <Text style={styles.bodyText}>{appt.specialty}</Text>
            </View>
            <Pill label={appt.status} color={appt.color} />
          </View>
          
          <View style={{ marginTop: 6, marginBottom: 4 }}>
            <View style={[styles.metaRow, { marginTop: 4 }]}>
              <Ionicons name="calendar-outline" size={15} color={muted} />
              <Text style={styles.metaText}>{appt.date} at {appt.time}</Text>
            </View>
            <View style={[styles.metaRow, { marginTop: 6 }]}>
              <Ionicons name={appt.type.toLowerCase().includes('video') ? 'videocam-outline' : 'location-outline'} size={15} color={muted} />
              <Text style={styles.metaText}>{appt.type}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            {appt.actions.map(act => {
              const isPrimary = act === 'Join Call' || act === 'Book Again';
              return (
                <TouchableOpacity 
                  key={act} 
                  style={[styles.outlineButton, isPrimary && { backgroundColor: cyan, borderColor: cyan }]}
                  onPress={() => {
                    if (act === 'Join Call') navigation.navigate('JoinVideoCall');
                    else if (act === 'Message') navigation.navigate('Messages');
                    else if (act === 'Book Again') navigation.navigate('VideoConsult');
                  }}
                >
                  <Text style={[styles.outlineButtonText, isPrimary && { color: '#FFFFFF' }]}>{act}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

export function PrescriptionsScreen({ navigation }) {

  const prescriptions = [
    {
      name: 'Lisinopril',
      subtitle: '10 mg • once daily',
      prescriber: 'Dr. Sarah Johnson',
      since: 'Jan 15, 2026',
      daysRemaining: 5,
      totalDays: 30,
      nextRefill: 'April 5, 2026',
      status: 'Refill Soon',
      color: '#089FB4',
      icon: 'bandage-outline'
    },
    {
      name: 'Metformin',
      subtitle: '500 mg • twice daily',
      prescriber: 'Dr. Miguel Reyes',
      since: 'Jan 10, 2026',
      daysRemaining: 18,
      totalDays: 30,
      nextRefill: 'April 20, 2026',
      status: 'Active',
      color: '#089FB4',
      icon: 'flask-outline'
    },
    {
      name: 'Atorvastatin',
      subtitle: '20 mg • every evening',
      prescriber: 'Dr. Sarah Johnson',
      since: 'Dec 05, 2025',
      daysRemaining: 0,
      totalDays: 30,
      nextRefill: 'N/A',
      status: 'Action Required',
      color: '#EF4444',
      icon: 'medkit-outline'
    },
    {
      name: 'Amoxicillin',
      subtitle: '500 mg • 3 times a day',
      prescriber: 'Dr. Miguel Reyes',
      since: 'Feb 20, 2026',
      daysRemaining: 0,
      totalDays: 7,
      nextRefill: 'N/A',
      status: 'Past',
      color: '#64748B',
      icon: 'flask-outline'
    },
  ];

  const activeMeds = prescriptions.filter(med => med.status !== 'Past');
  const pastMeds = prescriptions.filter(med => med.status === 'Past');

  return (
    <Screen title="Prescriptions" subtitle="Manage your medications" icon="document-text-outline" navigation={navigation}>
      <Text style={[styles.sectionHeader, { marginTop: 0, marginBottom: 12 }]}>Active Medications</Text>

      {/* Refill Reminder */}
      <Card style={[styles.warningBorder, { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }]}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons name="alert" size={20} color="#F59E0B" />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ color: ink, fontSize: 15, fontWeight: '800', marginBottom: 2 }}>Refill Reminder</Text>
          <Text style={{ color: muted, fontSize: 12, lineHeight: 16 }}>Atorvastatin requires a new prescription soon.</Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Refill Now</Text>
        </TouchableOpacity>
      </Card>

      {/* Active Medication Cards */}
      {activeMeds.map((med) => (
        <Card key={med.name}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.recordIcon, { backgroundColor: med.color + '15', marginRight: 12 }]}>
                <Ionicons name={med.icon} size={22} color={med.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{med.name}</Text>
                <Text style={styles.bodyText}>{med.subtitle}</Text>
              </View>
            </View>
            <Pill label={med.status} color={med.color} />
          </View>

          <View style={{ marginTop: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={muted} />
              <Text style={styles.metaText}>{med.prescriber}</Text>
            </View>
            <View style={[styles.metaRow, { marginTop: 8 }]}>
              <Ionicons name="calendar-outline" size={16} color={muted} />
              <Text style={styles.metaText}>Since {med.since}</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={[styles.bodyText, { fontSize: 12, fontWeight: '700', color: ink }]}>Days Remaining: {med.daysRemaining} / {med.totalDays} days</Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
              <View style={{ height: '100%', backgroundColor: med.color, width: `${Math.max(0, Math.min(100, (med.daysRemaining / med.totalDays) * 100))}%`, borderRadius: 3 }} />
            </View>
          </View>

          <View style={[styles.rowBetween, { marginTop: 4, marginBottom: 0, alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={16} color={muted} />
              <Text style={[styles.bodyText, { fontSize: 12, marginLeft: 6 }]}>Next refill {med.nextRefill}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.outlineButton, { flex: 0, paddingHorizontal: 16, backgroundColor: med.color === '#EF4444' ? '#EF4444' : cyan, borderColor: med.color === '#EF4444' ? '#EF4444' : cyan }]}
            >
              <Text style={[styles.outlineButtonText, { color: '#FFFFFF' }]}>
                {med.daysRemaining === 0 ? 'Request Renewal' : 'Refill Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <Text style={[styles.sectionHeader, { marginTop: 12, marginBottom: 12 }]}>Past Medications</Text>

      {/* Past Medication Cards */}
      {pastMeds.map((med) => (
        <Card key={med.name}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.recordIcon, { backgroundColor: med.color + '15', marginRight: 12 }]}>
                <Ionicons name={med.icon} size={22} color={med.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{med.name}</Text>
                <Text style={styles.bodyText}>{med.subtitle}</Text>
              </View>
            </View>
            <Pill label={med.status} color={med.color} />
          </View>

          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={muted} />
              <Text style={styles.metaText}>{med.prescriber}</Text>
            </View>
            <View style={[styles.metaRow, { marginTop: 8 }]}>
              <Ionicons name="calendar-outline" size={16} color={muted} />
              <Text style={styles.metaText}>Since {med.since}</Text>
            </View>
          </View>
        </Card>
      ))}

      {/* Medication Reminders Box */}
      <Card style={{ marginTop: 12, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={[styles.recordIcon, { backgroundColor: cyan + '15', marginRight: 12 }]}>
            <Ionicons name="notifications-outline" size={24} color={cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Medication Reminders</Text>
            <Text style={styles.bodyText}>Set up automated reminders to never miss a dose</Text>
          </View>
        </View>
        <PrimaryButton label="Configure Reminders" icon="alarm-outline" />
      </Card>
    </Screen>
  );
}

export function AuthScreen({ navigation }) {
  return (
    <SafeAreaView style={[styles.safeArea, styles.authWrapper]}>
      <StatusBar barStyle="dark-content" backgroundColor={bg} />
      <View style={styles.authHeader}>
        <View style={styles.authLogoBox}>
          <Text style={styles.authLogoText}>O+</Text>
        </View>
        <Text style={styles.authTitle}>OkieDoc+</Text>
        <Text style={styles.authSubtitle}>Your Health Partner</Text>
      </View>

      <Card style={styles.authCard}>
        <Text style={styles.largeTitle}>Welcome Back</Text>
        <Text style={[styles.bodyText, { marginBottom: 20 }]}>
          Sign in to access your dashboard
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput style={styles.textInput} placeholder="Enter your email" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput style={styles.textInput} placeholder="Enter your password" placeholderTextColor="#94A3B8" secureTextEntry />
        </View>

        <PrimaryButton
          label="Sign In"
          icon="log-in-outline"
          onPress={() => navigation.navigate('MainTabs')}
        />

        <TouchableOpacity style={styles.authToggle} onPress={() => navigation.navigate('CreateProfile')}>
          <Text style={styles.authToggleText}>
            Don't have an account? <Text style={{ color: cyan, fontWeight: '800' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </Card>
    </SafeAreaView>
  );
}

export function CreateProfileScreen({ navigation }) {
  return (
    <Screen title="Create Profile" subtitle="Tell us about yourself" icon="person-add-outline" navigation={navigation}>
      <Card>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>First Name</Text><TextInput style={styles.textInput} placeholder="e.g. Sarah" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Last Name</Text><TextInput style={styles.textInput} placeholder="e.g. Williams" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date of Birth</Text><TextInput style={styles.textInput} placeholder="MM/DD/YYYY" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Phone Number</Text><TextInput style={styles.textInput} placeholder="(555) 123-4567" placeholderTextColor="#94A3B8" keyboardType="phone-pad" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Email Address</Text><TextInput style={styles.textInput} placeholder="e.g. sarah@example.com" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Password</Text><TextInput style={styles.textInput} placeholder="Create a password" placeholderTextColor="#94A3B8" secureTextEntry /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Confirm Password</Text><TextInput style={styles.textInput} placeholder="Confirm your password" placeholderTextColor="#94A3B8" secureTextEntry /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Blood Type</Text><TextInput style={styles.textInput} placeholder="e.g. O+" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Allergies</Text><TextInput style={styles.textInput} placeholder="List any allergies" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Emergency Contact</Text><TextInput style={styles.textInput} placeholder="Name and phone number" placeholderTextColor="#94A3B8" /></View>
        <PrimaryButton label="Complete Registration" icon="checkmark-circle-outline" onPress={() => navigation.navigate('MainTabs')} />
      </Card>
    </Screen>
  );
}

export function EditProfileScreen({ navigation }) {
  return (
    <Screen title="Edit Profile" subtitle="Update your personal details" icon="create-outline" navigation={navigation}>
      <Card>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>First Name</Text><TextInput style={styles.textInput} defaultValue="Sarah" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Last Name</Text><TextInput style={styles.textInput} defaultValue="Williams" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Address</Text><TextInput style={styles.textInput} defaultValue="Oklahoma City, OK" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Email</Text><TextInput style={styles.textInput} defaultValue="sarah@example.com" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Phone Number</Text><TextInput style={styles.textInput} defaultValue="(555) 123-4567" placeholderTextColor="#94A3B8" keyboardType="phone-pad" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Blood Type</Text><TextInput style={styles.textInput} defaultValue="O+" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Allergies</Text><TextInput style={styles.textInput} defaultValue="None" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Emergency Contact</Text><TextInput style={styles.textInput} defaultValue="John Williams - (555) 987-6543" placeholderTextColor="#94A3B8" /></View>
        <PrimaryButton label="Save Changes" icon="save-outline" onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Profile')} />
      </Card>
    </Screen>
  );
}

export function ProfileScreen({ navigation }) {
  const accountLinks = [
    ['person-outline', 'Personal Information'],
    ['medical-outline', 'Medical History'],
    ['shield-checkmark-outline', 'Insurance Details'],
    ['card-outline', 'Payment Methods'],
  ];

  const preferenceLinks = [
    ['notifications-outline', 'Notifications'],
    ['lock-closed-outline', 'Privacy & Security'],
    ['globe-outline', 'Language & Region'],
  ];

  return (
    <Screen title="Profile" subtitle="Your account and preferences" icon="person-outline" navigation={navigation}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>SW</Text></View>
        <Text style={styles.largeTitle}>Sarah Williams</Text>
        <Text style={styles.bodyText}>Patient ID OKD-10482</Text>
        <View style={styles.tagRow}>
          <Pill label="Subscriber" color="#F59E0B" />
          <Pill label="Verified" color="#10B981" />
        </View>
        <View style={{ width: '100%', marginTop: 10 }}>
          <PrimaryButton label="Edit Profile" icon="create-outline" onPress={() => navigation.navigate('EditProfile')} />
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Contact Information</Text>
      <Card>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>sarah@example.com</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>(555) 123-4567</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={styles.infoValue}>Oklahoma City, OK</Text></View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>Date of Birth</Text><Text style={styles.infoValue}>12/05/1990</Text></View>
      </Card>

      <Text style={styles.sectionHeader}>Medical Information</Text>
      <Card>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Blood Type</Text><Text style={styles.infoValue}>O+</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Allergies</Text><Text style={styles.infoValue}>Penicillin, Peanuts</Text></View>
        <View style={[styles.infoRow, { borderBottomWidth: 0, alignItems: 'flex-start' }]}><Text style={styles.infoLabel}>Emergency Contact</Text><Text style={styles.infoValue}>John Williams{'\n'}(555) 987-6543</Text></View>
      </Card>

      <Text style={styles.sectionHeader}>Your Health Journey</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="calendar-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>12 Appointments</Text>
        </View>
        <View style={styles.linkDivider} />
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="document-text-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>5 Prescriptions</Text>
        </View>
        <View style={styles.linkDivider} />
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="fitness-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>3 PT Sessions</Text>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Account</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {accountLinks.map(([icon, title], index) => (
          <React.Fragment key={title}>
            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkIconBg}><Ionicons name={icon} size={18} color={cyan} /></View>
              <Text style={styles.linkText}>{title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            {index < accountLinks.length - 1 && <View style={styles.linkDivider} />}
          </React.Fragment>
        ))}
      </Card>

      <Text style={styles.sectionHeader}>Preferences</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {preferenceLinks.map(([icon, title], index) => (
          <React.Fragment key={title}>
            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkIconBg}><Ionicons name={icon} size={18} color={cyan} /></View>
              <Text style={styles.linkText}>{title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            {index < preferenceLinks.length - 1 && <View style={styles.linkDivider} />}
          </React.Fragment>
        ))}
      </Card>

      <View style={{ marginTop: 24, marginBottom: 20 }}>
        <PrimaryButton 
          label="Log Out" 
          icon="log-out-outline" 
          color="#EF4444" 
          onPress={() => navigation.navigate('Auth')} 
        />
      </View>
    </Screen>
  );
}

export function ReferralDetailsScreen({ navigation }) {
  return (
    <Screen title="Referral Details" subtitle="Orthopedic surgeon referral" icon="git-branch-outline" navigation={navigation}>
      <Card style={[styles.card, styles.warningBorder]}>
        <View style={styles.rowBetween}>
          <Text style={styles.largeTitle}>Specialist Referral</Text>
          <Pill label="Pending" color="#F59E0B" />
        </View>
        <Text style={styles.bodyText}>Referred by Dr. Sofia Lim (Cardiologist)</Text>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Reason</Text>
          <Text style={styles.detailText}>Knee pain after exercise</Text>
        </View>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Referral Date</Text>
          <Text style={styles.detailText}>February 10, 2026</Text>
        </View>
        <PrimaryButton label="Book Appointment" icon="person-add" color="#F59E0B" onPress={() => navigation.navigate('Appointments')} />
      </Card>
    </Screen>
  );
}

export function BookSpecialistScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const steps = ['Specialist', 'Payment', 'Schedule', 'Details', 'Review'];
  
  // Step 1: Specialist
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Step 2: Payment
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [hmoProvider, setHmoProvider] = useState('Select your HMO Provider');
  const [showHmoDropdown, setShowHmoDropdown] = useState(false);
  const [hmoId, setHmoId] = useState('');
  const [philhealthNo, setPhilhealthNo] = useState('');
  const [hasReferral, setHasReferral] = useState(null);

  // Step 3: Schedule
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);

  // Step 4: Details
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const doctors = [
    { id: '1', name: 'Dr. Sofia Lim', status: 'Available', specialty: 'Cardiologist', clinic: 'OkieDoc+ Heart Center', location: 'BGC, Taguig City', exp: '20 years experience', price: 'From $75', hmo: true, ph: true, initial: 'SL' },
    { id: '2', name: 'Dr. Carlos Torres', status: 'Available', specialty: 'Dermatologist', clinic: 'OkieDoc+ Skin Clinic', location: 'Ortigas, Pasig City', exp: '10 years experience', price: 'From $65', hmo: true, ph: false, initial: 'CT' },
    { id: '3', name: 'Dr. Anna Cruz', status: 'Available', specialty: 'Psychiatrist', clinic: 'OkieDoc+ Mental Health Center', location: 'Manila', exp: '18 years experience', price: 'From $85', hmo: true, ph: true, initial: 'AC' },
    { id: '4', name: 'Dr. Miguel Garcia', status: 'Available', specialty: 'Orthopedic Surgeon', clinic: 'OkieDoc+ Orthopedic Center', location: 'Makati City', exp: '22 years experience', price: 'From $95', hmo: true, ph: true, initial: 'MG' },
    { id: '5', name: 'Dr. Isabel Reyes', status: 'Unavailable', specialty: 'Endocrinologist', clinic: 'OkieDoc+ Diabetes Center', location: 'Quezon City', exp: '15 years experience', price: 'From $80', hmo: false, ph: true, initial: 'IR' },
    { id: '6', name: 'Dr. Ramon Santos', status: 'Available', specialty: 'Gastroenterologist', clinic: 'OkieDoc+ Digestive Health Center', location: 'Makati City', exp: '25 years experience', price: 'From $90', hmo: true, ph: true, initial: 'RS' },
  ];

  const hmoList = ['Maxicare', 'Medicard', 'PhilCare', 'Intellicare', 'Cocolife', 'Avega', 'Pacific Cross', 'AsianLife', 'Insular Health care', 'Others'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const symptomsList = ['Pain', 'Swelling', 'Fatigue', 'Numbness', 'Weakness', 'Dizziness', 'Nausea', 'Loss of Appetite', 'Sleep Issues', 'Anxiety'];

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const isNextDisabled = 
    (step === 0 && !selectedDoctor) || 
    (step === 1 && (
      !paymentMethod ||
      (paymentMethod === 'HMO' && (hmoProvider === 'Select your HMO Provider' || !hmoId.trim())) ||
      (paymentMethod === 'PhilHealth' && (!philhealthNo.trim() || hasReferral === null))
    )) || 
    (step === 2 && (!selectedDate || !selectedTime)) ||
    (step === 3 && !chiefComplaint.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Book Specialist Consultation" subtitle="Connect with specialized medical experts for your specific needs" icon="person-add-outline" navigation={navigation} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
        
        {/* Pagination Control */}
        <Card style={{ paddingVertical: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
            <View style={{ position: 'absolute', top: 12, left: 20, right: 20, height: 2, backgroundColor: '#E2E8F0', zIndex: -1 }} />
            <View style={{ position: 'absolute', top: 12, left: 20, width: `${(step / (steps.length - 1)) * 100}%`, height: 2, backgroundColor: '#7C3AED', zIndex: -1 }} />
            
            {steps.map((label, i) => (
              <View key={label} style={{ alignItems: 'center', width: 60 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: step >= i ? '#7C3AED' : '#F1F5F9', borderWidth: step >= i ? 0 : 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ color: step >= i ? '#FFFFFF' : '#64748B', fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 10, color: step >= i ? '#7C3AED' : '#64748B', fontWeight: step >= i ? '700' : '500', textAlign: 'center' }}>{label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* STEP 1: SPECIALIST */}
        {step === 0 && (
          <>
            <Text style={styles.sectionHeader}>Select Specialist</Text>
            {doctors.map(doc => (
              <TouchableOpacity 
                key={doc.id} 
                style={[styles.card, selectedDoctor?.id === doc.id && { borderColor: '#7C3AED', borderWidth: 2, backgroundColor: '#F5F3FF' }, doc.status === 'Unavailable' && { opacity: 0.6 }]}
                onPress={() => {
                  if (doc.status === 'Available') {
                    setSelectedDoctor(doc);
                    setPaymentMethod(null);
                  }
                }}
                disabled={doc.status === 'Unavailable'}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{doc.initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{doc.name}</Text>
                      <Text style={[styles.bodyText, { color: '#7C3AED', fontWeight: '700' }]}>{doc.specialty}</Text>
                    </View>
                  </View>
                  <Pill label={doc.status} color={doc.status === 'Available' ? '#10B981' : '#64748B'} />
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: selectedDoctor?.id === doc.id ? '#EDE9FE' : '#F1F5F9' }}>
                  <Text style={[styles.bodyText, { fontWeight: '600', color: ink }]}>{doc.clinic}</Text>
                  <Text style={styles.bodyText}>{doc.location}</Text>
                  <Text style={[styles.bodyText, { marginTop: 4 }]}>{doc.exp}</Text>
                  
                  <View style={[styles.rowBetween, { alignItems: 'flex-end', marginTop: 12, marginBottom: 0 }]}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {doc.hmo && <Pill label="HMO" color="#F59E0B" />}
                      {doc.ph && <Pill label="PhilHealth" color="#16A34A" />}
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: ink }}>{doc.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 1 && (
          <>
            <Text style={styles.sectionHeader}>Select Payment Method</Text>
            
            <TouchableOpacity style={[styles.card, paymentMethod === 'Cash' && { borderColor: '#7C3AED', borderWidth: 2, backgroundColor: '#F5F3FF' }]} onPress={() => setPaymentMethod('Cash')}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Cash / Pay per Consultation</Text>
                  <Text style={styles.bodyText}>Pay directly for your consultation</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#7C3AED' }}>{selectedDoctor?.price}</Text>
              </View>
            </TouchableOpacity>

            {selectedDoctor?.hmo && (
              <>
                <TouchableOpacity style={[styles.card, paymentMethod === 'HMO' && { borderColor: '#7C3AED', borderWidth: 2, backgroundColor: '#F5F3FF', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]} onPress={() => setPaymentMethod('HMO')}>
                  <Text style={styles.cardTitle}>HMO Coverage</Text>
                  <Text style={styles.bodyText}>Use your HMO insurance for this consultation</Text>
                </TouchableOpacity>
                
                {paymentMethod === 'HMO' && (
                  <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 2, borderTopWidth: 0, borderColor: '#7C3AED', marginBottom: 12 }}>
                    <Text style={[styles.cardTitle, { marginBottom: 12 }]}>HMO Information</Text>
                    
                    <Text style={styles.inputLabel}>HMO Provider *</Text>
                    <TouchableOpacity style={[styles.textInput, { justifyContent: 'center', marginBottom: hmoProvider === 'Select your HMO Provider' && !showHmoDropdown ? 6 : 12 }, hmoProvider === 'Select your HMO Provider' && { borderColor: '#EF4444' }]} onPress={() => setShowHmoDropdown(!showHmoDropdown)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                        <Text style={{ flex: 1, textAlign: 'center', color: hmoProvider === 'Select your HMO Provider' ? '#94A3B8' : ink }}>{hmoProvider}</Text>
                        <Ionicons name={showHmoDropdown ? "chevron-up" : "chevron-down"} size={18} color={muted} style={{ position: 'absolute', right: 0 }} />
                      </View>
                    </TouchableOpacity>

                    {hmoProvider === 'Select your HMO Provider' && !showHmoDropdown && (
                      <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>Please select an HMO provider.</Text>
                    )}
                    
                    {showHmoDropdown && (
                      <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 8, marginBottom: 16, maxHeight: 160 }}>
                        <ScrollView nestedScrollEnabled>
                          {hmoList.map(hmo => (
                            <TouchableOpacity key={hmo} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' }} onPress={() => { setHmoProvider(hmo); setShowHmoDropdown(false); }}>
                              <Text style={{ color: ink, fontSize: 14 }}>{hmo}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    <View style={[styles.inputGroup, { marginBottom: hmoId.trim() === '' ? 10 : 16 }]}>
                      <Text style={styles.inputLabel}>Membership ID *</Text>
                      <TextInput style={[styles.textInput, hmoId.trim() === '' && { borderColor: '#EF4444' }]} placeholder="Enter your HMO membership ID" placeholderTextColor="#94A3B8" value={hmoId} onChangeText={setHmoId} />
                      {hmoId.trim() === '' && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>Membership ID is required.</Text>
                      )}
                    </View>

                    <Text style={styles.inputLabel}>Upload HMO Card (Optional)</Text>
                    <TouchableOpacity style={{ height: 80, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Ionicons name="cloud-upload-outline" size={24} color="#7C3AED" style={{ marginBottom: 4 }} />
                      <Text style={{ color: '#7C3AED', fontWeight: '700', fontSize: 13 }}>Click to Upload HMO Card</Text>
                      <Text style={{ color: muted, fontSize: 11 }}>(PNG, JPG up to 5MB)</Text>
                    </TouchableOpacity>

                    <View style={{ backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row' }}>
                      <Ionicons name="alert-circle" size={20} color="#D97706" style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#92400E', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>HMO Approval Required</Text>
                        <Text style={{ color: '#B45309', fontSize: 12, lineHeight: 18 }}>HMO consultations require approval before confirmation. You will be notified once your HMO provider approves the consultation. This typically takes 1-2 business days.</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {selectedDoctor?.ph && (
              <>
                <TouchableOpacity style={[styles.card, paymentMethod === 'PhilHealth' && { borderColor: '#7C3AED', borderWidth: 2, backgroundColor: '#F5F3FF', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]} onPress={() => setPaymentMethod('PhilHealth')}>
                  <Text style={styles.cardTitle}>PhilHealth (with referral)</Text>
                  <Text style={styles.bodyText}>Use PhilHealth benefits for this consultation</Text>
                </TouchableOpacity>

                {paymentMethod === 'PhilHealth' && (
                  <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 2, borderTopWidth: 0, borderColor: '#7C3AED', marginBottom: 12 }}>
                    <Text style={[styles.cardTitle, { marginBottom: 12 }]}>PhilHealth Information</Text>
                    
                    <View style={[styles.inputGroup, { marginBottom: philhealthNo.trim() === '' ? 10 : 16 }]}>
                      <Text style={styles.inputLabel}>PhilHealth Number *</Text>
                      <TextInput style={[styles.textInput, philhealthNo.trim() === '' && { borderColor: '#EF4444' }]} placeholder="Enter your PhilHealth Number" placeholderTextColor="#94A3B8" value={philhealthNo} onChangeText={setPhilhealthNo} />
                      {philhealthNo.trim() === '' && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>PhilHealth Number is required.</Text>
                      )}
                    </View>

                    <Text style={styles.inputLabel}>Do you have a valid referral? *</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: hasReferral === null ? 6 : 16 }}>
                      <TouchableOpacity style={{ flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: hasReferral === true ? '#10B981' : '#F1F5F9', borderWidth: hasReferral === null ? 1 : 0, borderColor: '#EF4444' }} onPress={() => setHasReferral(true)}>
                        <Text style={{ color: hasReferral === true ? '#FFFFFF' : '#64748B', fontWeight: '700', fontSize: 13 }}>Yes, I have a referral</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: hasReferral === false ? '#94A3B8' : '#F1F5F9', borderWidth: hasReferral === null ? 1 : 0, borderColor: '#EF4444' }} onPress={() => setHasReferral(false)}>
                        <Text style={{ color: hasReferral === false ? '#FFFFFF' : '#64748B', fontWeight: '700', fontSize: 13 }}>No Referral</Text>
                      </TouchableOpacity>
                    </View>
                    {hasReferral === null && (
                      <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 16 }}>Please indicate if you have a referral.</Text>
                    )}

                    {hasReferral === true && (
                      <View style={{ backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0', flexDirection: 'row' }}>
                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#166534', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>PhilHealth Coverage Confirmed</Text>
                          <Text style={{ color: '#15803D', fontSize: 12, lineHeight: 18 }}>Your consultation will be covered under PhilHealth with a valid referral. Please bring your PhilHealth ID and referral letter to your appointment.</Text>
                        </View>
                      </View>
                    )}

                    {hasReferral === false && (
                      <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row' }}>
                        <Ionicons name="information-circle" size={20} color="#64748B" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#334155', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>Referral Required</Text>
                          <Text style={{ color: '#475569', fontSize: 12, lineHeight: 18 }}>A valid PhilHealth referral is required to proceed with specialist consultation coverage. Please obtain a referral from your primary care physician first.</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* STEP 3: SCHEDULE */}
        {step === 2 && (
          <>
            <Text style={styles.sectionHeader}>Select Schedule</Text>
            <Card>
              <Text style={styles.inputLabel}>Desired Date *</Text>
              <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 16, backgroundColor: '#FFFFFF' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <TouchableOpacity><Ionicons name="chevron-back" size={20} color={muted} /></TouchableOpacity>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: ink }}>March 2026</Text>
                  <TouchableOpacity><Ionicons name="chevron-forward" size={20} color={muted} /></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <Text key={day} style={{ width: 32, textAlign: 'center', color: muted, fontSize: 12, fontWeight: '600' }}>{day}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `March ${day}, 2026`;
                    const isSelected = selectedDate === dateStr;
                    return (
                      <TouchableOpacity 
                        key={day}
                        style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => setSelectedDate(dateStr)}
                      >
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isSelected ? '#7C3AED' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontSize: 14, fontWeight: isSelected ? '700' : '500' }}>{day}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
              </View>

              {selectedDate?.length > 0 && (
                <>
                  <Text style={[styles.cardTitle, { marginTop: 12, marginBottom: 12 }]}>Available Times</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {times.map((t, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={{ width: '31%', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: selectedTime === t ? '#7C3AED' : '#E2E8F0', backgroundColor: selectedTime === t ? '#F5F3FF' : '#F8FAFC', alignItems: 'center' }}
                        onPress={() => setSelectedTime(t)}
                      >
                        <Text style={{ color: selectedTime === t ? '#7C3AED' : ink, fontWeight: '700', fontSize: 12 }}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </Card>
          </>
        )}

        {/* STEP 4: DETAILS */}
        {step === 3 && (
          <>
            <Text style={styles.sectionHeader}>Consultation Details</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chief Complaint *</Text>
                <TextInput 
                  style={[styles.textInput, { height: 80, paddingTop: 12 }]} 
                  placeholder="What brings you to the Specialist?" 
                  placeholderTextColor="#94A3B8" 
                  multiline 
                  value={chiefComplaint}
                  onChangeText={setChiefComplaint}
                />
              </View>

              <Text style={styles.inputLabel}>Related Symptoms</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {symptomsList.map((sym, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: selectedSymptoms.includes(sym) ? '#7C3AED' : '#E2E8F0', backgroundColor: selectedSymptoms.includes(sym) ? '#7C3AED' : '#F8FAFC' }}
                    onPress={() => toggleSymptom(sym)}
                  >
                    <Text style={{ color: selectedSymptoms.includes(sym) ? '#FFFFFF' : muted, fontSize: 12, fontWeight: '600' }}>{sym}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput 
                  style={[styles.textInput, { height: 80, paddingTop: 12 }]} 
                  placeholder="Any additional information for the specialist..." 
                  placeholderTextColor="#94A3B8" 
                  multiline 
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                />
              </View>
            </Card>
          </>
        )}

        {/* STEP 5: REVIEW */}
        {step === 4 && (
          <>
            <Text style={styles.sectionHeader}>Review Your Booking</Text>
            
            {paymentMethod === 'HMO' && (
              <View style={{ backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', marginBottom: 16 }}>
                <Ionicons name="alert-circle" size={20} color="#D97706" style={{ marginRight: 8 }} />
                <Text style={{ flex: 1, color: '#92400E', fontWeight: '700', fontSize: 13, marginTop: 2 }}>HMO Pending Approval</Text>
              </View>
            )}

            {paymentMethod === 'PhilHealth' && hasReferral === true && (
              <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 }}>
                <Text style={{ color: '#166534', fontWeight: '800', fontSize: 15, marginBottom: 8 }}>PhilHealth Coverage</Text>
                <Text style={{ color: '#15803D', fontSize: 13, marginBottom: 4 }}>• Please bring your PhilHealth ID to your appointment</Text>
                <Text style={{ color: '#15803D', fontSize: 13, marginBottom: 4 }}>• Bring your valid referral letter</Text>
                <Text style={{ color: '#15803D', fontSize: 13 }}>• Arrive 15 minutes early for verification</Text>
              </View>
            )}

            <Card>
              <Text style={styles.detailLabel}>Specialist</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{selectedDoctor?.initial}</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>{selectedDoctor?.name}</Text>
                  <Text style={styles.bodyText}>{selectedDoctor?.specialty}</Text>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailText}>{selectedDate || 'Not Selected'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailText}>{selectedTime || 'Not Selected'}</Text>
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailText}>{paymentMethod === 'HMO' ? 'HMO Coverage' : paymentMethod === 'PhilHealth' ? 'PhilHealth (with referral)' : 'Cash / Pay per Consultation'}</Text>
                {paymentMethod === 'HMO' && (
                  <>
                    <Text style={[styles.bodyText, { marginTop: 4 }]}><Text style={{ fontWeight: '700', color: ink }}>Provider:</Text> {hmoProvider}</Text>
                    <Text style={styles.bodyText}><Text style={{ fontWeight: '700', color: ink }}>Member ID:</Text> {hmoId}</Text>
                  </>
                )}
              </View>

              <View style={{ marginTop: 16, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16 }}>
                <Text style={styles.detailLabel}>Chief Complaint</Text>
                <Text style={[styles.bodyText, { color: ink }]}>{chiefComplaint || 'None provided'}</Text>
                
                <Text style={[styles.detailLabel, { marginTop: 12 }]}>Symptoms</Text>
                <Text style={[styles.bodyText, { color: ink }]}>{selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected'}</Text>

                {!!additionalNotes.trim() && (
                  <>
                    <Text style={[styles.detailLabel, { marginTop: 12 }]}>Additional Notes</Text>
                    <Text style={[styles.bodyText, { color: ink }]}>{additionalNotes}</Text>
                  </>
                )}
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Bottom Sticky Navigation */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity 
          style={{ height: 48, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', opacity: step === 0 ? 0.4 : 1 }}
          onPress={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
        >
          <Text style={{ color: ink, fontSize: 14, fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>
        
        {step < 4 ? (
          <TouchableOpacity 
            style={{ height: 48, paddingHorizontal: 32, borderRadius: 8, backgroundColor: isNextDisabled ? '#CBD5E1' : '#7C3AED', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setStep(step + 1)}
            disabled={isNextDisabled}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={{ height: 48, paddingHorizontal: 32, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => {
              const newAppt = {
                id: Date.now().toString(),
                doctor: selectedDoctor?.name,
                specialty: selectedDoctor?.specialty,
                status: paymentMethod === 'HMO' ? 'Pending' : 'Confirmed',
                date: selectedDate,
                time: selectedTime,
                type: 'Clinic Visit',
                color: paymentMethod === 'HMO' ? '#F59E0B' : '#089FB4',
                actions: ['Message']
              };
              
              setStep(0);
              setSelectedDoctor(null);
              setPaymentMethod(null);
              setHmoProvider('Select your HMO Provider');
              setShowHmoDropdown(false);
              setHmoId('');
              setPhilhealthNo('');
              setHasReferral(null);
              setSelectedDate('');
              setSelectedTime(null);
              setChiefComplaint('');
              setSelectedSymptoms([]);
              setAdditionalNotes('');
              
              navigation.navigate('Appointments', { newAppointment: newAppt });
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

export function MessagesScreen({ navigation }) {
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  
  const [conversations, setConversations] = useState([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Family Medicine',
      avatar: 'SJ',
      color: '#089FB4',
      unread: 2,
      messages: [
        { id: 'm1', sender: 'Dr. Sarah Johnson', text: 'Hello Sarah, your lab results look good. Everything is within normal limits.', time: '10:30 AM' },
        { id: 'm2', sender: 'You', text: 'That is a relief to hear! Do I need to change my medication?', time: '10:45 AM' },
        { id: 'm3', sender: 'Dr. Sarah Johnson', text: 'No changes needed. Keep taking it as prescribed.', time: '10:50 AM' },
      ]
    },
    {
      id: '2',
      name: 'Care Team',
      role: 'Support',
      avatar: 'CT',
      color: '#F59E0B',
      unread: 0,
      messages: [
        { id: 'c1', sender: 'Care Team', text: 'Hi Sarah, your referral request has been received.', time: 'Yesterday' },
        { id: 'c2', sender: 'You', text: 'Thank you. Can I book this week?', time: 'Yesterday' },
        { id: 'c3', sender: 'Care Team', text: 'Yes, we have orthopedic appointments available Friday.', time: 'Yesterday' },
      ]
    },
    {
      id: '3',
      name: 'Nurse Emily',
      role: 'Triage Nurse',
      avatar: 'NE',
      color: '#10B981',
      unread: 0,
      messages: [
        { id: 'n1', sender: 'You', text: 'Hi Emily, I have a quick question about my wound dressing.', time: 'Monday' },
        { id: 'n2', sender: 'Nurse Emily', text: 'Sure, what seems to be the issue? Is there any redness or swelling?', time: 'Monday' },
      ]
    }
  ]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputText,
      time: 'Just now'
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: [...chat.messages, newMessage] };
      }
      return chat;
    }));
    setInputText('');
  };

  if (!activeChatId) {
    // --- INBOX LIST VIEW ---
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Messages" subtitle="Connect with your doctors & nurses" icon="chatbubbles-outline" navigation={navigation} hideBackButton={true} />
        
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FFFFFF' }}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={muted} />
            <TextInput style={styles.searchInput} placeholder="Search messages or doctors..." placeholderTextColor="#94A3B8" />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, backgroundColor: '#FFFFFF', flexGrow: 1 }}>
          {conversations.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return (
              <TouchableOpacity key={chat.id} style={styles.chatListItem} onPress={() => {
                setActiveChatId(chat.id);
                // Clear unread badge when opened
                setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
              }}>
                <View style={[styles.chatAvatar, { backgroundColor: chat.color }]}>
                  <Text style={styles.chatAvatarText}>{chat.avatar}</Text>
                </View>
                <View style={styles.chatListInfo}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.chatListName}>{chat.name}</Text>
                    <Text style={[styles.chatListTime, chat.unread > 0 && { color: cyan, fontWeight: '800' }]}>{lastMsg.time}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.chatListLastMsg, chat.unread > 0 && { color: ink, fontWeight: '600' }]} numberOfLines={1}>
                      {lastMsg.sender === 'You' ? `You: ${lastMsg.text}` : lastMsg.text}
                    </Text>
                    {chat.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{chat.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- ACTIVE CHAT VIEW ---
  const activeChat = conversations.find(c => c.id === activeChatId);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Chat Header */}
      <View style={styles.activeChatHeader}>
        <TouchableOpacity onPress={() => setActiveChatId(null)} style={{ padding: 8, marginLeft: -8, marginRight: 4 }}>
          <Ionicons name="chevron-back" size={24} color={ink} />
        </TouchableOpacity>
        <View style={[styles.chatAvatarSmall, { backgroundColor: activeChat.color }]}>
          <Text style={styles.chatAvatarTextSmall}>{activeChat.avatar}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.activeChatName}>{activeChat.name}</Text>
          <Text style={styles.activeChatRole}>{activeChat.role}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="call-outline" size={22} color={cyan} />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, marginRight: -8 }}>
          <Ionicons name="videocam-outline" size={24} color={cyan} />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView contentContainerStyle={styles.chatScrollArea}>
        {activeChat.messages.map(msg => {
          const isMine = msg.sender === 'You';
          return (
            <View key={msg.id} style={[styles.messageWrapper, isMine ? styles.messageWrapperMine : styles.messageWrapperOther]}>
              {!isMine && (
                <View style={[styles.chatAvatarTiny, { backgroundColor: activeChat.color }]}>
                  <Text style={styles.chatAvatarTextTiny}>{activeChat.avatar}</Text>
                </View>
              )}
              <View style={[styles.chatBubble, isMine ? styles.chatBubbleMine : styles.chatBubbleOther]}>
                <Text style={[styles.chatText, isMine ? styles.chatMineText : styles.chatOtherText]}>{msg.text}</Text>
                <Text style={[styles.chatTime, isMine ? styles.chatMineTime : styles.chatOtherTime]}>{msg.time}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Message Composer */}
      <View style={styles.messageComposer}>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="add" size={28} color={muted} />
        </TouchableOpacity>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          style={styles.messageInput}
          placeholder="Message..."
          placeholderTextColor="#94A3B8"
          multiline
        />
        <TouchableOpacity style={[styles.sendButton, !inputText.trim() && { backgroundColor: '#CBD5E1' }]} onPress={sendMessage} disabled={!inputText.trim()}>
          <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function CallDoctorScreen({ navigation }) {
  return (
    <Screen title="Call Doctor" subtitle="Choose a physician contact option" icon="call-outline" navigation={navigation}>
      <Card style={styles.heroCard}>
        <View style={styles.bigIcon}><Ionicons name="call" size={32} color="#FFFFFF" /></View>
        <Text style={styles.largeTitle}>Speak to a physician</Text>
        <Text style={styles.bodyText}>Connect with an available doctor or schedule a callback from your care team.</Text>
        <PrimaryButton label="Call Now" icon="call" color="#10B981" />
      </Card>
      {['Family Medicine', 'Urgent Care', 'Nurse Triage'].map((title) => (
        <Card key={title} style={styles.listRow}>
          <View style={styles.rowIcon}><Ionicons name="call-outline" size={20} color={cyan} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.bodyText}>Average wait 5-10 minutes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </Card>
      ))}
    </Screen>
  );
}

export function JoinVideoCallScreen({ navigation }) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  return (
    <Screen title="Video Call" subtitle="Dr. Sarah Johnson" icon="videocam-outline" navigation={navigation}>
      <View style={styles.videoPreview}>
        <Ionicons name={cameraOff ? 'videocam-off-outline' : 'person-circle-outline'} size={90} color="#BDEAF0" />
        <Text style={styles.videoTitle}>Waiting Room</Text>
        <Text style={styles.videoSub}>Your doctor will join at 2:30 PM.</Text>
      </View>
      <View style={styles.callControls}>
        <TouchableOpacity style={[styles.callControl, muted && styles.callControlActive]} onPress={() => setMuted(!muted)}>
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.callControl, cameraOff && styles.callControlActive]} onPress={() => setCameraOff(!cameraOff)}>
          <Ionicons name={cameraOff ? 'videocam-off' : 'videocam'} size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.callControl, styles.endCall]} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard')}>
          <Ionicons name="call" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <Card>
        <Text style={styles.cardTitle}>Before you join</Text>
        <Text style={styles.bodyText}>Make sure your camera, microphone, and internet connection are ready.</Text>
      </Card>
    </Screen>
  );
}

export function MedicalRecordsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Consultation History');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const categories = [
    'Consultation History',
    'Prescriptions',
    'Lab requests',
    'Medical Certificates',
    'Treatment Plans',
    'Referrals'
  ];

  const consultationHistory = [
    {
      alias: 'MS',
      doctor: 'Dr. Maria Santos',
      specialty: 'General Physician',
      type: 'Video',
      date: 'Sat, Mar 28, 2026',
      time: '10:30 AM',
      complaint: 'Persistent cough and mild fever',
      status: 'Completed',
      duration: '25 minutes',
      prescriptions: 3,
      labRequests: 1,
    },
    {
      alias: 'CT',
      doctor: 'Dr. Carlos Torres',
      specialty: 'Dermatologist',
      type: 'Physical',
      date: 'Sun, Mar 15, 2026',
      time: '2:00 PM',
      complaint: 'Skin rash on arms',
      status: 'Completed',
      duration: '40 minutes',
      prescriptions: 2,
      labRequests: 0,
    },
    {
      alias: 'AC',
      doctor: 'Dr. Anna Cruz',
      specialty: 'Psychiatrist',
      type: 'Voice',
      date: 'Tue, Mar 10, 2026',
      time: '4:30 PM',
      complaint: 'Anxiety and sleep issues',
      status: 'Completed',
      duration: '30 minutes',
      prescriptions: 1,
      labRequests: 0,
    },
    {
      alias: 'MG',
      doctor: 'Dr. Miguel Garcia',
      specialty: 'Orthopedic Surgeon',
      type: 'Physical',
      date: 'Fri, Feb 20, 2026',
      time: '11:00 AM',
      complaint: 'Knee pain after exercise',
      status: 'Completed',
      duration: '45 minutes',
      prescriptions: 2,
      labRequests: 2,
    },
    {
      alias: 'SL',
      doctor: 'Dr. Sofia Lim',
      specialty: 'Cardiologist',
      type: 'Video',
      date: 'Tue, Feb 10, 2026',
      time: '9:00 AM',
      complaint: 'Chest discomfort and palpitations',
      status: 'Completed',
      duration: '35 minutes',
      prescriptions: 4,
      labRequests: 3,
    },
    {
      alias: 'RS',
      doctor: 'Dr. Ramon Santos',
      specialty: 'Gastroenterologist',
      type: 'Chat',
      date: 'Sun, Jan 25, 2026',
      time: '3:00 PM',
      complaint: 'Stomach pain and indigestion',
      status: 'Completed',
      duration: '20 minutes',
      prescriptions: 3,
      labRequests: 0,
    }
  ];

  const prescriptionsList = [
    { 
      id: 'p1', 
      doctor: 'Dr. Maria Santos', 
      issuedOn: 'March 28, 2026', 
      status: 'Active', 
      medications: ['Amoxicillin 500mg', 'Cetirizine 10mg', 'Paracetamol 500mg'], 
      validUntil: '4/28/2026' 
    },
    { 
      id: 'p2', 
      doctor: 'Dr. Carlos Torres', 
      issuedOn: 'March 15, 2026', 
      status: 'Active', 
      medications: ['Hydrocortisone Cream 1%', 'Cetirizine 10mg'], 
      validUntil: '4/15/2026' 
    },
    { 
      id: 'p3', 
      doctor: 'Dr. Sofia Lim', 
      issuedOn: 'February 10, 2026', 
      status: 'Expired', 
      medications: ['Atorvastatin 20mg', 'Aspirin 100mg', 'Metoprolol 50mg'], 
      validUntil: '3/10/2026' 
    }
  ];

  const labRequestsList = [
    { 
      id: 'l1', 
      doctor: 'Dr. Maria Santos', 
      test: 'Complete Blood Count (CBC)', 
      date: '3/28/2026', 
      status: 'Pending',
      location: 'OkieDoc+ Lab Center - BGC'
    },
    { 
      id: 'l2', 
      doctor: 'Dr. Sofia Lim', 
      test: 'Lipid Profile, ECG, Chest X-Ray', 
      date: '2/10/2026', 
      status: 'Completed',
      location: 'OkieDoc+ Diagnostic Center - Makati'
    },
    { 
      id: 'l3', 
      doctor: 'Dr. Miguel Garcia', 
      test: 'Knee X-Ray, MRI Scan', 
      date: '2/20/2026', 
      status: 'Completed',
      location: 'OkieDoc+ Imaging Center - Ortigas'
    }
  ];

  const medicalCertificatesList = [
    { 
      id: 'm1', 
      doctor: 'Dr. Maria Santos', 
      purpose: 'Sick Leave - Flu', 
      date: '3/28/2026', 
      duration: 'March 28-30, 2026 (3 days)' 
    },
    { 
      id: 'm2', 
      doctor: 'Dr. Carlos Torres', 
      purpose: 'Fit to Work Certificate', 
      date: '3/15/2026', 
      duration: 'Valid from March 16, 2026' 
    }
  ];

  const treatmentPlansList = [
    { 
      id: 't1', 
      doctor: 'Dr. Sofia Lim', 
      plan: 'Hypertension Management', 
      specialty: 'Cardiologist',
      startDate: '2/10/2026', 
      nextReview: '5/10/2026',
      status: 'Active' 
    },
    { 
      id: 't2', 
      doctor: 'Dr. Anna Cruz', 
      plan: 'Anxiety Disorder Treatment', 
      specialty: 'Psychiatrist',
      startDate: '3/10/2026', 
      nextReview: '4/10/2026',
      status: 'Active' 
    }
  ];

  const referralsList = [
    { 
      id: 'r1', 
      doctor: 'Dr. Maria Santos (General Physician)', 
      referredTo: 'Dr. Carlos Torres', 
      specialty: 'Dermatologist', 
      reason: 'Skin rash on arms', 
      date: '3/28/2026', 
      status: 'Booked',
      apptDate: '4/5/2026',
      notes: 'Patient needs a follow-up for skin rash.'
    },
    { 
      id: 'r2', 
      doctor: 'Dr. Sofia Lim (Cardiologist)', 
      referredTo: 'Dr. Miguel Garcia', 
      specialty: 'Orthopedic Surgeon', 
      reason: 'Knee pain after exercise', 
      date: '2/10/2026', 
      status: 'Pending' 
    }
  ];

  const currentData = (() => {
    const lowerQuery = searchQuery.toLowerCase();
    switch(selectedCategory) {
      case 'Consultation History':
        return consultationHistory.filter(item => {
          const matchesSearch = !searchQuery || item.doctor.toLowerCase().includes(lowerQuery) || item.specialty.toLowerCase().includes(lowerQuery) || item.complaint.toLowerCase().includes(lowerQuery);
          const matchesType = !selectedType || item.type === selectedType;
          return matchesSearch && matchesType;
        });
      case 'Prescriptions':
        return prescriptionsList.filter(item => !searchQuery || item.doctor.toLowerCase().includes(lowerQuery) || item.medications.some(m => m.toLowerCase().includes(lowerQuery)));
      case 'Lab requests':
        return labRequestsList.filter(item => !searchQuery || item.doctor.toLowerCase().includes(lowerQuery) || item.test.toLowerCase().includes(lowerQuery));
      case 'Medical Certificates':
        return medicalCertificatesList.filter(item => !searchQuery || item.doctor.toLowerCase().includes(lowerQuery) || item.purpose.toLowerCase().includes(lowerQuery));
      case 'Treatment Plans':
        return treatmentPlansList.filter(item => !searchQuery || item.doctor.toLowerCase().includes(lowerQuery) || item.plan.toLowerCase().includes(lowerQuery));
      case 'Referrals':
        return referralsList.filter(item => !searchQuery || item.doctor.toLowerCase().includes(lowerQuery) || item.referredTo.toLowerCase().includes(lowerQuery) || item.specialty.toLowerCase().includes(lowerQuery) || item.reason.toLowerCase().includes(lowerQuery));
      default:
        return [];
    }
  })();

  return (
    <Screen title="Medical Records" subtitle="Access your complete healthcare history" icon="folder-open-outline" navigation={navigation}>
      <Card style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { flex: 1, marginRight: 8, fontSize: 18 }]}>Medical Records Sharing & Consent</Text>
          <Pill label="New" color="#2cb3d4" />
        </View>
        <Text style={styles.bodyText}>
          Securely share your medical records with doctors during consultations. Full control over what you share and for how long.
        </Text>
        <View style={[styles.tagRow, { justifyContent: 'flex-start', marginTop: 12, marginBottom: 16 }]}>
          <View style={[styles.pill, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}><Text style={[styles.pillText, { color: muted }]}>Privacy Protected</Text></View>
          <View style={[styles.pill, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}><Text style={[styles.pillText, { color: muted }]}>Encrypted</Text></View>
          <View style={[styles.pill, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}><Text style={[styles.pillText, { color: muted }]}>Time-Limited Access</Text></View>
        </View>
        <PrimaryButton 
          label="Manage Sharing" 
          icon="shield-checkmark-outline" 
          color="#3B82F6" 
          onPress={() => navigation.navigate('MedicalRecordsSharing')} 
        />
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, paddingHorizontal: 4 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedCategory === cat ? cyan : '#F1FAFE',
              marginRight: 8,
              borderWidth: 1,
              borderColor: selectedCategory === cat ? cyan : '#D8EAF0'
            }}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '700',
              color: selectedCategory === cat ? '#FFFFFF' : muted
            }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={muted} />
        <TextInput 
          style={styles.searchInput} 
          placeholder={selectedCategory === 'Consultation History' ? "Search by doctor, specialization, or complaint" : `Search ${selectedCategory.toLowerCase()}`} 
          placeholderTextColor="#94A3B8" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={18} color={muted} />
          </TouchableOpacity>
        )}
        {selectedCategory === 'Consultation History' && (
          <TouchableOpacity onPress={() => setShowFilter(!showFilter)} style={{ padding: 4, marginLeft: 4 }}>
            <Ionicons name="options-outline" size={18} color={showFilter ? cyan : muted} />
          </TouchableOpacity>
        )}
      </View>

      {selectedCategory === 'Consultation History' && showFilter && (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, paddingHorizontal: 4 }}>
          {['Video', 'Voice', 'Chat', 'Physical'].map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(selectedType === type ? null : type)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: selectedType === type ? cyan : '#F1FAFE',
                borderWidth: 1,
                borderColor: selectedType === type ? cyan : '#D8EAF0'
              }}
            >
              <Text style={{ fontSize: 12, color: selectedType === type ? '#FFFFFF' : muted, fontWeight: '600' }}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {currentData.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Ionicons name="search-outline" size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <Text style={styles.cardTitle}>{searchQuery ? 'No matching records found' : `No records found`}</Text>
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 4 }]}>
            {searchQuery ? `We couldn't find any records matching "${searchQuery}".` : `You don't have any ${selectedCategory.toLowerCase()} yet.`}
          </Text>
        </Card>
      ) : (
        currentData.map((item) => {
          if (selectedCategory === 'Consultation History') {
            return (
              <Card key={item.alias}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{item.alias}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.doctor}</Text>
                      <Text style={styles.bodyText}>{item.specialty}</Text>
                    </View>
                  </View>
                  <Pill label={item.status} color="#10B981" />
                </View>

                <View style={{ marginTop: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={item.type === 'Video' ? 'videocam-outline' : item.type === 'Voice' ? 'call-outline' : item.type === 'Chat' ? 'chatbubble-outline' : 'person-outline'} size={15} color={muted} />
                      <Text style={styles.metaText}>{item.type}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={15} color={muted} />
                      <Text style={styles.metaText}>Duration: {item.duration}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="calendar-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>{item.date} at {item.time}</Text>
                  </View>
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ color: ink, fontSize: 12, fontWeight: '700' }}>Chief Complaint:</Text>
                    <Text style={[styles.bodyText, { marginTop: 2 }]}>{item.complaint}</Text>
                  </View>
                </View>

                <View style={[styles.tagRow, { justifyContent: 'flex-start', marginTop: 12, marginBottom: 12 }]}>
                  {item.prescriptions > 0 && (
                    <View style={[styles.pill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                      <Text style={[styles.pillText, { color: '#D97706' }]}>{item.prescriptions} Prescription{item.prescriptions > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                  {item.labRequests > 0 && (
                    <View style={[styles.pill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Text style={[styles.pillText, { color: '#3B82F6' }]}>{item.labRequests} Lab Request{item.labRequests > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {['View Details', 'View Chat', 'Download', 'Email'].map(btn => (
                    <TouchableOpacity key={btn} style={[styles.outlineButton, { flex: 0, paddingHorizontal: 12, height: 32 }]}>
                      <Text style={[styles.outlineButtonText, { fontSize: 12 }]}>{btn}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            );
          }
          if (selectedCategory === 'Prescriptions') {
            return (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.doctor}</Text>
                    <Text style={styles.bodyText}>Issued on {item.issuedOn}</Text>
                  </View>
                  <Pill label={item.status} color={item.status === 'Active' ? '#10B981' : '#64748B'} />
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                  <Text style={[styles.bodyText, { color: ink, fontWeight: '700', marginBottom: 6 }]}>Medications:</Text>
                  {item.medications.map((med, idx) => (
                    <Text key={idx} style={[styles.bodyText, { marginBottom: 2 }]}>• {med}</Text>
                  ))}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Ionicons name="calendar-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Valid until: {item.validUntil}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="download-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }
          if (selectedCategory === 'Lab requests') {
            return (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.test}</Text>
                    <Text style={styles.bodyText}>Requested by {item.doctor}</Text>
                  </View>
                  <Pill label={item.status} color={item.status === 'Completed' ? '#10B981' : '#F59E0B'} />
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="calendar-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Request Date: {item.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Request</Text>
                  </TouchableOpacity>
                  {item.status === 'Completed' && (
                    <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                      <Ionicons name="download-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                      <Text style={styles.outlineButtonText}>Download Results</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          }
          if (selectedCategory === 'Medical Certificates') {
            return (
              <Card key={item.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.purpose}</Text>
                  <Text style={styles.bodyText}>Issued by {item.doctor}</Text>
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="calendar-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Issue Date: {item.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>{item.duration}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Certificate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="download-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }
          if (selectedCategory === 'Treatment Plans') {
            return (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.plan}</Text>
                    <Text style={styles.bodyText}>{item.specialty}</Text>
                  </View>
                  <Pill label={item.status} color="#10B981" />
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                  <Text style={[styles.bodyText, { color: ink, fontWeight: '700', marginBottom: 6 }]}>{item.doctor}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="calendar-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Start Date: {item.startDate}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="refresh-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Next Review: {item.nextReview}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Plan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="download-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }
          if (selectedCategory === 'Referrals') {
            return (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Referral to {item.referredTo}</Text>
                    <Text style={styles.bodyText}>Referred by {item.doctor}</Text>
                  </View>
                  <Pill label={item.status} color={item.status === 'Booked' ? '#2fce76' : '#F59E0B'} />
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="calendar-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Referral Date: {item.date}</Text>
                  </View>
                  {item.apptDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="calendar-outline" size={15} color={muted} />
                      <Text style={styles.metaText}>Appointment Date: {item.apptDate}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="medkit-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Specialist: {item.specialty}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="document-text-outline" size={15} color={muted} />
                    <Text style={styles.metaText}>Reason: {item.reason}</Text>
                  </View>
                  {item.notes && (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Ionicons name="information-circle-outline" size={15} color={muted} style={{ marginTop: 2 }} />
                      <Text style={[styles.metaText, { flex: 1 }]}>Notes: {item.notes}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  {item.status === 'Pending' && (
                    <TouchableOpacity style={[{ backgroundColor: '#F59E0B', borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, height: 36, flex: 1 }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Book Appointment</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Referral</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }
          return null;
        })
      )}
    </Screen>
  );
}

export function InvoiceScreen({ navigation }) {
  const items = [
    ['Medical Certificate', '$350'],
    ['Medical Clearance', '$450'],
  ];

  return (
    <Screen title="Invoice" subtitle="Pending payment" icon="card-outline" navigation={navigation}>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.largeTitle}>Invoice</Text>
          <Text style={[styles.bodyText, { fontWeight: '700', color: ink }]}>INV-2026-0328-001</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.cardTitle}>Dr. Maria Santos - General Physician</Text>
          <Text style={styles.bodyText}>Consultation Date: March 28, 2026</Text>
          <Text style={styles.bodyText}>Issued: March 28, 2026</Text>
        </View>
        <View style={[styles.rowBetween, { alignItems: 'center', marginBottom: 0 }]}>
          <View>
            <Text style={styles.cardTitle}>Total Amount Due</Text>
            <Text style={styles.totalAmount}>$800</Text>
          </View>
          <Pill label="Unpaid" color="#F59E0B" />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Billing Breakdown</Text>
        <View style={{ marginTop: 8 }}>
          {items.map(([label, amount]) => (
            <View key={label} style={styles.invoiceRow}>
              <Text style={styles.bodyText}>{label}</Text>
              <Text style={styles.invoiceAmount}>{amount}</Text>
            </View>
          ))}
          <View style={styles.invoiceRow}>
            <Text style={styles.bodyText}>Subtotal</Text>
            <Text style={styles.invoiceAmount}>$800</Text>
          </View>
          <View style={[styles.invoiceRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.cardTitle}>Amount Due</Text>
            <Text style={styles.totalAmount}>$800</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Actions</Text>
        <PrimaryButton 
          label="Pay Now" 
          icon="card" 
          color="#F59E0B" 
          onPress={() => navigation.navigate('PaymentSuccess')} 
        />
        <TouchableOpacity style={[styles.outlineButton, { marginTop: 12 }]}>
          <Text style={styles.outlineButtonText}>Download Invoice PDF</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
}

export function PaymentSuccessScreen({ navigation }) {
  return (
    <Screen title="Payment Receipt" subtitle="Transaction successful" icon="checkmark-circle-outline" navigation={navigation} hideBackButton={true}>
      <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
        </View>
        <Text style={styles.largeTitle}>Payment Successful</Text>
        <Text style={styles.bodyText}>Thank you! Your payment has been received.</Text>

        <View style={{ width: '100%', marginTop: 24, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12 }}>
          <View style={styles.invoiceRow}>
            <Text style={styles.bodyText}>Amount Paid</Text>
            <Text style={[styles.invoiceAmount, { color: '#10B981', fontSize: 18 }]}>$800.00</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.bodyText}>Receipt Number</Text>
            <Text style={[styles.invoiceAmount, { fontSize: 13, color: muted }]}>RCT-2026-0328-001</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.bodyText}>Date Paid</Text>
            <Text style={[styles.invoiceAmount, { fontSize: 13, color: muted }]}>March 28, 2026</Text>
          </View>
          <View style={[styles.invoiceRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.bodyText}>Payment Method</Text>
            <Text style={[styles.invoiceAmount, { fontSize: 13, color: muted }]}>Visa ending in 4242</Text>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: 12 }}>
        <PrimaryButton label="Back to Dashboard" icon="home-outline" onPress={() => navigation.navigate('Dashboard')} /> 
        <TouchableOpacity style={[styles.outlineButton, { marginTop: 12, flexDirection: 'row' }]}>
          <Text style={[styles.outlineButtonText, { marginRight: 10 }]}>Download Receipt</Text>
          <Ionicons name="download-outline" size={16} color={cyan} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

export function MedicalRecordsSharingScreen({ navigation }) {
  const [sharingModalVisible, setSharingModalVisible] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [accessDuration, setAccessDuration] = useState('one-time');
  const [showDenyWarning, setShowDenyWarning] = useState(false);
  const [lastShareActivity, setLastShareActivity] = useState(null);

  const doctors = [
    { doc: 'Dr. Maria Santos', spec: 'Cardiologist', reason: 'Heart Condition follow-up' },
    { doc: 'Dr. James Chen', spec: 'Orthopedic Surgeon', reason: 'Knee Pain assessment' },
    { doc: 'Dr. Sofia Reyes', spec: 'Dermatologist', reason: 'Skin condition review' },
  ];

  const features = [
    { icon: 'shield-checkmark-outline', title: 'Granular Control', sub: 'Choose exactly which records to share', color: '#10B981' },
    { icon: 'time-outline', title: 'Time-Limited Access', sub: 'Set duration for record access', color: '#F59E0B' },
    { icon: 'lock-closed-outline', title: 'Revoke Anytime', sub: 'Remove access with one click', color: '#EF4444' },
    { icon: 'eye-outline', title: 'Audit Trail', sub: 'See who accessed your records', color: '#8B5CF6' }
  ];

  const recordOptions = [
    { id: 'consultations', icon: 'calendar-outline', title: 'Previous Consultations', count: '8 items', subtitle: 'History of past doctor visits and diagnoses' },
    { id: 'prescriptions', icon: 'medical-outline', title: 'Prescriptions', count: '12 items', subtitle: 'Medication history and current prescriptions' },
    { id: 'labs', icon: 'flask-outline', title: 'Lab Results', count: '5 items', subtitle: 'Blood tests, imaging, and diagnostic reports' },
    { id: 'certificates', icon: 'document-text-outline', title: 'Medical Certificates', count: '3 items', subtitle: 'Sick leaves and fitness to work documents' },
    { id: 'plans', icon: 'fitness-outline', title: 'Treatment Plans', count: '2 items', subtitle: 'Ongoing treatment protocols and care plans' },
  ];

  const handleSelectAll = () => {
    if (selectedRecords.length === recordOptions.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(recordOptions.map(r => r.id));
    }
  };

  const toggleRecord = (id) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter(r => r !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  return (
    <>
    <Screen title="Medical Records Sharing" subtitle="Manage your medical data consent and privacy" icon="share-social-outline" navigation={navigation}>
      <Card style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: '#1E3A8A' }]}>Your Privacy is Protected</Text>
          <Text style={[styles.bodyText, { color: '#1E40AF', marginTop: 4 }]}>All medical records are encrypted and shared securely. You have full control over who can access your data and for how long.</Text>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Try Record Sharing Flow</Text>
      <Text style={[styles.bodyText, { marginBottom: 12, paddingHorizontal: 4 }]}>Click on any scenario below to experience the consent flow</Text>
      {doctors.map((item, index) => (
        <Card key={index}>
          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: cyan + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="person" size={24} color={cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.doc}</Text>
              <Text style={[styles.bodyText, { fontWeight: '700', color: ink }]}>{item.spec}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="medical-outline" size={14} color={muted} style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>{item.reason}</Text>
              </View>
            </View>
          </View>
          <PrimaryButton 
            label="Start Sharing Flow" 
            icon="arrow-forward" 
            color={cyan} 
            onPress={() => {
              setCurrentDoctor(item);
              setSelectedRecords([]);
              setAccessDuration('one-time');
              setShowDenyWarning(false);
              setSharingModalVisible(true);
            }}
          />
        </Card>
      ))}

      {lastShareActivity && (
        <>
          <Text style={styles.sectionHeader}>Latest Share Activity</Text>
          <Card style={{ borderColor: '#10B981', borderWidth: 1, backgroundColor: '#F0FDF4', marginBottom: 24 }}>
            <View style={styles.rowBetween}>
              <Text style={[styles.cardTitle, { color: '#065F46' }]}>Records Shared Successfully</Text>
              <Pill label="Active" color="#10B981" />
            </View>
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={styles.bodyText}><Text style={{fontWeight: '700', color: ink}}>Shared with:</Text> {lastShareActivity.doctor}</Text>
              <Text style={styles.bodyText}><Text style={{fontWeight: '700', color: ink}}>Records shared:</Text> {lastShareActivity.count} types</Text>
              <Text style={styles.bodyText}><Text style={{fontWeight: '700', color: ink}}>Access:</Text> {lastShareActivity.access}</Text>
              <Text style={styles.bodyText}><Text style={{fontWeight: '700', color: ink}}>Shared on:</Text> {lastShareActivity.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }]}>
                <Ionicons name="eye-outline" size={16} color={ink} style={{ marginRight: 6 }} />
                <Text style={[styles.outlineButtonText, { color: ink }]}>View Shared Records</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row', backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} onPress={() => setLastShareActivity(null)}>
                <Ionicons name="lock-closed-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.outlineButtonText, { color: '#EF4444' }]}>Revoke Access</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </>
      )}

      <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Privacy Features</Text>
      <View>
        {features.map((feat, index) => (
          <Card key={index} style={{ alignItems: 'center', paddingVertical: 20 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: feat.color + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name={feat.icon} size={24} color={feat.color} />
            </View>
            <Text style={[styles.cardTitle, { textAlign: 'center', fontSize: 16, marginBottom: 4 }]}>{feat.title}</Text>
            <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 14 }]}>{feat.sub}</Text>
          </Card>
        ))}
      </View>
    </Screen>

    <Modal visible={sharingModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSharingModalVisible(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
            <Ionicons name="shield-outline" size={28} color={ink} style={{ marginRight: 12, marginTop: 2 }} />
            <View>
              <Text style={{ color: ink, fontSize: 22, fontWeight: '800' }}>Share Medical Records</Text>
              <Text style={{ color: muted, fontSize: 14, marginTop: 2 }}>{currentDoctor?.reason}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#38BDF8', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: '#0369A1' }]}>{currentDoctor?.doc}</Text>
                <Text style={[styles.bodyText, { color: '#0284C7', fontWeight: '700' }]}>{currentDoctor?.spec}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: '#D1FAE5', padding: 12, borderRadius: 8, alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={20} color="#059669" style={{ marginRight: 8 }} />
              <Text style={{ flex: 1, color: '#065F46', fontSize: 13, lineHeight: 18 }}>
                <Text style={{ fontWeight: '700' }}>Important:</Text> This doctor requires your medical records for accurate diagnosis and treatment planning.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.cardTitle}>Select Records to Share</Text>
              <Text style={styles.bodyText}>Choose which medical records to provide.</Text>
            </View>
            <TouchableOpacity onPress={handleSelectAll} style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 2 }}>
              <Ionicons name="checkmark-done" size={16} color={cyan} style={{ marginRight: 4 }} />
              <Text style={{ color: cyan, fontSize: 13, fontWeight: '700' }}>Select all</Text>
            </TouchableOpacity>
          </View>

          {recordOptions.map(option => {
            const isSelected = selectedRecords.includes(option.id);
            return (
              <TouchableOpacity 
                key={option.id} 
                style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: isSelected ? cyan : '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}
                onPress={() => toggleRecord(option.id)}
              >
                <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? cyan : muted} style={{ marginRight: 12 }} />
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1FAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name={option.icon} size={20} color={cyan} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    <Text style={{ color: cyan, fontSize: 12, fontWeight: '700' }}>{option.count}</Text>
                  </View>
                  <Text style={styles.bodyText}>{option.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )
          })}

          <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 }} />

          <Text style={styles.cardTitle}>Access Duration</Text>
          <Text style={[styles.bodyText, { marginBottom: 16 }]}>Control how long the doctor can access your records</Text>

          <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12, borderRadius: 12, borderColor: accessDuration === 'one-time' ? cyan : '#E2E8F0', borderWidth: 2 }} onPress={() => setAccessDuration('one-time')}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name={accessDuration === 'one-time' ? 'radio-button-on' : 'radio-button-off'} size={24} color={accessDuration === 'one-time' ? cyan : muted} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={styles.cardTitle}>One-time Access</Text>
                      <View style={[styles.pill, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0', paddingVertical: 2, paddingHorizontal: 6 }]}><Text style={[styles.pillText, { color: '#059669', fontSize: 10 }]}>Recommended</Text></View>
                  </View>
                  <Text style={styles.bodyText}>Records accessible only during this consultation session</Text>
                </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, marginBottom: 24, borderRadius: 12, borderColor: accessDuration === 'follow-up' ? cyan : '#E2E8F0', borderWidth: 2 }} onPress={() => setAccessDuration('follow-up')}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name={accessDuration === 'follow-up' ? 'radio-button-on' : 'radio-button-off'} size={24} color={accessDuration === 'follow-up' ? cyan : muted} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { marginBottom: 4 }]}>Allow Access for Follow-up</Text>
                  <Text style={styles.bodyText}>Doctor can access records for future consultations (30 days)</Text>
                </View>
            </View>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 12, padding: 16, marginBottom: 24, flexDirection: 'row' }}>
            <Ionicons name="lock-closed" size={24} color="#3B82F6" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: '#1E3A8A' }]}>Privacy & Security</Text>
              <Text style={[styles.bodyText, { color: '#1E40AF', marginTop: 4, lineHeight: 20 }]}>
                Your records will only be shared with <Text style={{ fontWeight: '700' }}>{currentDoctor?.doc}</Text> for this consultation. All data is encrypted and HIPAA compliant. You can revoke access anytime from your Privacy Settings.
              </Text>
            </View>
          </View>

          {!showDenyWarning ? (
            <TouchableOpacity style={{ height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }} onPress={() => setShowDenyWarning(true)}>
              <Text style={{ color: ink, fontSize: 14, fontWeight: '700' }}>Deny Access</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <Ionicons name="warning" size={24} color="#D97706" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: '#92400E' }]}>Are you sure you want to deny access?</Text>
                  <Text style={[styles.bodyText, { color: '#B45309', marginTop: 4, lineHeight: 20 }]}>Without access to your medical records, the doctor may not be able to provide accurate diagnosis or treatment recommendations.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={{ flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#D97706', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }} onPress={() => setShowDenyWarning(false)}>
                  <Text style={{ color: '#D97706', fontSize: 14, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }} onPress={() => { setShowDenyWarning(false); setSharingModalVisible(false); }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Confirm Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={{ height: 48, borderRadius: 8, backgroundColor: (selectedRecords.length === 0 || showDenyWarning) ? '#CBD5E1' : cyan, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }} 
            disabled={selectedRecords.length === 0 || showDenyWarning} 
            onPress={() => {
              setLastShareActivity({
                doctor: currentDoctor?.doc,
                count: selectedRecords.length,
                access: accessDuration === 'one-time' ? 'One-time only' : 'Follow-up (30 days)',
                date: 'May 25, 2026 at 11:36 PM'
              });
              setSharingModalVisible(false);
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Share Selected ({selectedRecords.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ height: 48, borderRadius: 8, backgroundColor: showDenyWarning ? '#CBD5E1' : '#0AB4B5', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }} 
            disabled={showDenyWarning} 
            onPress={() => {
              setLastShareActivity({
                doctor: currentDoctor?.doc,
                count: recordOptions.length,
                access: accessDuration === 'one-time' ? 'One-time only' : 'Follow-up (30 days)',
                date: 'May 25, 2026 at 11:36 PM'
              });
              setSharingModalVisible(false);
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Share All Records</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', color: muted, fontSize: 12, marginBottom: 40 }}>
            By sharing records, you consent to the terms outlined in our{'\n'}
            <Text style={{ color: '#3B82F6', fontWeight: '700', fontSize: 14 }}>Privacy Policy</Text>
          </Text>

        </ScrollView>
      </SafeAreaView>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
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
  backButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerCopy: { flex: 1 },
  headerTitle: { color: ink, fontSize: 17, fontWeight: '800' },
  headerSubtitle: { color: muted, fontSize: 11, marginTop: 2 },
  content: { backgroundColor: bg, padding: 12, paddingBottom: 28 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E5F3F7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroCard: { backgroundColor: '#F8FCFF', borderColor: '#BDEAF0' },
  heroEyebrow: { color: cyan, fontSize: 12, fontWeight: '800', marginBottom: 5 },
  largeTitle: { color: ink, fontSize: 24, lineHeight: 29, fontWeight: '800', marginBottom: 6 },
  cardTitle: { color: ink, fontSize: 16, fontWeight: '800', marginBottom: 5 },
  bodyText: { color: muted, fontSize: 13, lineHeight: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 11 },
  metaText: { color: muted, fontSize: 13, marginLeft: 7 },
  primaryButton: {
    height: 39,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginRight: 10 },
  outlineButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDEAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { color: cyan, fontSize: 13, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 13 },
  pill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F6FA',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  segment: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: cyan },
  segmentText: { color: muted, fontSize: 12, fontWeight: '800' },
  segmentTextActive: { color: '#FFFFFF' },
  dateBox: { width: 76, borderRadius: 10, backgroundColor: '#E0F7FA', alignItems: 'center', paddingVertical: 8 },
  dateDay: { color: cyan, fontSize: 13, fontWeight: '800' },
  dateTime: { color: muted, fontSize: 11, marginTop: 2 },
  bigIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14 },
  profileCard: { alignItems: 'center' },
  avatar: { width: 78, height: 78, borderRadius: 22, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 42, height: 42, borderRadius: 11, backgroundColor: '#E0F7FA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  searchBox: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8EAF0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 13,
  },
  searchInput: { flex: 1, color: ink, fontSize: 14, marginLeft: 8 },
  recordIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1FAFE', alignItems: 'center', justifyContent: 'center' },
  
  // --- MESSAGING STYLES ---
  chatListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  chatAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  chatListInfo: { flex: 1, marginLeft: 14 },
  chatListName: { color: ink, fontSize: 16, fontWeight: '700' },
  chatListTime: { color: muted, fontSize: 12 },
  chatListLastMsg: { color: muted, fontSize: 14, marginTop: 4, flex: 1, paddingRight: 10 },
  unreadBadge: { backgroundColor: cyan, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  activeChatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  chatAvatarSmall: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chatAvatarTextSmall: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  activeChatName: { color: ink, fontSize: 16, fontWeight: '800' },
  activeChatRole: { color: muted, fontSize: 12 },
  chatScrollArea: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: bg, flexGrow: 1 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, maxWidth: '85%' },
  messageWrapperMine: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageWrapperOther: { alignSelf: 'flex-start' },
  chatAvatarTiny: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  chatAvatarTextTiny: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  chatBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  chatBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#D8EAF0',
  },
  chatBubbleMine: { backgroundColor: cyan, borderBottomRightRadius: 4 },
  chatText: { fontSize: 15, lineHeight: 22 },
  chatMineText: { color: '#FFFFFF' },
  chatOtherText: { color: ink },
  chatTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  chatMineTime: { color: 'rgba(255,255,255,0.7)' },
  chatOtherTime: { color: '#94A3B8' },
  messageComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  messageInput: { 
    flex: 1, 
    minHeight: 40, 
    maxHeight: 100,
    borderRadius: 20, 
    backgroundColor: '#F1FAFE', 
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    color: ink,
    fontSize: 15,
    marginHorizontal: 8
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },

  videoPreview: {
    height: 300,
    borderRadius: 16,
    backgroundColor: '#063B4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    overflow: 'hidden',
  },
  videoTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 10 },
  videoSub: { color: '#BDEAF0', fontSize: 13, marginTop: 6 },
  callControls: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginBottom: 16 },
  callControl: { width: 58, height: 58, borderRadius: 18, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center' },
  callControlActive: { backgroundColor: '#F59E0B' },
  endCall: { backgroundColor: '#EF4444', transform: [{ rotate: '135deg' }] },
  warningBorder: { borderLeftWidth: 5, borderLeftColor: '#F59E0B' },
  detailBlock: { marginTop: 14 },
  detailLabel: { color: muted, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  detailText: { color: ink, fontSize: 16, fontWeight: '700' },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  invoiceAmount: { color: ink, fontSize: 15, fontWeight: '800' },
  invoiceTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  totalAmount: { color: '#F59E0B', fontSize: 26, fontWeight: '900' },

  // --- AUTH & FORMS ---
  authWrapper: { backgroundColor: bg, justifyContent: 'center', paddingHorizontal: 16 },
  authHeader: { alignItems: 'center', marginBottom: 30 },
  authLogoBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  authLogoText: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  authTitle: { color: ink, fontSize: 28, fontWeight: '900', marginBottom: 4 },
  authSubtitle: { color: muted, fontSize: 15, fontWeight: '500' },
  authCard: { padding: 24, marginHorizontal: 8 },
  authToggle: { marginTop: 20, alignItems: 'center', paddingVertical: 8 },
  authToggleText: { color: muted, fontSize: 14, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: ink, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  textInput: { 
    height: 48, 
    backgroundColor: '#F8FCFF', 
    borderWidth: 1, 
    borderColor: '#D8EAF0', 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    color: ink, 
    fontSize: 15 
  },

  // --- PROFILE SECTIONS ---
  sectionHeader: { color: ink, fontSize: 16, fontWeight: '800', marginTop: 18, marginBottom: 10, paddingHorizontal: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { color: muted, fontSize: 13, fontWeight: '600' },
  infoValue: { color: ink, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  linkIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1FAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkText: { flex: 1, color: ink, fontSize: 14, fontWeight: '700' },
  linkDivider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 60 },
});
