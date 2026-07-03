import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Animated,
  SafeAreaView,
  Switch,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';

import { API_URL, currentUser, setCurrentUser } from './config';

const teal = '#0AB4B5';
const cyan = '#089FB4';
const bg = '#ffffff';
const ink = '#071C3A';
const muted = '#45627F';

const formatPhoneNumber = (value) => {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  
  if (digits.startsWith('0')) {
    digits = '63' + digits.substring(1);
  } else if (!digits.startsWith('63')) {
    if (digits.length <= 2 && '63'.startsWith(digits)) {
      // Allow user to manually type "6" then "3"
    } else {
      digits = '63' + digits;
    }
  }
  
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.substring(0, 2)} ${digits.substring(2)}`;
  if (digits.length <= 8) return `+${digits.substring(0, 2)} ${digits.substring(2, 5)}-${digits.substring(5)}`;
  return `+${digits.substring(0, 2)} ${digits.substring(2, 5)}-${digits.substring(5, 8)}-${digits.substring(8, 12)}`;
};

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

function Screen({ children, title, subtitle, icon, navigation, hideBackButton, scrollViewRef }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title={title} subtitle={subtitle} icon={icon} navigation={navigation} hideBackButton={hideBackButton} />
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
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

function PrimaryButton({ label, icon = 'arrow-forward', color = cyan, onPress, disabled }) {
  return (
    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: color }]} onPress={onPress} disabled={disabled}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name={icon} size={16} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function AnimatedSelectionCard({ isSelected, onPress, disabled, children, disabledStyle }) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#E8F6FA']
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F1F5F9', '#089FB4']
  });

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7} style={disabled && disabledStyle}>
      <Animated.View style={[styles.card, { backgroundColor, borderColor, borderWidth: isSelected ? 2 : 1 }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function AnimatedBodyPart({ part, isSelected, onPress }) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const fill = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#FEF2F2']
  });

  const stroke = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', '#EF4444']
  });

  if (part.isCircle) {
    return <AnimatedCircle cx={part.cx} cy={part.cy} r={part.r} fill={fill} stroke={stroke} strokeWidth="2" onPress={onPress} />;
  }
  return <AnimatedRect x={part.x} y={part.y} width={part.w} height={part.h} rx={part.rx || 0} fill={fill} stroke={stroke} strokeWidth="2" onPress={onPress} />;
}

export function AppointmentsScreen({ navigation, route }) {
  const [selected, setSelected] = useState('Upcoming');
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123'; // Use mock data if no user is logged in, or if it's the mock user

  const [upcomingAppointments, setUpcomingAppointments] = useState(isMockUser ? [
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
  ] : []);

  // Fetch appointments from the Sails backend every time the screen is focused
  useEffect(() => {
    const loadAppointments = () => {
      if (!currentUser?.id) return;
      fetch(`${API_URL}/appointment?user=${currentUser.id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status} - ${errText}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.length > 0) {
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            // Automatically attach actions for the frontend UI buttons
            const formattedData = sortedData.map(appt => ({
              ...appt,
              actions: appt.type?.toLowerCase().includes('video') ? ['Join Call', 'Message'] : ['Message']
            }));
            setUpcomingAppointments(prev => {
              const newItems = formattedData.filter(fd => !prev.some(p => p.id === fd.id));
              return [...newItems, ...prev];
            });
          }
        })
        .catch((err) => console.error('Error fetching appointments from API:', err));
    };

    const unsubscribe = navigation.addListener('focus', loadAppointments);
    loadAppointments(); // Fetch immediately on mount as well

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route?.params?.newAppointment) {
      const newAppt = route.params.newAppointment;
      
      // Save the newly booked appointment to the Sails.js Database
      fetch(`${API_URL}/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: newAppt.doctor || 'Unknown Doctor',
          specialty: newAppt.specialty || '',
          status: newAppt.status || 'Confirmed',
          date: newAppt.date || '',
          time: newAppt.time || '',
          type: newAppt.type || '',
          color: newAppt.color || '#089FB4',
          chiefComplaint: newAppt.chiefComplaint || '',
          user: String(currentUser?.id)
        }),
      })
        .then((res) => res.json())
        .then((savedAppt) => {
          // Attach UI actions and append it to our screen list
          savedAppt.actions = newAppt.actions || ['Message'];
          setUpcomingAppointments(prev => {
            const exists = prev.find(a => a.id === savedAppt.id);
            if (exists) return prev;
            return [savedAppt, ...prev];
          });
        })
        .catch((err) => console.error('Error posting new appointment:', err));

      navigation.setParams({ newAppointment: undefined });
    }
  }, [route?.params?.newAppointment, navigation]);

  const [pastAppointments, setPastAppointments] = useState(isMockUser ? [
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
  ] : []);

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
                    else if (act === 'Message') navigation.navigate('Messages', { doctorName: appt.doctor });
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
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalMed, setRenewalMed] = useState(null);
  const [preferredPharmacy, setPreferredPharmacy] = useState('');
  const [renewalNotes, setRenewalNotes] = useState('');
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123'; // Use mock data if no user is logged in, or if it's the mock user

  const [prescriptions, setPrescriptions] = useState(isMockUser ? [
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
      daysRemaining: 5,
      totalDays: 30,
      nextRefill: 'April 5, 2026',
      status: 'Refill Soon',
      color: '#089FB4',
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
  ] : []);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`${API_URL}/prescription?user=${currentUser.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status} - ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setPrescriptions(prev => {
            const newItems = data.filter(d => !prev.some(p => (p.id && p.id === d.id) || p.name === d.name));
            return [...newItems, ...prev];
          });
        }
      })
      .catch((err) => console.error('Error fetching prescriptions:', err));
  }, []);

  const activeMeds = prescriptions.filter(med => med.status !== 'Past');
  const pastMeds = prescriptions.filter(med => med.status === 'Past');

  const formatReminderTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const closeReminderModal = () => {
    setShowTimePicker(false);
    setShowReminderModal(false);
    setSelectedMed('');
    setSelectedTime('');
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerTime,
        mode: 'time',
        is24Hour: false,
        display: 'default',
        onChange: handleTimeChange,
      });
      return;
    }

    setShowTimePicker((visible) => !visible);
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        const newTime = selectedDate || pickerTime;
        setPickerTime(newTime);
        setSelectedTime(formatReminderTime(newTime));
      }
      return;
    }

    // For iOS, we just update the picker's internal time state.
    // The 'Done' button will handle the final selection.
    if (selectedDate) {
      setPickerTime(selectedDate);
    }
  };

  const saveReminder = () => {
    if (selectedMed && selectedTime) {
      setReminders([...reminders, { id: Date.now().toString(), medication: selectedMed, time: selectedTime }]);
      closeReminderModal();
    }
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <>
      <Screen title="Prescriptions" subtitle="Manage your medications" icon="document-text-outline" navigation={navigation}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 0, marginBottom: 12, paddingHorizontal: 4 }}>
        <Text style={[styles.sectionHeader, { marginTop: 0, marginBottom: 0, paddingHorizontal: 0 }]}>Active Medications</Text>
      </View>

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

          <View style={{ marginTop: 4, marginBottom: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={16} color={muted} />
              <Text style={[styles.bodyText, { fontSize: 12, marginLeft: 6 }]}>Next refill {med.nextRefill}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.outlineButton, { flex: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: cyan, borderColor: cyan }]}
                onPress={() => {
                  setRenewalMed({ name: med.name, prescriber: med.prescriber });
                  setShowRenewalModal(true);
                }}
              >
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={[styles.outlineButtonText, { color: '#FFFFFF' }]}>Refill</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.outlineButton, { flex: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => { setSelectedMed(med.name); setShowReminderModal(true); }}
              >
                <Ionicons name="alarm-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                <Text style={styles.outlineButtonText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
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
      <Text style={[styles.sectionHeader, { marginTop: 12, marginBottom: 12 }]}>Reminders</Text>
      
      {reminders.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 24, marginBottom: 24 }}>
          <Ionicons name="notifications-off-outline" size={28} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <Text style={styles.cardTitle}>No Reminders Set</Text>
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 4 }]}>
            You can set a reminder from any of your active medications above.
          </Text>
        </Card>
      ) : (
        reminders.map((rem) => (
          <Card key={rem.id} style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.recordIcon, { backgroundColor: teal + '15', marginRight: 12 }]}>
                <Ionicons name="alarm-outline" size={20} color={teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{rem.medication}</Text>
                <Text style={styles.bodyText}>Scheduled for {rem.time}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeReminder(rem.id)} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </Card>
        ))
      )}
      </Screen>

      {/* Reminder Configuration Modal */}
      <Modal visible={showReminderModal} transparent={true} animationType="fade" onRequestClose={closeReminderModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
            <Text style={[styles.largeTitle, { fontSize: 20, marginBottom: 8, textAlign: 'center' }]}>Add Reminder</Text>
            <Text style={[styles.bodyText, { marginBottom: 20, textAlign: 'center' }]}>
              Set a reminder for <Text style={{ fontWeight: '700', color: ink }}>{selectedMed}</Text>.
            </Text>

            <Text style={styles.inputLabel}>Time *</Text>
            <TouchableOpacity 
              style={[styles.textInput, { justifyContent: 'center', marginBottom: showTimePicker && Platform.OS === 'ios' ? 12 : 24 }]} 
              onPress={openTimePicker}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <Ionicons name="time-outline" size={18} color={muted} style={{ marginRight: 8 }} />
                <Text style={{ flex: 1, color: selectedTime ? ink : '#94A3B8' }}>{selectedTime || 'Select a time'}</Text>
              </View>
            </TouchableOpacity>

            {showTimePicker && Platform.OS === 'ios' && (
              <View style={{ marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden' }}>
                <View style={{ paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <Text style={{ color: muted, fontSize: 12, fontWeight: '700' }}>Selected Time</Text>
                  <Text style={{ color: ink, fontSize: 22, fontWeight: '900', marginTop: 2 }}>{formatReminderTime(pickerTime)}</Text>
                </View>
                <DateTimePicker
                  value={pickerTime}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={handleTimeChange}
                  textColor={ink}
                  themeVariant="light"
                  style={{ width: '100%', height: 180, backgroundColor: '#FFFFFF' }}
                />
                <TouchableOpacity
                  style={{ height: 44, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
                  onPress={() => {
                    setSelectedTime(formatReminderTime(pickerTime));
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={{ color: cyan, fontSize: 15, fontWeight: '800' }}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.outlineButton, { flex: 1 }]} onPress={closeReminderModal}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.primaryButton, { flex: 1, marginTop: 0, backgroundColor: (!selectedMed || !selectedTime) ? '#CBD5E1' : cyan }]} 
                onPress={saveReminder}
                disabled={!selectedMed || !selectedTime}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Renewal Request Modal */}
      <Modal visible={showRenewalModal} transparent={true} animationType="fade" onRequestClose={() => setShowRenewalModal(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
                <Text style={[styles.largeTitle, { fontSize: 20, marginBottom: 8 }]}>Request Renewal</Text>
                <Text style={[styles.bodyText, { marginBottom: 16 }]}>
                  Submit a renewal request for <Text style={{ fontWeight: '700', color: ink }}>{renewalMed?.name}</Text>.
                </Text>

                <Text style={styles.inputLabel}>Preferred Pharmacy</Text>
                <TextInput style={[styles.textInput, { marginBottom: 16 }]} placeholder="e.g. CVS Pharmacy" placeholderTextColor="#94A3B8" value={preferredPharmacy} onChangeText={setPreferredPharmacy} />

                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput style={[styles.textInput, { height: 80, paddingTop: 12, marginBottom: 24 }]} placeholder="Any notes for the doctor..." placeholderTextColor="#94A3B8" multiline value={renewalNotes} onChangeText={setRenewalNotes} />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1 }]} onPress={() => { setShowRenewalModal(false); setPreferredPharmacy(''); setRenewalNotes(''); }}>
                    <Text style={styles.outlineButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.primaryButton, { flex: 1, marginTop: 0, backgroundColor: cyan }]} 
                    onPress={() => {
                      const payload = {
                        medication: renewalMed?.name || 'Unknown',
                        prescriber: renewalMed?.prescriber || 'Unknown',
                        pharmacy: preferredPharmacy,
                        notes: renewalNotes,
                        status: 'Pending',
                        user: String(currentUser?.id)
                      };
                      fetch(`${API_URL}/renewalrequest`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      }).catch(err => console.error('Error submitting renewal:', err));

                      setShowRenewalModal(false);
                      setPreferredPharmacy('');
                      setRenewalNotes('');
                      Alert.alert("Request Sent", `Your renewal request for ${renewalMed?.name} has been sent to ${renewalMed?.prescriber}.`);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export function AuthScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both your email and password.');
      return;
    }

    try {
      console.log(`Attempting to login at: ${API_URL}/user/login`);
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const responseText = await response.text();
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { error: `Endpoint missing on backend (Server returned: ${responseText})` };
      }
      
      if (response.ok) {
        setCurrentUser(data.user);
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Connection Error:', error);
      Alert.alert('Connection Error', `Could not connect to ${API_URL}.\n\nPlease check your IP address in config.js and ensure your Sails server is running.`);
    }
  };

  const handleForgotPassword = () => {
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Email Required', 'Please enter your registered email address first to reset your password.');
      return;
    }
    
    Alert.alert(
      'Reset Password',
      `A secure password reset link will be sent to:\n${email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Link', onPress: () => {
            Alert.alert('Link Sent!', 'For testing purposes, we will simulate clicking the link from your email inbox.', [
              { text: 'Simulate Click', onPress: () => navigation.navigate('ResetPassword') }
            ]);
        }}
      ]
    );
  };

  const handleBiometricLogin = () => {
    // In a real app, this would use Expo's LocalAuthentication API.
    // For this mock, we'll simulate a successful login and set a mock user.
    const mockUser = {
      id: 'mock-user-123',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@mock.com',
      phone: '+63 912-345-6789',
      dob: '12/05/1990',
      gender: 'Female',
      address: 'Oklahoma City, OK',
      bloodType: 'O+',
      allergies: 'Penicillin, Peanuts',
      emergencyName: 'John Williams',
      emergencyPhone: '+63 998-765-4321',
      emergencyEmail: 'john.williams@example.com',
      emergencyRelationship: 'Spouse',
      profileImage: null,
      isSubscriber: true,
      isVerified: true,
    };
    setCurrentUser(mockUser);
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.safeArea, styles.authWrapper]}>
      <StatusBar barStyle="dark-content" backgroundColor={bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              <TextInput style={styles.textInput} placeholder="Enter your email" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput style={[styles.textInput, { paddingRight: 40 }]} placeholder="Enter your password" placeholderTextColor="#94A3B8" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={muted} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 8 }} onPress={() => {}}>
                <Text style={{ color: cyan, fontSize: 12, fontWeight: '700' }}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton
              label="Sign In"
              icon="log-in-outline"
              onPress={handleLogin}
            />

            <TouchableOpacity style={{ alignItems: 'center', marginVertical: 24 }} onPress={handleBiometricLogin}>
              <Ionicons name="finger-print-outline" size={36} color={cyan} />
              <Text style={{ color: muted, fontSize: 11, marginTop: 4, fontWeight: '600' }}>Biometric Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.authToggle} onPress={() => navigation.navigate('CreateProfile')}>
              <Text style={styles.authToggleText}>
                Don't have an account? <Text style={{ color: cyan, fontWeight: '800' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const emptyChild = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  philHealth: false,
  philHealthNumber: "",
};

const emptyFamilyMember = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  relationship: "",
  philHealth: false,
  philHealthNumber: "",
};

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  birthDate: "",
  gender: "",
  philHealth: false,
  philHealthNumber: "",
  deliveryAddress: "",
  emergencyContact: "",
  familyMemberName: "",
  familyRelationship: "",
};

export function CreateProfileScreen({ navigation }) {
  const onNavigateHome = () => navigation.navigate('MainTabs');
  const onLogin = () => navigation.navigate('Auth');

  const [screen, setScreen] = useState("choose");
  const [guardianStep, setGuardianStep] = useState(1);
  const [familyStep, setFamilyStep] = useState(1);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const [children, setChildren] = useState([{ ...emptyChild }]);
  const [familyMembers, setFamilyMembers] = useState([{ ...emptyFamilyMember }]);

  const [form, setForm] = useState({ ...initialFormState });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const updateChild = (index, key, value) => {
    setChildren((prev) =>
      prev.map((child, i) => (i === index ? { ...child, [key]: value } : child))
    );
    setError("");
  };

  const updateFamilyMember = (index, key, value) => {
    setFamilyMembers((prev) =>
      prev.map((member, i) => (i === index ? { ...member, [key]: value } : member))
    );
    setError("");
  };

  const formatDate = (value) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const formatPhilHealth = (value) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 12);
    if (digits.length <= 2) return digits;
    if (digits.length <= 11) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 11)}-${digits.slice(11)}`;
  };

  const isValidDate = (date) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;
    const [mm, dd, yyyy] = date.split("/").map(Number);
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    if (yyyy < 1900 || yyyy > 2026) return false;
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim();
    return emailRegex.test(cleanEmail);
  };

  const validatePhone = (phone) => /^09\d{9}$/.test(phone);

  const getPasswordChecks = (password) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  });

  const passwordChecks = getPasswordChecks(form.password);
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const passwordStrengthText =
    passwordScore === 0
      ? ""
      : passwordScore <= 2
      ? "Weak"
      : passwordScore === 3
      ? "Fair"
      : passwordScore === 4
      ? "Good"
      : "Strong";

  const passwordStrengthColor =
    passwordScore <= 2
      ? "#DC2626"
      : passwordScore === 3
      ? "#F59E0B"
      : passwordScore === 4
      ? "#2563EB"
      : "#16A34A";

  const validateMainAccountFields = () => {
    const missing = [];

    if (form.firstName.trim() === "") missing.push("enter first name");
    if (form.lastName.trim() === "") missing.push("enter last name");

    if (form.email.trim() === "") missing.push("enter email address");
    else if (!validateEmail(form.email)) {
      missing.push("enter a valid email address format");
    }

    if (form.mobile.trim() === "") missing.push("enter mobile number");
    else if (!validatePhone(form.mobile)) {
      missing.push("enter a standard Philippine mobile number starting with 09 and exactly 11 digits");
    }

    if (form.password.trim() === "") missing.push("enter password");
    else if (passwordScore < 5) {
      missing.push("use a stronger password with 8 characters, uppercase, lowercase, number, and special character");
    }

    if (form.confirmPassword.trim() === "") missing.push("confirm password");
    else if (form.password !== form.confirmPassword) missing.push("make sure passwords match");

    if (missing.length > 0) {
      setError(`Please ${missing.join(", ")}.`);
      return false;
    }

    setError("");
    return true;
  };

  const validateMyself = async () => {
    if (!validateMainAccountFields()) return;

    const missing = [];
    if (form.birthDate.trim() === "") missing.push("enter date of birth");
    else if (!isValidDate(form.birthDate)) missing.push("enter date of birth in mm/dd/yyyy format");
    if (form.gender.trim() === "") missing.push("select gender");

    if (form.philHealth) {
      const digits = form.philHealthNumber.replace(/[^0-9]/g, "");
      if (digits.length !== 12) missing.push("enter a valid 12-digit PhilHealth number");
    }

    if (missing.length > 0) {
      setError(`Please ${missing.join(", ")}.`);
      return;
    }

    setError("");

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email.toLowerCase().trim(),
      phone: '+63' + form.mobile.substring(1),
      password: form.password,
      dob: form.birthDate,
      gender: form.gender,
      accountType: 'personal',
      philHealthNumber: form.philHealth ? form.philHealthNumber : '',
      address: form.deliveryAddress || 'Not provided',
      emergencyName: form.emergencyContact || 'Not provided',
      bloodType: 'Not provided',
      allergies: 'None',
      emergencyPhone: 'Not provided',
      emergencyEmail: 'Not provided',
      emergencyRelationship: 'Not provided',
    };

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setError(`Server returned an invalid response: ${responseText}`);
        Alert.alert('Creation Failed', `Server returned an invalid response.`);
        return;
      }

      if (response.ok) {
        Alert.alert("Success", "Account created successfully! Please log in.", [{ text: "OK", onPress: onLogin }]);
      } else {
        const errorMessage = data.error || data.message || 'An unknown error occurred during account creation.';
        setError(errorMessage);
        Alert.alert('Creation Failed', errorMessage);
      }
    } catch (error) {
      console.error('Account Creation Connection Error:', error);
      const connErrorMsg = `Could not connect to the server. Please check your IP address in config.js and ensure your Sails server is running.`;
      setError(connErrorMsg);
      Alert.alert('Connection Error', connErrorMsg);
    }
  };

  const validateGuardianStep1 = () => {
    if (!validateMainAccountFields()) return;

    const missing = [];
    if (form.birthDate.trim() === "") missing.push("enter your date of birth");
    else if (!isValidDate(form.birthDate)) missing.push("enter your date of birth in mm/dd/yyyy format");
    if (form.gender.trim() === "") missing.push("select your gender");

    if (missing.length > 0) {
      setError(`Please ${missing.join(", ")}.`);
      return;
    }

    setError("");
    setGuardianStep(2);
  };

  const validateGuardianStep2 = async () => {
    const missing = [];

    children.forEach((child, index) => {
      const childLabel = `Child ${index + 1}`;
      if (child.firstName.trim() === "") missing.push(`enter ${childLabel} first name`);
      if (child.lastName.trim() === "") missing.push(`enter ${childLabel} last name`);
      if (child.birthDate.trim() === "") missing.push(`enter ${childLabel} date of birth`);
      else if (!isValidDate(child.birthDate)) missing.push(`enter ${childLabel} date of birth in mm/dd/yyyy format`);
      if (child.gender.trim() === "") missing.push(`select ${childLabel} gender`);

      if (child.philHealth) {
        const digits = child.philHealthNumber.replace(/[^0-9]/g, "");
        if (digits.length !== 12) missing.push(`enter a valid 12-digit PhilHealth number for ${childLabel}`);
      }
    });

    if (missing.length > 0) {
      setError(`Please ${missing.join(", ")}.`);
      return;
    }

    setError("");

    const payload = {
      // Guardian info
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email.toLowerCase().trim(),
      phone: '+63' + form.mobile.substring(1),
      password: form.password,
      dob: form.birthDate,
      gender: form.gender,
      accountType: 'guardian',
      address: 'Not provided',
      emergencyName: 'Not provided',
      bloodType: 'Not provided',
      allergies: 'None',
      emergencyPhone: 'Not provided',
      emergencyEmail: 'Not provided',
      emergencyRelationship: 'Not provided',
      // Children info
      dependents: children.map(child => ({
        firstName: child.firstName,
        lastName: child.lastName,
        dob: child.birthDate,
        gender: child.gender,
        relationship: 'Child',
        philHealthNumber: child.philHealth ? child.philHealthNumber : '',
      }))
    };

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setError(`Server returned an invalid response: ${responseText}`);
        Alert.alert('Creation Failed', `Server returned an invalid response.`);
        return;
      }

      if (response.ok) {
        Alert.alert("Success", "Account created successfully! Please log in.", [{ text: "OK", onPress: onLogin }]);
      } else {
        const errorMessage = data.error || data.message || 'An unknown error occurred during account creation.';
        setError(errorMessage);
        Alert.alert('Creation Failed', errorMessage);
      }
    } catch (error) {
      console.error('Account Creation Connection Error:', error);
      const connErrorMsg = `Could not connect to the server. Please check your IP address in config.js and ensure your Sails server is running.`;
      setError(connErrorMsg);
      Alert.alert('Connection Error', connErrorMsg);
    }
  };

  const validateFamilyStep1 = () => {
    if (!validateMainAccountFields()) return;

    const missing = [];
    if (form.birthDate.trim() === "") missing.push("enter your date of birth");
    else if (!isValidDate(form.birthDate)) missing.push("enter your date of birth in mm/dd/yyyy format");
    if (form.gender.trim() === "") missing.push("select your gender");

    if (missing.length > 0) {
      setError(`Please ${missing.join(", ")}.`);
      return;
    }

    setError("");
    setFamilyStep(2);
  };

  const validateFamilyStep2 = async () => {
    const missing = [];

    familyMembers.forEach((member, index) => {
      const label = `Family Member ${index + 1}`;

      if (member.firstName.trim() === "") missing.push(`enter ${label} first name`);
      if (member.lastName.trim() === "") missing.push(`enter ${label} last name`);
      if (member.birthDate.trim() === "") missing.push(`enter ${label} date of birth`);
      else if (!isValidDate(member.birthDate)) missing.push(`enter ${label} date of birth in mm/dd/yyyy format`);
      if (member.gender.trim() === "") missing.push(`select ${label} gender`);
      if (member.relationship.trim() === "") missing.push(`select ${label} relationship`);

      if (member.philHealth) {
        const digits = member.philHealthNumber.replace(/[^0-9]/g, "");
        if (digits.length !== 12) missing.push(`enter a valid 12-digit PhilHealth number for ${label}`);
      }
    });

    if (missing.length > 0) {
      setError(`Please ${missing.join(", ")}.`);
      return;
    }

    setError("");

    const payload = {
      // Primary account holder info
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email.toLowerCase().trim(),
      phone: '+63' + form.mobile.substring(1),
      password: form.password,
      dob: form.birthDate,
      gender: form.gender,
      accountType: 'family',
      address: 'Not provided',
      emergencyName: 'Not provided',
      bloodType: 'Not provided',
      allergies: 'None',
      emergencyPhone: 'Not provided',
      emergencyEmail: 'Not provided',
      emergencyRelationship: 'Not provided',
      // Family members info
      dependents: familyMembers.map(member => ({
        firstName: member.firstName,
        lastName: member.lastName,
        dob: member.birthDate,
        gender: member.gender,
        relationship: member.relationship,
        philHealthNumber: member.philHealth ? member.philHealthNumber : '',
      }))
    };

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setError(`Server returned an invalid response: ${responseText}`);
        Alert.alert('Creation Failed', `Server returned an invalid response.`);
        return;
      }

      if (response.ok) {
        Alert.alert("Success", "Account created successfully! Please log in.", [{ text: "OK", onPress: onLogin }]);
      } else {
        const errorMessage = data.error || data.message || 'An unknown error occurred during account creation.';
        setError(errorMessage);
        Alert.alert('Creation Failed', errorMessage);
      }
    } catch (error) {
      console.error('Account Creation Connection Error:', error);
      const connErrorMsg = `Could not connect to the server. Please check your IP address in config.js and ensure your Sails server is running.`;
      setError(connErrorMsg);
      Alert.alert('Connection Error', connErrorMsg);
    }
  };


  const goBackToChoice = () => {
    setError("");
    setScreen("choose");
    setGuardianStep(1);
    setFamilyStep(1);
    setForm({ ...initialFormState });
    setChildren([{ ...emptyChild }]);
    setFamilyMembers([{ ...emptyFamilyMember }]);
  };

  if (screen === "myself") {
    return (
      <SafeAreaView style={styles.reg_mainContainer}>
        <TopBar titleAction="Back" onAction={goBackToChoice} color="#2563EB" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.reg_formHeader}>
            <Text style={styles.reg_formHeaderTitle}>Create Your Account</Text>
            <Text style={styles.reg_formHeaderSubtitle}>Join OkieDoc+ and access quality healthcare from home</Text>
          </View>

          <View style={styles.reg_formCard}>
            <Text style={styles.reg_formTitle}>Personal Information</Text>

            <AccountFields
              form={form}
              updateForm={updateForm}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordChecks={passwordChecks}
              passwordScore={passwordScore}
              passwordStrengthText={passwordStrengthText}
              passwordStrengthColor={passwordStrengthColor}
            />

            <View style={styles.reg_divider} />

            <Text style={styles.reg_inputLabel}>Date of Birth <Text style={styles.reg_required}>*</Text></Text>
            <View style={styles.reg_inputBox}>
              <TextInput
                style={styles.reg_input}
                placeholder="mm/dd/yyyy"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                maxLength={10}
                value={form.birthDate}
                onChangeText={(text) => updateForm("birthDate", formatDate(text))}
              />
              <Feather name="calendar" size={16} color="#CBD5E1" />
            </View>

            <Text style={styles.reg_inputLabel}>Gender <Text style={styles.reg_required}>*</Text></Text>
            <Dropdown
              value={form.gender}
              placeholder="Select gender"
              open={showGenderDropdown}
              setOpen={setShowGenderDropdown}
              options={["Male", "Female", "Prefer not to say"]}
              onSelect={(item) => updateForm("gender", item)}
            />

            <View style={styles.reg_divider} />

            <PhilHealthBox
              checked={form.philHealth}
              onPress={() => updateForm("philHealth", !form.philHealth)}
              value={form.philHealthNumber}
              onChangeText={(text) => updateForm("philHealthNumber", formatPhilHealth(text))}
            />

            <OptionalField
              label="+ Add Delivery Address (Optional)"
              value={form.deliveryAddress}
              placeholder="Enter delivery address"
              onChangeText={(text) => updateForm("deliveryAddress", text)}
            />

            <OptionalField
              label="+ Add Emergency Contact (Optional)"
              value={form.emergencyContact}
              placeholder="Enter emergency contact"
              onChangeText={(text) => updateForm("emergencyContact", text)}
            />

            {error !== "" && <Text style={styles.reg_errorText}>{error}</Text>}

            <TouchableOpacity style={styles.reg_primaryButton} onPress={validateMyself}>
              <Text style={styles.reg_primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <LoginRow onLogin={onLogin} />
          </View>

          <SecureText />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "child") {
    return (
      <SafeAreaView style={[styles.reg_mainContainer, { backgroundColor: "#F8FFFB" }]}>
        <TopBar titleAction="Back" onAction={goBackToChoice} color="#2563EB" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <RegistrationHero
            icon="heart"
            color="#16A34A"
            bgColor="#DCFCE7"
            title="Guardian Registration"
            subtitle="Register as a guardian for your child below 18 years old"
            currentStep={guardianStep}
            activeColor="#16A34A"
          />

          {guardianStep === 1 && (
            <View style={styles.reg_formCard}>
              <Text style={styles.reg_formTitle}>Guardian Information</Text>

              <AccountFields
                form={form}
                updateForm={updateForm}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                passwordChecks={passwordChecks}
                passwordScore={passwordScore}
                passwordStrengthText={passwordStrengthText}
                passwordStrengthColor={passwordStrengthColor}
              />

              <View style={styles.reg_divider} />

              <Text style={styles.reg_inputLabel}>Date of Birth <Text style={styles.reg_required}>*</Text></Text>
              <View style={styles.reg_inputBox}>
                <TextInput
                  style={styles.reg_input}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={form.birthDate}
                  onChangeText={(text) => updateForm("birthDate", formatDate(text))}
                />
                <Feather name="calendar" size={16} color="#CBD5E1" />
              </View>

              <Text style={styles.reg_inputLabel}>Gender <Text style={styles.reg_required}>*</Text></Text>
              <Dropdown
                value={form.gender}
                placeholder="Select gender"
                open={showGenderDropdown}
                setOpen={setShowGenderDropdown}
                options={["Male", "Female", "Prefer not to say"]}
                onSelect={(item) => updateForm("gender", item)}
              />

              {error !== "" && <Text style={styles.reg_errorText}>{error}</Text>}

              <TouchableOpacity style={[styles.reg_primaryButton, { backgroundColor: "#16A34A" }]} onPress={validateGuardianStep1}>
                <Text style={styles.reg_primaryButtonText}>Continue to Child Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {guardianStep === 2 && (
            <View style={styles.reg_formCard}>
              <Text style={styles.reg_formTitle}>Child Information</Text>

              <View style={styles.reg_childInfoNotice}>
                <Text style={styles.reg_childInfoNoticeText}>
                  This account will be managed by the parent/guardian. You can add multiple children to this account.
                </Text>
              </View>

              {children.map((child, index) => (
                <ChildCard
                  key={index}
                  child={child}
                  index={index}
                  canRemove={children.length > 1}
                  onRemove={() => {
                    setChildren((prev) => prev.filter((_, i) => i !== index));
                    setError("");
                  }}
                  updateChild={updateChild}
                  formatDate={formatDate}
                  formatPhilHealth={formatPhilHealth}
                />
              ))}

              <TouchableOpacity
                style={styles.reg_addChildButton}
                onPress={() => {
                  setChildren((prev) => [...prev, { ...emptyChild }]);
                  setError("");
                }}
              >
                <Feather name="plus" size={16} color="#16A34A" />
                <Text style={styles.reg_addChildText}>Add Another Child</Text>
              </TouchableOpacity>

              {error !== "" && <Text style={styles.reg_errorText}>{error}</Text>}

              <View style={styles.reg_twoButtons}>
                <TouchableOpacity style={styles.reg_secondaryButton} onPress={() => setGuardianStep(1)}>
                  <Text style={styles.reg_secondaryButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.reg_primaryButton, styles.reg_flexButton, { backgroundColor: "#16A34A" }]} onPress={validateGuardianStep2}>
                  <Text style={styles.reg_primaryButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <SecureText />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "family") {
    return (
      <SafeAreaView style={[styles.reg_mainContainer, { backgroundColor: "#FCF7FF" }]}>
        <TopBar titleAction="Back" onAction={goBackToChoice} color="#2563EB" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <RegistrationHero
            icon="users"
            color="#9333EA"
            bgColor="#F3E8FF"
            title="Family Account Registration"
            subtitle="Manage healthcare for your entire family in one account"
            currentStep={familyStep}
            activeColor="#9333EA"
          />

          {familyStep === 1 && (
            <View style={styles.reg_formCard}>
              <Text style={styles.reg_formTitle}>Primary Account Holder</Text>

              <AccountFields
                form={form}
                updateForm={updateForm}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                passwordChecks={passwordChecks}
                passwordScore={passwordScore}
                passwordStrengthText={passwordStrengthText}
                passwordStrengthColor={passwordStrengthColor}
              />

              <View style={styles.reg_divider} />

              <Text style={styles.reg_inputLabel}>Date of Birth <Text style={styles.reg_required}>*</Text></Text>
              <View style={styles.reg_inputBox}>
                <TextInput
                  style={styles.reg_input}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={form.birthDate}
                  onChangeText={(text) => updateForm("birthDate", formatDate(text))}
                />
                <Feather name="calendar" size={16} color="#CBD5E1" />
              </View>

              <Text style={styles.reg_inputLabel}>Gender <Text style={styles.reg_required}>*</Text></Text>
              <Dropdown
                value={form.gender}
                placeholder="Select gender"
                open={showGenderDropdown}
                setOpen={setShowGenderDropdown}
                options={["Male", "Female", "Prefer not to say"]}
                onSelect={(item) => updateForm("gender", item)}
              />

              {error !== "" && <Text style={styles.reg_errorText}>{error}</Text>}

              <TouchableOpacity style={[styles.reg_primaryButton, { backgroundColor: "#9333EA" }]} onPress={validateFamilyStep1}>
                <Text style={styles.reg_primaryButtonText}>Continue to Add Family Members</Text>
              </TouchableOpacity>
            </View>
          )}

          {familyStep === 2 && (
            <View style={styles.reg_formCard}>
              <Text style={styles.reg_formTitle}>Family Members</Text>

              <View style={styles.reg_familyInfoNotice}>
                <Text style={styles.reg_childInfoNoticeText}>
                  Add family members who will share this account. You can easily switch between profiles during consultations.
                </Text>
              </View>

              {familyMembers.map((member, index) => (
                <FamilyMemberCard
                  key={index}
                  member={member}
                  index={index}
                  canRemove={familyMembers.length > 1}
                  onRemove={() => {
                    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
                    setError("");
                  }}
                  updateFamilyMember={updateFamilyMember}
                  formatDate={formatDate}
                  formatPhilHealth={formatPhilHealth}
                />
              ))}

              <TouchableOpacity
                style={styles.reg_addFamilyButton}
                onPress={() => {
                  setFamilyMembers((prev) => [...prev, { ...emptyFamilyMember }]);
                  setError("");
                }}
              >
                <Feather name="plus" size={16} color="#9333EA" />
                <Text style={styles.reg_addFamilyText}>Add Family Member</Text>
              </TouchableOpacity>

              {error !== "" && <Text style={styles.reg_errorText}>{error}</Text>}

              <View style={styles.reg_twoButtons}>
                <TouchableOpacity style={styles.reg_secondaryButton} onPress={() => setFamilyStep(1)}>
                  <Text style={styles.reg_secondaryButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.reg_primaryButton, styles.reg_flexButton, { backgroundColor: "#9333EA" }]} onPress={validateFamilyStep2}>
                  <Text style={styles.reg_primaryButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <SecureText />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.reg_mainContainer}>
      <TopBar titleAction="Back" onAction={onLogin} color="#2563EB" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.reg_headerSection}>
          <Text style={styles.reg_title}>Who is this account for?</Text>
          <Text style={styles.reg_subtitle}>Choose the option that best describes your situation</Text>
        </View>

        <AccountTypeCard icon="user" color="#2563EB" title="Myself (18+)" subtitle="Create a personal account for yourself" onPress={() => setScreen("myself")} />
        <AccountTypeCard icon="heart" color="#16A34A" title="My Child (Below 18)" subtitle="Register as a guardian for your child" onPress={() => setScreen("child")} />
        <AccountTypeCard icon="users" color="#9333EA" title="A Family Member" subtitle="Manage multiple family members in one account" onPress={() => setScreen("family")} />

        <View style={styles.reg_infoCard}>
          <View style={styles.reg_infoIcon}>
            <FontAwesome5 name="stethoscope" size={16} color="#fff" solid />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.reg_infoTitle}>Why we ask this?</Text>
            <Text style={styles.reg_infoText}>
              We need to ensure proper consent and guardianship for patients below 18 years old. For family accounts, you can manage multiple members and easily switch between profiles during consultations.
            </Text>
          </View>
        </View>

        <LoginRow onLogin={onLogin} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({ titleAction, onAction, color }) {
  return (
    <View style={styles.reg_topBar}>
      <View style={styles.reg_logoContainer}>
        <View style={[styles.reg_logoIcon, { backgroundColor: color || "#2563EB" }]}>
          <FontAwesome5 name="stethoscope" size={16} color="#fff" solid />
        </View>
        <Text style={styles.reg_logoText}>OkieDoc<Text style={styles.reg_logoPlus}>+</Text></Text>
      </View>

      <TouchableOpacity onPress={onAction}>
        <Text style={styles.reg_backHomeTopText}>{titleAction}</Text>
      </TouchableOpacity>
    </View>
  );
}

function AccountTypeCard({ icon, color, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.reg_optionCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.reg_optionIconBox, { backgroundColor: color }]}>
        <Feather name={icon} size={34} color="#fff" />
      </View>
      <Text style={styles.reg_optionTitle}>{title}</Text>
      <Text style={styles.reg_optionSubtitle}>{subtitle}</Text>
      <Text style={styles.reg_continueText}>Continue</Text>
    </TouchableOpacity>
  );
}

function RegistrationHero({ icon, color, bgColor, title, subtitle, currentStep, activeColor }) {
  return (
    <View style={styles.reg_registrationHero}>
      <View style={[styles.reg_heroIconBox, { backgroundColor: bgColor }]}>
        <Feather name={icon} size={32} color={color} />
      </View>

      <Text style={styles.reg_registrationTitle}>{title}</Text>
      <Text style={styles.reg_registrationSubtitle}>{subtitle}</Text>

      <View style={styles.reg_stepRow}>
        <View style={[styles.reg_stepCircle, { backgroundColor: activeColor }]}>
          {currentStep === 2 ? (
            <Feather name="check-circle" size={20} color="#fff" />
          ) : (
            <Text style={styles.reg_stepCircleText}>1</Text>
          )}
        </View>
        <View style={[styles.reg_stepLine, currentStep === 2 && { backgroundColor: activeColor }]} />
        <View style={[styles.reg_stepCircle, currentStep === 2 ? { backgroundColor: activeColor } : { backgroundColor: "#E5E7EB" }]}>
          <Text style={[styles.reg_stepCircleText, currentStep !== 2 && { color: "#475569" }]}>2</Text>
        </View>
      </View>
    </View>
  );
}

function AccountFields({
  form,
  updateForm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordChecks,
  passwordScore,
  passwordStrengthText,
  passwordStrengthColor,
}) {
  const confirmStatus =
    form.confirmPassword === ""
      ? ""
      : form.password === form.confirmPassword
      ? "Passwords match"
      : "Passwords do not match";

  return (
    <>
      <Text style={styles.reg_inputLabel}>First Name <Text style={styles.reg_required}>*</Text></Text>
      <InputBox placeholder="Juan" value={form.firstName} onChangeText={(text) => updateForm("firstName", text)} />

      <Text style={styles.reg_inputLabel}>Last Name <Text style={styles.reg_required}>*</Text></Text>
      <InputBox placeholder="Dela Cruz" value={form.lastName} onChangeText={(text) => updateForm("lastName", text)} />

      <View style={styles.reg_divider} />

      <Text style={styles.reg_inputLabel}>Email Address <Text style={styles.reg_required}>*</Text></Text>
      <InputBox
        placeholder="juan.delacruz@gmail.com"
        value={form.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => updateForm("email", text.replace(/\s/g, ""))}
      />

      <Text style={styles.reg_inputLabel}>Mobile Number <Text style={styles.reg_required}>*</Text></Text>
      <InputBox
        placeholder="09123456789"
        value={form.mobile}
        keyboardType="number-pad"
        maxLength={11}
        onChangeText={(text) => updateForm("mobile", text.replace(/[^0-9]/g, "").slice(0, 11))}
      />

      <View style={styles.reg_divider} />

      <Text style={styles.reg_inputLabel}>Password <Text style={styles.reg_required}>*</Text></Text>
      <PasswordBox
        placeholder="Enter a strong password"
        value={form.password}
        secure={!showPassword}
        onToggle={() => setShowPassword(!showPassword)}
        onChangeText={(text) => updateForm("password", text)}
      />

      {form.password !== "" && (
        <View style={styles.reg_passwordStrengthBox}>
          <View style={styles.reg_strengthHeaderRow}>
            <Text style={styles.reg_strengthLabel}>Password strength:</Text>
            <Text style={[styles.reg_strengthText, { color: passwordStrengthColor }]}>{passwordStrengthText}</Text>
          </View>

          <View style={styles.reg_segmentRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <View
                key={num}
                style={[
                  styles.reg_strengthSegment,
                  num <= passwordScore && { backgroundColor: passwordStrengthColor },
                ]}
              />
            ))}
          </View>

          <PasswordCheck passed={passwordChecks.length} text="At least 8 characters" />
          <PasswordCheck passed={passwordChecks.upper} text="Contains uppercase letter" />
          <PasswordCheck passed={passwordChecks.lower} text="Contains lowercase letter" />
          <PasswordCheck passed={passwordChecks.number} text="Contains number" />
          <PasswordCheck passed={passwordChecks.special} text="Contains special character" />
        </View>
      )}

      <Text style={styles.reg_inputLabel}>Confirm Password <Text style={styles.reg_required}>*</Text></Text>
      <PasswordBox
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        secure={!showConfirmPassword}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        onChangeText={(text) => updateForm("confirmPassword", text)}
      />

      {confirmStatus !== "" && (
        <Text
          style={[
            styles.reg_confirmStatusText,
            form.password === form.confirmPassword ? styles.reg_matchText : styles.reg_noMatchText,
          ]}
        >
          {form.password === form.confirmPassword ? "✓ " : "✕ "}
          {confirmStatus}
        </Text>
      )}
    </>
  );
}

function PasswordCheck({ passed, text }) {
  return (
    <Text style={[styles.reg_passwordCheck, passed ? styles.reg_passText : styles.reg_failText]}>
      {passed ? "✓" : "•"} {text}
    </Text>
  );
}

function InputBox({ placeholder, value, onChangeText, keyboardType, autoCapitalize, maxLength }) {
  return (
    <View style={styles.reg_inputBox}>
      <TextInput
        style={styles.reg_input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
    </View>
  );
}

function PasswordBox({ placeholder, value, onChangeText, secure, onToggle }) {
  return (
    <View style={styles.reg_inputBox}>
      <TextInput
        style={styles.reg_input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
      />
      <TouchableOpacity onPress={onToggle}>
        <Feather name={secure ? "eye" : "eye-off"} size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
}

function Dropdown({ value, placeholder, open, setOpen, options, onSelect }) {
  return (
    <>
      <TouchableOpacity style={styles.reg_inputBox} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={[styles.reg_dropdownText, !value && { color: "#64748B" }]}>{value || placeholder}</Text>
        <Feather name="chevron-down" size={18} color="#CBD5E1" />
      </TouchableOpacity>

      {open && (
        <View style={styles.reg_dropdownList}>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.reg_dropdownItem}
              onPress={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              <Text style={styles.reg_dropdownItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

function PhilHealthBox({ checked, onPress, value, onChangeText }) {
  return (
    <>
      <TouchableOpacity style={styles.reg_philHealthBox} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.reg_checkbox, checked && styles.reg_checkedBox]}>
          {checked && <Feather name="check" size={13} color="#fff" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reg_philHealthTitle}>I am a PhilHealth Member</Text>
          <Text style={styles.reg_philHealthText}>PhilHealth coverage helps reduce your consultation costs</Text>
        </View>
      </TouchableOpacity>

      {checked && (
        <>
          <Text style={styles.reg_inputLabel}>PhilHealth Number <Text style={styles.reg_required}>*</Text></Text>
          <InputBox
            placeholder="12-345678901-2"
            value={value}
            keyboardType="number-pad"
            maxLength={14}
            onChangeText={onChangeText}
          />
          <Text style={styles.reg_fieldHint}>12-digit PhilHealth identification number</Text>
        </>
      )}
    </>
  );
}

function ChildCard({ child, index, canRemove, onRemove, updateChild, formatDate, formatPhilHealth }) {
  const [genderOpen, setGenderOpen] = useState(false);

  return (
    <View style={styles.reg_childCard}>
      <View style={styles.reg_childCardHeader}>
        <Text style={styles.reg_childTitle}>Child {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Feather name="x" size={22} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.reg_inputLabel}>First Name <Text style={styles.reg_required}>*</Text></Text>
      <InputBox placeholder="Maria" value={child.firstName} onChangeText={(text) => updateChild(index, "firstName", text)} />

      <Text style={styles.reg_inputLabel}>Last Name <Text style={styles.reg_required}>*</Text></Text>
      <InputBox placeholder="Dela Cruz" value={child.lastName} onChangeText={(text) => updateChild(index, "lastName", text)} />

      <Text style={styles.reg_inputLabel}>Date of Birth <Text style={styles.reg_required}>*</Text></Text>
      <View style={styles.reg_inputBox}>
        <TextInput
          style={styles.reg_input}
          placeholder="mm/dd/yyyy"
          placeholderTextColor="#64748B"
          keyboardType="number-pad"
          maxLength={10}
          value={child.birthDate}
          onChangeText={(text) => updateChild(index, "birthDate", formatDate(text))}
        />
        <Feather name="calendar" size={16} color="#CBD5E1" />
      </View>

      <Text style={styles.reg_inputLabel}>Gender <Text style={styles.reg_required}>*</Text></Text>
      <Dropdown
        value={child.gender}
        placeholder="Select gender"
        open={genderOpen}
        setOpen={setGenderOpen}
        options={["Male", "Female", "Prefer not to say"]}
        onSelect={(item) => updateChild(index, "gender", item)}
      />

      <TouchableOpacity
        style={styles.reg_childPhilHealthBox}
        onPress={() => updateChild(index, "philHealth", !child.philHealth)}
        activeOpacity={0.8}
      >
        <View style={[styles.reg_checkbox, child.philHealth && styles.reg_checkedBox]}>
          {child.philHealth && <Feather name="check" size={13} color="#fff" />}
        </View>
        <Text style={styles.reg_philHealthTitle}>PhilHealth Member</Text>
      </TouchableOpacity>

      {child.philHealth && (
        <InputBox
          placeholder="12-345678901-2"
          value={child.philHealthNumber}
          keyboardType="number-pad"
          maxLength={14}
          onChangeText={(text) => updateChild(index, "philHealthNumber", formatPhilHealth(text))}
        />
      )}
    </View>
  );
}

function FamilyMemberCard({
  member,
  index,
  canRemove,
  onRemove,
  updateFamilyMember,
  formatDate,
  formatPhilHealth,
}) {
  const [genderOpen, setGenderOpen] = useState(false);
  const [relationshipOpen, setRelationshipOpen] = useState(false);

  return (
    <View style={styles.reg_childCard}>
      <View style={styles.reg_childCardHeader}>
        <Text style={styles.reg_childTitle}>Family Member {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Feather name="x" size={22} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.reg_inputLabel}>First Name <Text style={styles.reg_required}>*</Text></Text>
      <InputBox
        placeholder="Maria"
        value={member.firstName}
        onChangeText={(text) => updateFamilyMember(index, "firstName", text)}
      />

      <Text style={styles.reg_inputLabel}>Last Name <Text style={styles.reg_required}>*</Text></Text>
      <InputBox
        placeholder="Dela Cruz"
        value={member.lastName}
        onChangeText={(text) => updateFamilyMember(index, "lastName", text)}
      />

      <Text style={styles.reg_inputLabel}>Date of Birth <Text style={styles.reg_required}>*</Text></Text>
      <View style={styles.reg_inputBox}>
        <TextInput
          style={styles.reg_input}
          placeholder="mm/dd/yyyy"
          placeholderTextColor="#64748B"
          keyboardType="number-pad"
          maxLength={10}
          value={member.birthDate}
          onChangeText={(text) => updateFamilyMember(index, "birthDate", formatDate(text))}
        />
        <Feather name="calendar" size={16} color="#CBD5E1" />
      </View>

      <Text style={styles.reg_inputLabel}>Gender <Text style={styles.reg_required}>*</Text></Text>
      <Dropdown
        value={member.gender}
        placeholder="Select gender"
        open={genderOpen}
        setOpen={setGenderOpen}
        options={["Male", "Female", "Prefer not to say"]}
        onSelect={(item) => updateFamilyMember(index, "gender", item)}
      />

      <Text style={styles.reg_inputLabel}>Relationship <Text style={styles.reg_required}>*</Text></Text>
      <Dropdown
        value={member.relationship}
        placeholder="Select relationship"
        open={relationshipOpen}
        setOpen={setRelationshipOpen}
        options={["Spouse", "Child", "Parent", "Sibling", "Grandparent", "Other"]}
        onSelect={(item) => updateFamilyMember(index, "relationship", item)}
      />

      <TouchableOpacity
        style={styles.reg_childPhilHealthBox}
        onPress={() => updateFamilyMember(index, "philHealth", !member.philHealth)}
        activeOpacity={0.8}
      >
        <View style={[styles.reg_checkbox, member.philHealth && styles.reg_checkedBox]}>
          {member.philHealth && <Feather name="check" size={13} color="#fff" />}
        </View>
        <Text style={styles.reg_philHealthTitle}>PhilHealth Member</Text>
      </TouchableOpacity>

      {member.philHealth && (
        <InputBox
          placeholder="12-345678901-2"
          value={member.philHealthNumber}
          keyboardType="number-pad"
          maxLength={14}
          onChangeText={(text) =>
            updateFamilyMember(index, "philHealthNumber", formatPhilHealth(text))
          }
        />
      )}
    </View>
  );
}

function OptionalField({ label, value, placeholder, onChangeText }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.reg_optionalWrapper}>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text style={styles.reg_optionalLabel}>{label}</Text>
      </TouchableOpacity>

      {open && <InputBox placeholder={placeholder} value={value} onChangeText={onChangeText} />}
    </View>
  );
}

function LoginRow({ onLogin }) {
  return (
    <View style={styles.reg_bottomLoginRow}>
      <Text style={styles.reg_loginPrompt}>Already have an account?</Text>
      <TouchableOpacity onPress={onLogin}>
        <Text style={styles.reg_loginText}> Login</Text>
      </TouchableOpacity>
    </View>
  );
}

function SecureText() {
  return (
    <View style={styles.reg_secureRow}>
      <Text style={styles.reg_secureText}>🔒 Your information is secure and encrypted</Text>
    </View>
  );
}

export function EditProfileScreen({ navigation, route }) {
  const scrollViewRef = useRef(null);
  const isSaving = useRef(false);
  const currentProfile = route?.params?.currentProfile || {};

  const getInitialValue = (value) => (value && value !== 'Not provided' ? value : '');

  const [profileImage, setProfileImage] = useState(currentProfile?.profileImage || null);
  const [gender, setGender] = useState(currentProfile.gender !== 'Not provided' ? currentProfile.gender : 'Female');
  const [bloodType, setBloodType] = useState(currentProfile.bloodType !== 'Not provided' ? currentProfile.bloodType : 'O+');
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const relationshipOptions = ['Mother', 'Father', 'Spouse', 'Other'];
  const initialRel = currentProfile.emergencyRelationship !== 'Not provided' ? currentProfile.emergencyRelationship : 'Spouse';
  const [emergencyRelationship, setEmergencyRelationship] = useState(relationshipOptions.includes(initialRel) ? initialRel : 'Other');
  const [otherRelationship, setOtherRelationship] = useState(relationshipOptions.includes(initialRel) ? '' : initialRel);
  const [emergencyEmail, setEmergencyEmail] = useState(getInitialValue(currentProfile.emergencyEmail));
  const [phone, setPhone] = useState(formatPhoneNumber(getInitialValue(currentProfile.phone)));
  const [firstName, setFirstName] = useState(getInitialValue(currentProfile.firstName));
  const [lastName, setLastName] = useState(getInitialValue(currentProfile.lastName));
  const [address, setAddress] = useState(getInitialValue(currentProfile.address));
  const [email, setEmail] = useState(getInitialValue(currentProfile.email));
  const [allergies, setAllergies] = useState(getInitialValue(currentProfile.allergies));
  const [emergencyName, setEmergencyName] = useState(getInitialValue(currentProfile.emergencyName));
  const [emergencyPhone, setEmergencyPhone] = useState(formatPhoneNumber(getInitialValue(currentProfile.emergencyPhone)));
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email === '' || emailRegex.test(email.trim());
  const isEmergencyEmailValid = emergencyEmail === '' || emailRegex.test(emergencyEmail.trim());
  const isPhoneValid = phone === '' || phone.replace(/\D/g, '').length === 12;
  const isEmergencyPhoneValid = emergencyPhone === '' || emergencyPhone.replace(/\D/g, '').length === 12;
  const passwordsMatch = password === confirmPassword;

  const canSubmit = password === '' || (passwordsMatch && currentPassword !== '');

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleUpdateProfile = async () => {
    const payload = {
      firstName: firstName.trim() || 'Not provided',
      lastName: lastName.trim() || 'Not provided',
      gender,
      email: email.trim() || 'Not provided',
      phone: phone.trim() || 'Not provided',
      address: address.trim() || 'Not provided',
      bloodType: bloodType || 'Not provided',
      allergies: allergies.trim() || 'None',
      emergencyName: emergencyName.trim() || 'Not provided',
      emergencyPhone: emergencyPhone.trim() || 'Not provided',
      emergencyEmail: emergencyEmail.trim() || 'Not provided',
      emergencyRelationship: emergencyRelationship === 'Other' ? (otherRelationship.trim() || 'Not provided') : emergencyRelationship,
      profileImage
    };

    if (password !== '') {
      payload.password = password;
      payload.currentPassword = currentPassword;
    }

    try {
      if (currentProfile.id) {
        const response = await fetch(`${API_URL}/user/${currentProfile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const updatedData = await response.json();
          setCurrentUser(updatedData);
        } else {
          Alert.alert('Update Failed', 'Could not save changes to the database.');
          return;
        }
      } else {
        // Fallback for mock data without an ID
        setCurrentUser({ ...currentProfile, ...payload });
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      isSaving.current = true;
      navigation.navigate('Profile', { updatedProfile: { ...payload, password: undefined, currentPassword: undefined } });
    } catch (error) {
      console.error('Update Connection Error:', error);
      Alert.alert('Connection Error', 'Could not connect to the server to update profile.');
    }
  };

  const initials = `${(firstName || 'O').charAt(0)}${(lastName || '+').charAt(0)}`.toUpperCase();

  return (
    <Screen scrollViewRef={scrollViewRef} title="Edit Profile" subtitle="Update your personal details" icon="create-outline" navigation={navigation}>
      <Card>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={handleImagePick} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {profileImage ? <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900' }}>{initials}</Text>}
          </TouchableOpacity>
          <Text style={{ color: cyan, fontSize: 12, fontWeight: '700', marginTop: 8 }}>Change Photo</Text>
        </View>

        <View style={styles.inputGroup}><Text style={styles.inputLabel}>First Name *</Text><TextInput style={styles.textInput} value={firstName} onChangeText={setFirstName} placeholder="e.g. Sarah" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Last Name *</Text><TextInput style={styles.textInput} value={lastName} onChangeText={setLastName} placeholder="e.g. Williams" placeholderTextColor="#94A3B8" /></View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Gender *</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Male', 'Female', 'Other'].map(g => (
              <TouchableOpacity key={g} style={{ flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: gender === g ? cyan : '#CBD5E1', backgroundColor: gender === g ? '#E8F6FA' : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }} onPress={() => setGender(g)}>
                <Text style={{ color: gender === g ? cyan : ink, fontWeight: '700', fontSize: 13 }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Address *</Text><TextInput style={styles.textInput} value={address} onChangeText={setAddress} placeholder="e.g. Oklahoma City, OK" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput style={[styles.textInput, !isEmailValid && email.length > 0 && { borderColor: '#EF4444' }]} value={email} onChangeText={setEmail} placeholder="e.g. sarah@example.com" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" />
          {(!isEmailValid && email.length > 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Please enter a valid email address.</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput style={[styles.textInput, !isPhoneValid && phone.length > 0 && { borderColor: '#EF4444' }]} placeholder="e.g. +63 912-345-6789" placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(formatPhoneNumber(t))} maxLength={16} />
          {(!isPhoneValid && phone.length > 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Phone number must be complete.</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Current Password {password.length > 0 ? '*' : '(Required to change password)'}</Text>
          <View style={{ justifyContent: 'center' }}>
            <TextInput style={[styles.textInput, { paddingRight: 40 }, password.length > 0 && currentPassword.length === 0 && { borderColor: '#EF4444' }]} placeholder="Enter current password" placeholderTextColor="#94A3B8" secureTextEntry={!showCurrentPassword} value={currentPassword} onChangeText={setCurrentPassword} />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: 14 }}>
              <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color={muted} />
            </TouchableOpacity>
          </View>
          {(password.length > 0 && currentPassword.length === 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Current password is required.</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password (Optional)</Text>
          <View style={{ justifyContent: 'center' }}>
            <TextInput style={[styles.textInput, { paddingRight: 40 }]} placeholder="Leave blank to keep current password" placeholderTextColor="#94A3B8" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14 }}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={muted} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <View style={{ justifyContent: 'center' }}>
            <TextInput style={[styles.textInput, !passwordsMatch && confirmPassword.length > 0 && { borderColor: '#EF4444' }, { paddingRight: 40 }]} placeholder="Confirm new password" placeholderTextColor="#94A3B8" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 14 }}>
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={muted} />
            </TouchableOpacity>
          </View>
          {(!passwordsMatch && confirmPassword.length > 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Passwords do not match.</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Blood Type *</Text>
          <TouchableOpacity style={[styles.textInput, { justifyContent: 'center' }]} onPress={() => setShowBloodTypeDropdown(!showBloodTypeDropdown)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <Text style={{ flex: 1, color: bloodType ? ink : '#94A3B8' }}>{bloodType || 'Select blood type'}</Text>
              <Ionicons name={showBloodTypeDropdown ? "chevron-up" : "chevron-down"} size={18} color={muted} style={{ position: 'absolute', right: 0 }} />
            </View>
          </TouchableOpacity>
          {showBloodTypeDropdown && (
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 8, marginTop: 8, maxHeight: 160 }}>
              <ScrollView nestedScrollEnabled>
                {bloodTypes.map(type => (
                  <TouchableOpacity key={type} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' }} onPress={() => { setBloodType(type); setShowBloodTypeDropdown(false); }}>
                    <Text style={{ color: ink, fontSize: 14 }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Allergies</Text>
          <TextInput style={[styles.textInput, { height: 'auto', minHeight: 48, paddingTop: 12, paddingBottom: 12 }]} multiline value={allergies} onChangeText={setAllergies} placeholder="e.g. Penicillin, Peanuts" placeholderTextColor="#94A3B8" />
        </View>
        <Text style={[styles.sectionHeader, { marginTop: 8, paddingHorizontal: 0 }]}>Emergency Contact</Text>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Name of Emergency Contact *</Text><TextInput style={styles.textInput} value={emergencyName} onChangeText={setEmergencyName} placeholder="e.g. John Williams" placeholderTextColor="#94A3B8" /></View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Relationship to Patient *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {relationshipOptions.map(r => (
              <TouchableOpacity key={r} style={{ width: '31%', height: 44, borderRadius: 8, borderWidth: 1, borderColor: emergencyRelationship === r ? cyan : '#CBD5E1', backgroundColor: emergencyRelationship === r ? '#E8F6FA' : '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }} onPress={() => setEmergencyRelationship(r)}>
                <Text style={{ color: emergencyRelationship === r ? cyan : ink, fontWeight: '700', fontSize: 12 }} numberOfLines={1} adjustsFontSizeToFit>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {emergencyRelationship === 'Other' && (
            <TextInput 
              style={[styles.textInput, { marginTop: 8 }]} 
              placeholder="Please Specify" 
              placeholderTextColor="#94A3B8" 
              value={otherRelationship} 
              onChangeText={setOtherRelationship} 
            />
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number of Emergency Contact *</Text>
          <TextInput style={[styles.textInput, !isEmergencyPhoneValid && emergencyPhone.length > 0 && { borderColor: '#EF4444' }]} placeholder="e.g. +63 998-765-4321" value={emergencyPhone} onChangeText={(t) => setEmergencyPhone(formatPhoneNumber(t))} placeholderTextColor="#94A3B8" keyboardType="phone-pad" maxLength={16} />
          {(!isEmergencyPhoneValid && emergencyPhone.length > 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Phone number must be complete.</Text>}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email of Emergency Contact *</Text>
          <TextInput style={[styles.textInput, !isEmergencyEmailValid && emergencyEmail.length > 0 && { borderColor: '#EF4444' }]} placeholder="e.g. none@example.com" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" value={emergencyEmail} onChangeText={setEmergencyEmail} />
          {(!isEmergencyEmailValid && emergencyEmail.length > 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Please enter a valid email address.</Text>}
        </View>
        <PrimaryButton 
          label="Save Changes" 
          icon="save-outline" 
          onPress={handleUpdateProfile} 
          color={canSubmit ? cyan : '#CBD5E1'} 
          disabled={!canSubmit} 
        />
      </Card>
    </Screen>
  );
}

export function ProfileScreen({ navigation, route }) {
  const [useBiometrics, setUseBiometrics] = useState(true);
  const [healthJourneyStats, setHealthJourneyStats] = useState({
    appointments: 0,
    prescriptions: 0,
    ptSessions: 0,
  });

  // Use mock data only if no user is logged in
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123';

  const [profileData, setProfileData] = useState({
    id: currentUser?.id,
    firstName: currentUser?.firstName || 'Sarah',
    lastName: currentUser?.lastName || 'Williams',
    gender: currentUser?.gender || 'Female',
    email: currentUser?.email || 'sarah@example.com',
    phone: currentUser?.phone || '+63 912-345-6789',
    address: currentUser?.address || 'Oklahoma City, OK',
    dob: currentUser?.dob || '12/05/1990',
    bloodType: currentUser?.bloodType || 'O+',
    allergies: currentUser?.allergies || 'Penicillin, Peanuts',
    emergencyName: currentUser?.emergencyName || 'John Williams',
    emergencyPhone: currentUser?.emergencyPhone || '+63 998-765-4321',
    emergencyEmail: currentUser?.emergencyEmail || 'john.williams@example.com',
    emergencyRelationship: currentUser?.emergencyRelationship || 'Spouse',
    profileImage: currentUser?.profileImage || null,
    isSubscriber: currentUser?.isSubscriber || (isMockUser ? true : false),
    isVerified: currentUser?.isVerified || (isMockUser ? true : false),
  });

  useEffect(() => {
    if (route?.params?.updatedProfile) {
      setProfileData(prev => ({ ...prev, ...route.params.updatedProfile }));
      navigation.setParams({ updatedProfile: undefined });
    }
  }, [route?.params?.updatedProfile, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUser) {
        setProfileData(prev => ({
          ...prev,
          id: currentUser.id,
          firstName: currentUser.firstName || 'Sarah',
          lastName: currentUser.lastName || 'Williams',
          gender: currentUser.gender || 'Female',
          email: currentUser.email || 'sarah@example.com',
          phone: currentUser.phone || '+63 912-345-6789',
          address: currentUser.address || 'Oklahoma City, OK',
          dob: currentUser.dob || '12/05/1990',
          bloodType: currentUser.bloodType || 'O+',
          allergies: currentUser.allergies || 'Penicillin, Peanuts',
          emergencyName: currentUser.emergencyName || 'John Williams',
          emergencyPhone: currentUser.emergencyPhone || '+63 998-765-4321',
          emergencyEmail: currentUser.emergencyEmail || 'john.williams@example.com',
          emergencyRelationship: currentUser.emergencyRelationship || 'Spouse',
          profileImage: currentUser.profileImage || null,
          isSubscriber: currentUser.isSubscriber || false,
          isVerified: currentUser.isVerified || false,
        }));
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const loadStats = () => {
      if (isMockUser) {
        setHealthJourneyStats({ appointments: 12, prescriptions: 5, ptSessions: 3 });
        return;
      }

      if (currentUser?.id) {
        // Reset stats before fetching
        setHealthJourneyStats({ appointments: 0, prescriptions: 0, ptSessions: 0 });

        // Fetch appointments
        fetch(`${API_URL}/appointment?user=${currentUser.id}`)
          .then(res => res.ok ? res.json() : Promise.resolve([]))
          .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
              const ptSessions = data.filter(appt => appt.type?.toLowerCase().includes('therapy')).length;
              const regularAppointments = data.length - ptSessions;
              setHealthJourneyStats(prev => ({ ...prev, appointments: regularAppointments, ptSessions: ptSessions }));
            }
          })
          .catch(err => console.error('Error fetching appointment stats:', err));

        // Fetch prescriptions
        fetch(`${API_URL}/prescription?user=${currentUser.id}`)
          .then(res => res.ok ? res.json() : Promise.resolve([]))
          .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
              setHealthJourneyStats(prev => ({ ...prev, prescriptions: data.length }));
            }
          })
          .catch(err => console.error('Error fetching prescription stats:', err));
      }
    };

    const unsubscribe = navigation.addListener('focus', loadStats);
    loadStats(); // Initial load

    return unsubscribe;
  }, [navigation, currentUser?.id, isMockUser]);

  const accountLinks = [
    { icon: 'person-outline', title: 'Personal Information', route: 'EditProfile' },
    { icon: 'medical-outline', title: 'Medical History', route: 'MedicalRecords' },
    { icon: 'shield-checkmark-outline', title: 'Insurance Details' },
    { icon: 'card-outline', title: 'Payment Methods' },
  ];

  const preferenceLinks = [
    { icon: 'notifications-outline', title: 'Notifications' },
    { icon: 'lock-closed-outline', title: 'Privacy & Security' },
    { icon: 'globe-outline', title: 'Language & Region' },
  ];

  const initials = `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();

  return (
    <Screen title="Profile" subtitle="Your account and preferences" icon="person-outline" navigation={navigation}>
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, profileData.profileImage && { backgroundColor: 'transparent' }]}>
          {profileData.profileImage ? (
            <Image source={{ uri: profileData.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <Text style={styles.largeTitle}>{profileData.firstName} {profileData.lastName}</Text>
        <Text style={styles.bodyText}>Patient ID OKD-10482</Text>
        <View style={styles.tagRow}>
          {profileData.isSubscriber && <Pill label="Subscriber" color="#F59E0B" />}
          {profileData.isVerified && <Pill label="Verified" color="#10B981" />}
        </View>
        <View style={{ width: '100%', marginTop: 10 }}>
          <PrimaryButton label="Edit Profile" icon="create-outline" onPress={() => navigation.navigate('EditProfile', { currentProfile: profileData })} />
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Contact Information</Text>
      <Card>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="mail-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Email</Text></View>
          <Text style={styles.infoValue}>{profileData.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="call-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Phone</Text></View>
          <Text style={styles.infoValue}>{profileData.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="location-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Address</Text></View>
          <Text style={styles.infoValue}>{profileData.address}</Text>
        </View>
      <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="calendar-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Date of Birth</Text></View>
          <Text style={styles.infoValue}>{profileData.dob}</Text>
        </View>
      <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="male-female-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Gender</Text></View>
        <Text style={styles.infoValue}>{profileData.gender}</Text>
      </View>
      </Card>

      <Text style={styles.sectionHeader}>Medical Information</Text>
      <Card>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="heart-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Blood Type</Text></View>
          <Text style={styles.infoValue}>{profileData.bloodType}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="shield-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Allergies</Text></View>
          <Text style={styles.infoValue}>{profileData.allergies}</Text>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Emergency Contact</Text>
      <Card>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="person-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Name</Text></View>
          <Text style={styles.infoValue}>{profileData.emergencyName}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="people-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Relationship</Text></View>
          <Text style={styles.infoValue}>{profileData.emergencyRelationship}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="call-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Phone</Text></View>
          <Text style={styles.infoValue}>{profileData.emergencyPhone}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="mail-outline" size={16} color={muted} style={{ marginRight: 8 }} /><Text style={styles.infoLabel}>Email</Text></View>
          <Text style={styles.infoValue}>{profileData.emergencyEmail}</Text>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Your Health Journey</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="calendar-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>{healthJourneyStats.appointments} Appointments</Text>
        </View>
        <View style={styles.linkDivider} />
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="document-text-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>{healthJourneyStats.prescriptions} Prescriptions</Text>
        </View>
        <View style={styles.linkDivider} />
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="fitness-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>{healthJourneyStats.ptSessions} PT Sessions</Text>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Account</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {accountLinks.map((link, index) => (
          <React.Fragment key={link.title}>
            <TouchableOpacity style={styles.linkRow} onPress={link.route ? () => navigation.navigate(link.route, { currentProfile: profileData }) : link.onPress} activeOpacity={link.route || link.onPress ? 0.2 : 1.0}>
              <View style={styles.linkIconBg}><Ionicons name={link.icon} size={18} color={cyan} /></View>
              <Text style={styles.linkText}>{link.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            {index < accountLinks.length - 1 && <View style={styles.linkDivider} />}
          </React.Fragment>
        ))}
      </Card>

      <Text style={styles.sectionHeader}>Preferences</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {preferenceLinks.map((link, index) => (
          <React.Fragment key={link.title}>
            <TouchableOpacity style={styles.linkRow} onPress={link.onPress} activeOpacity={link.onPress ? 0.2 : 1.0}>
              <View style={styles.linkIconBg}><Ionicons name={link.icon} size={18} color={cyan} /></View>
              <Text style={styles.linkText}>{link.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.linkDivider} />
          </React.Fragment>
        ))}
        <View style={styles.linkRow}>
          <View style={styles.linkIconBg}><Ionicons name="finger-print-outline" size={18} color={cyan} /></View>
          <Text style={styles.linkText}>Use Biometric Login</Text>
          <Switch 
            value={useBiometrics}
            onValueChange={(value) => {
              setUseBiometrics(value);
              Alert.alert('Biometrics', `Biometric login has been ${value ? 'enabled' : 'disabled'}.
In a real app, this would securely store credentials for future use.`);
            }}
            trackColor={{ false: '#CBD5E1', true: '#BDEAF0' }}
            thumbColor={useBiometrics ? cyan : '#FFFFFF'}
          />
        </View>
      </Card>

      <View style={{ marginTop: 24, marginBottom: 20 }}>
        <PrimaryButton 
          label="Log Out" 
          icon="log-out-outline" 
          color="#EF4444" 
        onPress={() => {
          setCurrentUser(null);
          navigation.navigate('Auth');
        }} 
        />
      </View>
    </Screen>
  );
}

export function ReferralDetailsScreen({ navigation, route }) {
  const refData = route?.params?.referralData;
  const title = refData?.title || 'Specialist Referral';
  const subtitle = refData?.subtitle || 'Referred by Dr. Sofia Lim (Cardiologist)';
  const reason = refData?.reason || 'Knee pain after exercise';
  const date = refData?.date || 'February 10, 2026';
  const actionType = refData?.actionType || 'BookSpecialist';

  return (
    <Screen title="Referral Details" subtitle={title} icon="git-branch-outline" navigation={navigation}>
      <Card style={[styles.card, styles.warningBorder]}>
        <View style={styles.rowBetween}>
          <Text style={styles.largeTitle}>{title.includes('GP Assessment') ? 'GP Assessment Request' : 'Specialist Referral'}</Text>
          <Pill label="Pending" color="#F59E0B" />
        </View>
        <Text style={styles.bodyText}>{subtitle}</Text>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Reason</Text>
          <Text style={styles.detailText}>{reason}</Text>
        </View>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>{title.includes('GP Assessment') ? 'Assessment Date' : 'Referral Date'}</Text>
          <Text style={styles.detailText}>{date}</Text>
        </View>
        <PrimaryButton 
          label="Book Appointment" 
          icon="person-add" 
          color="#F59E0B" 
          onPress={() => {
            if (actionType === 'BookTherapy') navigation.navigate('BookTherapy', { preselectedTherapy: refData?.specialty });
            else if (actionType === 'BookSpecialist') navigation.navigate('BookSpecialist', { preselectedDoctor: refData?.preselectedDoctor, preselectedSpecialty: refData?.specialty });
            else navigation.navigate('BookSpecialist');
          }} 
        />
      </Card>
    </Screen>
  );
}

export function BookSpecialistScreen({ navigation, route }) {
  const scrollViewRef = useRef(null);
  const doctorLayouts = useRef({});
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
  const [hmoCardImage, setHmoCardImage] = useState(null);

  // Step 3: Schedule
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentViewDate.getMonth()];
  const currentYear = currentViewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentViewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentViewDate.getMonth(), 1).getDay();

  // Step 4: Details
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Step 5: Review
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);

  const doctors = [
    { id: '1', name: 'Dr. Sofia Lim', status: 'Available', specialty: 'Cardiologist', clinic: 'OkieDoc+ Heart Center', location: 'BGC, Taguig City', exp: '20 years experience', price: 'From ₱3000', hmo: true, ph: true, initial: 'SL' },
    { id: '2', name: 'Dr. Carlos Torres', status: 'Available', specialty: 'Dermatologist', clinic: 'OkieDoc+ Skin Clinic', location: 'Ortigas, Pasig City', exp: '10 years experience', price: 'From ₱2500', hmo: true, ph: false, initial: 'CT' },
    { id: '3', name: 'Dr. Anna Cruz', status: 'Available', specialty: 'Psychiatrist', clinic: 'OkieDoc+ Mental Health Center', location: 'Manila', exp: '18 years experience', price: 'From ₱3500', hmo: true, ph: true, initial: 'AC' },
    { id: '4', name: 'Dr. Miguel Garcia', status: 'Available', specialty: 'Orthopedic Surgeon', clinic: 'OkieDoc+ Orthopedic Center', location: 'Makati City', exp: '22 years experience', price: 'From ₱4000', hmo: true, ph: true, initial: 'MG' },
    { id: '5', name: 'Dr. Isabel Reyes', status: 'Unavailable', specialty: 'Endocrinologist', clinic: 'OkieDoc+ Diabetes Center', location: 'Quezon City', exp: '15 years experience', price: 'From ₱3200', hmo: false, ph: true, initial: 'IR' },
    { id: '6', name: 'Dr. Ramon Santos', status: 'Available', specialty: 'Gastroenterologist', clinic: 'OkieDoc+ Digestive Health Center', location: 'Makati City', exp: '25 years experience', price: 'From ₱3800', hmo: true, ph: true, initial: 'RS' },
  ];

  useEffect(() => {
    if (route?.params?.preselectedDoctor || route?.params?.preselectedSpecialty) {
      let doc;
      if (route.params.preselectedDoctor) {
        doc = doctors.find(d => d.name === route.params.preselectedDoctor);
      } else if (route.params.preselectedSpecialty) {
        doc = doctors.find(d => d.specialty.toLowerCase() === route.params.preselectedSpecialty.toLowerCase() || route.params.preselectedSpecialty.toLowerCase().includes(d.specialty.toLowerCase()));
      }
      if (doc) {
        setSelectedDoctor(doc);
        let attempts = 0;
        const interval = setInterval(() => {
          if (doctorLayouts.current[doc.id] !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: doctorLayouts.current[doc.id] - 20, animated: true });
            clearInterval(interval);
          }
          attempts++;
          if (attempts > 10) clearInterval(interval);
        }, 50);
      }
      navigation.setParams({ preselectedDoctor: undefined, preselectedSpecialty: undefined });
    }
  }, [route?.params?.preselectedDoctor, route?.params?.preselectedSpecialty, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setStep(0);
      setSelectedDoctor(null);
      setPaymentMethod(null);
      setHmoProvider('Select your HMO Provider');
      setShowHmoDropdown(false);
      setHmoId('');
      setPhilhealthNo('');
      setHmoCardImage(null);
      setHasReferral(null);
      setSelectedDate('');
      setSelectedTime(null);
      setCurrentViewDate(new Date());
      setShowMonthYearPicker(false);
      setPickerYear(new Date().getFullYear());
      setChiefComplaint('');
      setSelectedSymptoms([]);
      setAdditionalNotes('');
      setShowFullScreenImage(false);
    });
    return unsubscribe;
  }, [navigation]);

  const pickHmoCard = async () => {
    // No permissions request is necessary for launching the image library.
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setHmoCardImage(result.assets[0].uri);
    }
  };

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title="Book Specialist Consultation" subtitle="Connect with specialized medical experts for your specific needs" icon="person-add-outline" navigation={navigation} />
        
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 100 }]} keyboardShouldPersistTaps="handled">
          
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
                onLayout={(event) => {
                  doctorLayouts.current[doc.id] = event.nativeEvent.layout.y;
                }}
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
                    <TouchableOpacity 
                      style={{ 
                        height: hmoCardImage ? 150 : 80, 
                        borderWidth: 1, 
                        borderColor: '#CBD5E1', 
                        borderStyle: 'dashed', 
                        borderRadius: 10, 
                        backgroundColor: '#F8FAFC', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginBottom: 16,
                        overflow: 'hidden'
                      }}
                      onPress={pickHmoCard}
                    >
                      {hmoCardImage ? (
                        <>
                          <Image source={{ uri: hmoCardImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          <TouchableOpacity 
                            onPress={() => setHmoCardImage(null)} 
                            style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}
                          >
                            <Ionicons name="close" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Ionicons name="cloud-upload-outline" size={24} color="#7C3AED" style={{ marginBottom: 4 }} />
                          <Text style={{ color: '#7C3AED', fontWeight: '700', fontSize: 13 }}>Click to Upload HMO Card</Text>
                          <Text style={{ color: muted, fontSize: 11 }}>(PNG, JPG up to 5MB)</Text>
                        </>
                      )}
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
                    
                    <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 12, marginBottom: 8, borderRadius: 8, borderColor: hasReferral === true ? '#10B981' : '#E2E8F0', borderWidth: 2, flexDirection: 'row', alignItems: 'center' }} onPress={() => setHasReferral(true)}>
                       <Ionicons name={hasReferral === true ? 'radio-button-on' : 'radio-button-off'} size={20} color={hasReferral === true ? '#10B981' : muted} style={{ marginRight: 8 }} />
                       <Text style={{ color: hasReferral === true ? '#10B981' : ink, fontWeight: '700', fontSize: 13 }}>Yes, I have a referral</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 12, marginBottom: hasReferral === null ? 6 : 16, borderRadius: 8, borderColor: hasReferral === false ? '#10B981' : '#E2E8F0', borderWidth: 2, flexDirection: 'row', alignItems: 'center' }} onPress={() => setHasReferral(false)}>
                       <Ionicons name={hasReferral === false ? 'radio-button-on' : 'radio-button-off'} size={20} color={hasReferral === false ? '#10B981' : muted} style={{ marginRight: 8 }} />
                       <Text style={{ color: hasReferral === false ? '#10B981' : ink, fontWeight: '700', fontSize: 13 }}>No Referral</Text>
                    </TouchableOpacity>

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
                  <TouchableOpacity onPress={handlePrevMonth}><Ionicons name="chevron-back" size={20} color={muted} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setPickerYear(currentViewDate.getFullYear()); setShowMonthYearPicker(true); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: ink, marginRight: 4 }}>{currentMonthName} {currentYear}</Text>
                    <Ionicons name="caret-down" size={14} color={ink} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextMonth}><Ionicons name="chevron-forward" size={20} color={muted} /></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <Text key={day} style={{ width: 32, textAlign: 'center', color: muted, fontSize: 12, fontWeight: '600' }}>{day}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <View key={`empty-${i}`} style={{ width: '14.28%', height: 40 }} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonthName} ${day}, ${currentYear}`;
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

            {/* Month/Year Picker Modal */}
            <Modal visible={showMonthYearPicker} transparent={true} animationType="fade" onRequestClose={() => setShowMonthYearPicker(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => setPickerYear(prev => prev - 1)} style={{ padding: 8 }}>
                      <Ionicons name="chevron-back" size={24} color={ink} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: ink }}>{pickerYear}</Text>
                    <TouchableOpacity onPress={() => setPickerYear(prev => prev + 1)} style={{ padding: 8 }}>
                      <Ionicons name="chevron-forward" size={24} color={ink} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {monthNames.map((month, index) => {
                      const isSelected = currentViewDate.getMonth() === index && currentViewDate.getFullYear() === pickerYear;
                      return (
                        <TouchableOpacity
                          key={month}
                          style={{ width: '30%', paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: isSelected ? '#7C3AED' : '#F8FAFC', borderWidth: 1, borderColor: isSelected ? '#7C3AED' : '#E2E8F0', marginBottom: 10 }}
                          onPress={() => {
                            setCurrentViewDate(new Date(pickerYear, index, 1));
                            setShowMonthYearPicker(false);
                          }}
                        >
                          <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontWeight: isSelected ? '700' : '500', fontSize: 13 }}>{month.substring(0, 3)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 }}
                    onPress={() => setShowMonthYearPicker(false)}
                  >
                    <Text style={{ color: muted, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
                    {hmoCardImage && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={[styles.bodyText, { fontWeight: '700', color: ink, marginBottom: 4 }]}>HMO Card:</Text>
                        <TouchableOpacity onPress={() => setShowFullScreenImage(true)}>
                          <Image source={{ uri: hmoCardImage }} style={{ width: '100%', height: 150, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }} resizeMode="cover" />
                        </TouchableOpacity>
                      </View>
                    )}
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
              setHmoCardImage(null);
              setHasReferral(null);
              setSelectedDate('');
              setSelectedTime(null);
              setCurrentViewDate(new Date());
              setShowMonthYearPicker(false);
              setPickerYear(new Date().getFullYear());
              setChiefComplaint('');
              setSelectedSymptoms([]);
              setAdditionalNotes('');
              setShowFullScreenImage(false);
              
              navigation.navigate('Appointments', { newAppointment: newAppt });
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Full Screen Image Modal */}
      <Modal visible={showFullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setShowFullScreenImage(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 1, padding: 8 }}
            onPress={() => setShowFullScreenImage(false)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {hmoCardImage && <Image source={{ uri: hmoCardImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />}
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BookTherapyScreen({ navigation, route }) {
  const [step, setStep] = useState(0);
  const totalSteps = 7;
  
  // Step 1: Type
  const [therapyType, setTherapyType] = useState(null);
  
  // Step 2: Therapist
  const [therapist, setTherapist] = useState(null);
  
  // Step 3: Referral
  const [referralOption, setReferralOption] = useState(null);
  const [referralDoc, setReferralDoc] = useState(null);

  // Step 4: Schedule
  const [sessionType, setSessionType] = useState('single');
  const [numSessions, setNumSessions] = useState(4);
  const [selectedTherapyDate, setSelectedTherapyDate] = useState('');
  const [selectedTherapyTime, setSelectedTherapyTime] = useState(null);
  const [therapyViewDate, setTherapyViewDate] = useState(new Date());
  const [showTherapyMonthYearPicker, setShowTherapyMonthYearPicker] = useState(false);
  const [therapyPickerYear, setTherapyPickerYear] = useState(new Date().getFullYear());
  
  const handlePrevTherapyMonth = () => setTherapyViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextTherapyMonth = () => setTherapyViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  
  const therapyMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentTherapyMonthName = therapyMonthNames[therapyViewDate.getMonth()];
  const currentTherapyYear = therapyViewDate.getFullYear();
  const therapyDaysInMonth = new Date(currentTherapyYear, therapyViewDate.getMonth() + 1, 0).getDate();
  const therapyFirstDay = new Date(currentTherapyYear, therapyViewDate.getMonth(), 1).getDay();
  const therapyTimes = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  // Step 5: Details
  const [therapyComplaint, setTherapyComplaint] = useState('');
  const [affectedArea, setAffectedArea] = useState('');
  const [therapyNotes, setTherapyNotes] = useState('');

  // Step 6: Payment
  const [therapyPayment, setTherapyPayment] = useState(null);

  const therapyTypes = [
    { id: 'PT', title: 'Physical Therapy', sub: 'Rehabilitation for injuries, pain management, and mobility improvement', time: '45-60 mins' },
    { id: 'OT', title: 'Occupational Therapy', sub: 'Help with daily activities, fine motor skills, and adaptive strategies', time: '45-60 mins' },
    { id: 'ST', title: 'Speech Therapy', sub: 'Communication, language, and swallowing disorders treatment', time: '30-45 mins' }
  ];

  useEffect(() => {
    if (route?.params?.preselectedTherapy) {
      const requestedType = route.params.preselectedTherapy.toLowerCase();
      const matchedType = therapyTypes.find(t => requestedType.includes(t.title.toLowerCase()) || t.title.toLowerCase().includes(requestedType));
      if (matchedType) {
        setTherapyType(matchedType);
      }
      navigation.setParams({ preselectedTherapy: undefined });
    }
  }, [route?.params?.preselectedTherapy, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setStep(0);
      setTherapyType(null);
      setTherapist(null);
      setReferralOption(null);
      setReferralDoc(null);
      setSessionType('single');
      setNumSessions(4);
      setSelectedTherapyDate('');
      setSelectedTherapyTime(null);
      setTherapyViewDate(new Date());
      setShowTherapyMonthYearPicker(false);
      setTherapyPickerYear(new Date().getFullYear());
      setTherapyComplaint('');
      setAffectedArea('');
      setTherapyNotes('');
      setTherapyPayment(null);
    });
    return unsubscribe;
  }, [navigation]);

  const isNextDisabled = 
    (step === 0 && !therapyType) ||
    (step === 1 && !therapist) ||
    (step === 2 && (!referralOption || (referralOption === 'upload' && !referralDoc))) ||
    (step === 3 && (!selectedTherapyDate || !selectedTherapyTime || (sessionType === 'package' && !numSessions))) ||
    (step === 4 && (!therapyComplaint.trim() || !affectedArea.trim())) ||
    (step === 5 && !therapyPayment);

  const pickReferralDoc = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setReferralDoc(result.assets[0].uri);
  };

  const getTherapistsList = () => {
    if (therapyType?.id === 'OT') {
      return [
        { id: '3', init: 'SL', name: 'OT. Sarah Lim', spec: 'Pediatric Occupational Therapy', exp: '5 years experience', rating: '4.9', avail: 'Mon, Wed, Fri' }
      ];
    } else if (therapyType?.id === 'ST') {
      return [
        { id: '4', init: 'MT', name: 'ST. Michael Tan', spec: 'Adult Speech Pathology', exp: '7 years experience', rating: '4.7', avail: 'Tue, Thu' }
      ];
    }
    return [
      { id: '1', init: 'MC', name: 'PT. Maria Cruz', spec: 'Sports Rehabilitation', exp: '8 years experience', rating: '4.9', avail: 'Mon, Wed, Fri' },
      { id: '2', init: 'JR', name: 'PT. James Reyes', spec: 'Orthopedic Physical Therapy', exp: '6 years experience', rating: '4.8', avail: 'Tue, Thu, Sat' }
    ];
  };

  const therapistsList = getTherapistsList();

  const getBasePrice = () => {
    if (therapyType?.id === 'ST') return 1200; // Shorter duration (30-45 mins)
    if (therapyType?.id === 'OT') return 1600; // Specialized care
    return 1500; // Default PT
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={23} color={ink} />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="heart" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Book Therapy Session</Text>
            <Text style={styles.headerSubtitle}>Schedule your rehabilitation therapy</Text>
          </View>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 100 }]} keyboardShouldPersistTaps="handled">
          
        {/* Pagination Control */}
        <Card style={{ paddingVertical: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'relative', paddingHorizontal: 5 }}>
            <View style={{ position: 'absolute', top: 14, left: 16, right: 16, height: 2, backgroundColor: '#E2E8F0', zIndex: -1 }} />
            <View style={{ position: 'absolute', top: 14, left: 16, right: 16, height: 2, zIndex: -1 }}>
              <View style={{ width: `${(step / (totalSteps - 1)) * 100}%`, height: '100%', backgroundColor: '#10B981' }} />
            </View>
            
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isCompleted = step > i;
              const isActive = step === i;
              return (
                <View key={i} style={{ alignItems: 'center' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isCompleted || isActive ? '#10B981' : '#F1F5F9', borderWidth: isCompleted || isActive ? 0 : 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: isActive ? '#FFFFFF' : '#64748B', fontSize: 13, fontWeight: '700' }}>{i + 1}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* STEP 1: TYPE */}
        {step === 0 && (
          <>
            <Text style={styles.sectionHeader}>Select Therapy Type</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Choose the type of therapy session you need</Text>
            {therapyTypes.map(type => (
              <TouchableOpacity 
                key={type.id} 
                style={[styles.card, therapyType?.id === type.id && { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#ECFDF5' }]}
                onPress={() => {
                  if (therapyType?.id !== type.id) setTherapist(null);
                  setTherapyType(type);
                }}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{type.title}</Text>
                    <Text style={[styles.bodyText, { marginBottom: 12 }]}>{type.sub}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={16} color={muted} style={{ marginRight: 6 }} />
                      <Text style={{ color: ink, fontSize: 13, fontWeight: '600' }}>{type.time}</Text>
                    </View>
                  </View>
                  {therapyType?.id === type.id && (
                    <View style={{ backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>Selected</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 2: THERAPIST */}
        {step === 1 && (
          <>
            <Text style={styles.sectionHeader}>Select Your Therapist</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Choose from our qualified physical therapy professionals</Text>
            {therapistsList.map(pt => (
              <TouchableOpacity 
                key={pt.id} 
                style={[styles.card, therapist?.id === pt.id && { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#ECFDF5' }]}
                onPress={() => setTherapist(pt)}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{pt.init}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{pt.name}</Text>
                      <Text style={[styles.bodyText, { color: '#059669', fontWeight: '700' }]}>{pt.spec}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: therapist?.id === pt.id ? '#D1FAE5' : '#F1F5F9' }}>
                  <Text style={styles.bodyText}>{pt.exp}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={[styles.bodyText, { fontWeight: '700', color: ink, marginLeft: 4 }]}>{pt.rating}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={14} color={muted} />
                    <Text style={[styles.bodyText, { marginLeft: 6 }]}>Available: <Text style={{ fontWeight: '600', color: ink }}>{pt.avail}</Text></Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 3: REFERRAL */}
        {step === 2 && (
          <>
            <Text style={styles.sectionHeader}>Referral Information</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Do you have a doctor's referral for this therapy?</Text>

            <View style={{ backgroundColor: '#FFFBEB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', marginBottom: 20 }}>
              <Ionicons name="alert-circle" size={24} color="#D97706" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 15, marginBottom: 4 }}>Referral Recommended</Text>
                <Text style={{ color: '#B45309', fontSize: 13, lineHeight: 18 }}>A doctor's referral is recommended for therapy sessions and may be required for insurance coverage.</Text>
              </View>
            </View>

            <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12, borderRadius: 12, borderColor: referralOption === 'none' ? '#10B981' : '#E2E8F0', borderWidth: 2 }} onPress={() => setReferralOption('none')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={referralOption === 'none' ? 'radio-button-on' : 'radio-button-off'} size={24} color={referralOption === 'none' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                  <Text style={[styles.cardTitle, { marginBottom: 0, flex: 1 }]}>Proceed without referral (Self-book, pay per session)</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, marginBottom: 16, borderRadius: 12, borderColor: referralOption === 'upload' ? '#10B981' : '#E2E8F0', borderWidth: 2 }} onPress={() => setReferralOption('upload')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={referralOption === 'upload' ? 'radio-button-on' : 'radio-button-off'} size={24} color={referralOption === 'upload' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                  <Text style={[styles.cardTitle, { marginBottom: 0, flex: 1 }]}>Upload referral document</Text>
              </View>
            </TouchableOpacity>

            {referralOption === 'upload' && (
              <TouchableOpacity 
                style={{ height: referralDoc ? 150 : 80, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' }}
                onPress={pickReferralDoc}
              >
                {referralDoc ? (
                  <>
                    <Image source={{ uri: referralDoc }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <TouchableOpacity onPress={() => setReferralDoc(null)} style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}>
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={24} color="#10B981" style={{ marginBottom: 4 }} />
                    <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>Upload Referral Document</Text>
                    <Text style={{ color: muted, fontSize: 11 }}>(PDF, JPG, or PNG up to 5MB)</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* STEP 4: SCHEDULE */}
        {step === 3 && (
          <>
            <Text style={styles.sectionHeader}>Select Schedule</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Choose your preferred date and time</Text>
            
            <Card>
              <Text style={[styles.inputLabel, { marginBottom: 12 }]}>Session Type</Text>
              <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12, borderRadius: 12, borderColor: sessionType === 'single' ? '#10B981' : '#E2E8F0', borderWidth: 2 }} onPress={() => setSessionType('single')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={sessionType === 'single' ? 'radio-button-on' : 'radio-button-off'} size={24} color={sessionType === 'single' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { marginBottom: 2 }]}>Single Session</Text>
                      <Text style={styles.bodyText}>Book one session</Text>
                    </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, marginBottom: 16, borderRadius: 12, borderColor: sessionType === 'package' ? '#10B981' : '#E2E8F0', borderWidth: 2 }} onPress={() => setSessionType('package')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={sessionType === 'package' ? 'radio-button-on' : 'radio-button-off'} size={24} color={sessionType === 'package' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { marginBottom: 2 }]}>Session Package</Text>
                      <Text style={styles.bodyText}>Book multiple sessions</Text>
                    </View>
                </View>
              </TouchableOpacity>

              {sessionType === 'package' && (
                <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Number of Sessions</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    {[4, 8, 12, 16].map(num => (
                      <TouchableOpacity 
                        key={num} 
                        style={{ width: '22%', height: 44, borderRadius: 8, borderWidth: 1, borderColor: numSessions === num ? '#10B981' : '#CBD5E1', backgroundColor: numSessions === num ? '#10B981' : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => setNumSessions(num)}
                      >
                        <Text style={{ color: numSessions === num ? '#FFFFFF' : ink, fontWeight: '700', fontSize: 16 }}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{ color: '#059669', fontSize: 12, fontWeight: '600' }}>Save 10% with session packages</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Select Date *</Text>
              <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 16, backgroundColor: '#FFFFFF' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <TouchableOpacity onPress={handlePrevTherapyMonth}><Ionicons name="chevron-back" size={20} color={muted} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setTherapyPickerYear(therapyViewDate.getFullYear()); setShowTherapyMonthYearPicker(true); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: ink, marginRight: 4 }}>{currentTherapyMonthName} {currentTherapyYear}</Text>
                    <Ionicons name="caret-down" size={14} color={ink} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextTherapyMonth}><Ionicons name="chevron-forward" size={20} color={muted} /></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <Text key={day} style={{ width: 32, textAlign: 'center', color: muted, fontSize: 12, fontWeight: '600' }}>{day}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {Array.from({ length: therapyFirstDay }).map((_, i) => (
                    <View key={`empty-${i}`} style={{ width: '14.28%', height: 40 }} />
                  ))}
                  {Array.from({ length: therapyDaysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentTherapyMonthName} ${day}, ${currentTherapyYear}`;
                    const isSelected = selectedTherapyDate === dateStr;
                    return (
                      <TouchableOpacity 
                        key={day}
                        style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => setSelectedTherapyDate(dateStr)}
                      >
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isSelected ? '#10B981' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontSize: 14, fontWeight: isSelected ? '700' : '500' }}>{day}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {selectedTherapyDate?.length > 0 && (
                <>
                  <Text style={[styles.cardTitle, { marginTop: 12, marginBottom: 12 }]}>Available Times</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {therapyTimes.map((t, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={{ width: '31%', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: selectedTherapyTime === t ? '#10B981' : '#E2E8F0', backgroundColor: selectedTherapyTime === t ? '#ECFDF5' : '#F8FAFC', alignItems: 'center' }}
                        onPress={() => setSelectedTherapyTime(t)}
                      >
                        <Text style={{ color: selectedTherapyTime === t ? '#10B981' : ink, fontWeight: '700', fontSize: 12 }}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </Card>

            {/* Month/Year Picker Modal */}
            <Modal visible={showTherapyMonthYearPicker} transparent={true} animationType="fade" onRequestClose={() => setShowTherapyMonthYearPicker(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => setTherapyPickerYear(prev => prev - 1)} style={{ padding: 8 }}>
                      <Ionicons name="chevron-back" size={24} color={ink} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: ink }}>{therapyPickerYear}</Text>
                    <TouchableOpacity onPress={() => setTherapyPickerYear(prev => prev + 1)} style={{ padding: 8 }}>
                      <Ionicons name="chevron-forward" size={24} color={ink} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {therapyMonthNames.map((month, index) => {
                      const isSelected = therapyViewDate.getMonth() === index && therapyViewDate.getFullYear() === therapyPickerYear;
                      return (
                        <TouchableOpacity
                          key={month}
                          style={{ width: '30%', paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: isSelected ? '#10B981' : '#F8FAFC', borderWidth: 1, borderColor: isSelected ? '#10B981' : '#E2E8F0', marginBottom: 10 }}
                          onPress={() => {
                            setTherapyViewDate(new Date(therapyPickerYear, index, 1));
                            setShowTherapyMonthYearPicker(false);
                          }}
                        >
                          <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontWeight: isSelected ? '700' : '500', fontSize: 13 }}>{month.substring(0, 3)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 }}
                    onPress={() => setShowTherapyMonthYearPicker(false)}
                  >
                    <Text style={{ color: muted, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}

        {/* STEP 5: DETAILS */}
        {step === 4 && (
          <>
            <Text style={styles.sectionHeader}>Session Details</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Help your therapist prepare for your session</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chief Complaint / Reason for Therapy *</Text>
                <TextInput 
                  style={[styles.textInput, { height: 80, paddingTop: 12 }]} 
                  placeholder="e.g., Lower back pain after lifting heavy objects, difficulty with shoulder mobility..." 
                  placeholderTextColor="#94A3B8" 
                  multiline 
                  value={therapyComplaint}
                  onChangeText={setTherapyComplaint}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>Affected Area *</Text>
                <TextInput 
                  style={[styles.textInput, { marginBottom: 4 }]} 
                  placeholder="e.g., Lower back, Right shoulder, Left knee..." 
                  placeholderTextColor="#94A3B8" 
                  value={affectedArea}
                  onChangeText={setAffectedArea}
                />
                <Text style={{ fontSize: 11, color: muted }}>Specify the body part or area requiring therapy</Text>
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput 
                  style={[styles.textInput, { height: 80, paddingTop: 12 }]} 
                  placeholder="Previous injuries, current medications, specific concerns" 
                  placeholderTextColor="#94A3B8" 
                  multiline 
                  value={therapyNotes}
                  onChangeText={setTherapyNotes}
                />
              </View>
            </Card>
          </>
        )}

        {/* STEP 6: PAYMENT */}
        {step === 5 && (
          <>
            <Text style={styles.sectionHeader}>Payment Method</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Select how you'll pay for your session</Text>
            
            <TouchableOpacity style={[styles.card, therapyPayment === 'Cash' && { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#ECFDF5' }]} onPress={() => setTherapyPayment('Cash')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={therapyPayment === 'Cash' ? 'radio-button-on' : 'radio-button-off'} size={24} color={therapyPayment === 'Cash' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Cash / Pay per Session</Text>
                  <Text style={styles.bodyText}>Pay ₱{getBasePrice().toLocaleString()} per session after completion</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, therapyPayment === 'HMO' && { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#ECFDF5' }]} onPress={() => setTherapyPayment('HMO')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={therapyPayment === 'HMO' ? 'radio-button-on' : 'radio-button-off'} size={24} color={therapyPayment === 'HMO' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>HMO Coverage</Text>
                  <Text style={styles.bodyText}>Use your health insurance coverage</Text>
                  <View style={{ backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 }}>
                    <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '700' }}>Subject to HMO approval</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, therapyPayment === 'PhilHealth' && { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#ECFDF5' }, referralOption === 'none' && { opacity: 0.6 }]} 
              onPress={() => referralOption !== 'none' && setTherapyPayment('PhilHealth')}
              disabled={referralOption === 'none'}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={therapyPayment === 'PhilHealth' ? 'radio-button-on' : 'radio-button-off'} size={24} color={therapyPayment === 'PhilHealth' ? '#10B981' : muted} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>PhilHealth</Text>
                  <Text style={styles.bodyText}>Requires doctor's referral</Text>
                  {referralOption === 'none' && (
                    <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 }}>
                      <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>Not Available - No referral</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 7: REVIEW */}
        {step === 6 && (
          <>
            <Text style={styles.sectionHeader}>Review & Confirm</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Please review your booking details before confirming</Text>
            
            <Card>
              <Text style={styles.detailLabel}>Therapy Type</Text>
              <Text style={[styles.cardTitle, { marginTop: 4, marginBottom: 2 }]}>{therapyType?.title}</Text>
              <Text style={[styles.bodyText, { marginBottom: 16 }]}>Duration: {therapyType?.time}</Text>

              <Text style={styles.detailLabel}>Therapist</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{therapist?.init}</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>{therapist?.name}</Text>
                  <Text style={styles.bodyText}>{therapist?.spec} • {therapist?.exp.split(' ')[0]}</Text>
                </View>
              </View>

              <Text style={styles.detailLabel}>Schedule</Text>
              <View style={{ marginTop: 4, marginBottom: 16 }}>
                <Text style={[styles.bodyText, { color: ink, fontWeight: '600' }]}>{selectedTherapyDate}</Text>
                <Text style={[styles.bodyText, { color: ink, fontWeight: '600' }]}>{selectedTherapyTime}</Text>
                <Text style={styles.bodyText}>{sessionType === 'package' ? `${numSessions}-Session Package` : 'Single Session'}</Text>
              </View>

              <View style={{ borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16, marginBottom: 16 }}>
                <Text style={styles.detailLabel}>Chief Complaint</Text>
                <Text style={[styles.bodyText, { color: ink, marginBottom: 12, marginTop: 4 }]}>{therapyComplaint}</Text>
                
                <Text style={styles.detailLabel}>Affected Area</Text>
                <Text style={[styles.bodyText, { color: ink, marginBottom: 12, marginTop: 4 }]}>{affectedArea}</Text>

                <Text style={styles.detailLabel}>Additional Notes</Text>
                <Text style={[styles.bodyText, { color: ink, marginTop: 4 }]}>{therapyNotes || 'None'}</Text>
              </View>

              <View style={{ borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16 }}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={[styles.cardTitle, { marginTop: 4 }]}>
                  {therapyPayment === 'Cash' ? 'Cash / Pay per Session' : therapyPayment === 'HMO' ? 'HMO Coverage' : 'PhilHealth'}
                </Text>
                
                {therapyPayment === 'Cash' && (
                  <>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: ink, marginTop: 8 }}>
                      ₱{(sessionType === 'package' ? (getBasePrice() * numSessions * 0.9) : getBasePrice()).toLocaleString()}
                    </Text>
                    {sessionType === 'package' && (
                      <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700', marginTop: 4 }}>10% package discount</Text>
                    )}
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
        
        {step < 6 ? (
          <TouchableOpacity 
            style={{ height: 48, paddingHorizontal: 32, borderRadius: 8, backgroundColor: isNextDisabled ? '#CBD5E1' : '#10B981', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setStep(step + 1)}
            disabled={isNextDisabled}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={{ height: 48, paddingHorizontal: 32, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => {
              const newAppt = {
                id: Date.now().toString(),
                doctor: therapist?.name,
                specialty: therapist?.spec,
                status: therapyPayment === 'HMO' ? 'Pending' : 'Confirmed',
                date: selectedTherapyDate,
                time: selectedTherapyTime,
                type: therapyType?.title || 'Therapy Session',
                color: therapyPayment === 'HMO' ? '#F59E0B' : '#10B981',
                actions: ['Message']
              };

              setStep(0);
              setTherapyType(null);
              setTherapist(null);
              setReferralOption(null);
              setReferralDoc(null);
              setSessionType('single');
              setNumSessions(4);
              setSelectedTherapyDate('');
              setSelectedTherapyTime(null);
              setTherapyViewDate(new Date());
              setShowTherapyMonthYearPicker(false);
              setTherapyPickerYear(new Date().getFullYear());
              setTherapyComplaint('');
              setAffectedArea('');
              setTherapyNotes('');
              setTherapyPayment(null);
              
              navigation.navigate('Appointments', { newAppointment: newAppt });
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const calculateAge = (dob) => {
  if (!dob || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return '';
  const [month, day, year] = dob.split('/');
  const birthDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age.toString();
};

export function BookPhysicalScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const totalSteps = 5;
  const stepLabels = ['Doctor', 'Facility', 'Date & Time', 'Details', 'Review'];
  
  // Step 1: Doctor
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Step 2: Facility
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  
  const handlePrevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[viewDate.getMonth()];
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentYear, viewDate.getMonth(), 1).getDay();
  const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:30 PM', '04:00 PM'];

  // Step 4: Patient Info
  const [fullName, setFullName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.replace('Not provided', '').trim() : '');
  const [age, setAge] = useState(currentUser ? calculateAge(currentUser.dob) : '');
  const [gender, setGender] = useState(currentUser?.gender !== 'Not provided' ? currentUser.gender : 'Male');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone !== 'Not provided' ? formatPhoneNumber(currentUser.phone) : '');

  // Step 5: Consultation Details
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const onFocus = () => {
      // Reset patient details from currentUser on focus
      if (currentUser) {
        setFullName(`${currentUser.firstName} ${currentUser.lastName}`.replace('Not provided', '').trim());
        setAge(calculateAge(currentUser.dob));
        setGender(currentUser.gender !== 'Not provided' ? currentUser.gender : 'Male');
        setContactNumber(currentUser.phone !== 'Not provided' ? formatPhoneNumber(currentUser.phone) : '');
      } else {
        // Handle case where user logs out
        setFullName('');
        setAge('');
        setGender('Male');
        setContactNumber('');
      }
    };

    const onBlur = () => {
      setStep(0);
      setSearchQuery('');
      setSelectedDoctor(null);
      setSelectedFacility(null);
      setSelectedDate('');
      setSelectedTime(null);
      setViewDate(new Date());
      setShowMonthYearPicker(false);
      setPickerYear(new Date().getFullYear());
      setChiefComplaint('');
      setSelectedSymptoms([]);
      setNotes('');
    };

    const focusSubscription = navigation.addListener('focus', onFocus);
    const blurSubscription = navigation.addListener('blur', onBlur);
    
    onFocus(); // Initial load

    return () => {
      focusSubscription();
      blurSubscription();
    };
  }, [navigation]);

  const isNextDisabled = 
    (step === 0 && !selectedDoctor) ||
    (step === 1 && !selectedFacility) ||
    (step === 2 && (!selectedDate || !selectedTime)) ||
    (step === 3 && !chiefComplaint.trim());

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const physicalDoctors = [
    { id: '1', init: 'MS', name: 'Dr. Maria Santos', status: 'Available', spec: 'General Practitioner', exp: '15 years experience', clinic: 'OkieDoc+ Makati Clinic', location: 'Makati City',
      facilities: [
        { id: 'f1', name: 'OkieDoc+ Makati Clinic', address: '123 Ayala Avenue, Makati City', room: 'Room 301', floor: '3rd Floor' },
        { id: 'f2', name: 'OkieDoc+ Makati Annex', address: '456 Makati Avenue, Makati City', room: 'Room 205', floor: '2nd Floor' }
      ]
    },
    { id: '2', init: 'JR', name: 'Dr. Juan Reyes', status: 'Available', spec: 'Pediatrician', exp: '12 years experience', clinic: 'OkieDoc+ Quezon City Clinic', location: 'Quezon City',
      facilities: [{ id: 'f3', name: 'OkieDoc+ Quezon City Clinic', address: '789 Commonwealth Ave, Quezon City', room: 'Room 102', floor: '1st Floor' }]
    },
    { id: '3', init: 'SL', name: 'Dr. Sofia Lim', status: 'Unavailable', spec: 'Cardiologist', exp: '20 years experience', clinic: 'OkieDoc+ BGC Clinic', location: 'Taguig City', facilities: [] },
    { id: '4', init: 'CT', name: 'Dr. Carlos Torres', status: 'Available', spec: 'Dermatologist', exp: '10 years experience', clinic: 'OkieDoc+ Ortigas Clinic', location: 'Pasig City',
      facilities: [{ id: 'f4', name: 'OkieDoc+ Ortigas Clinic', address: '101 Ortigas Ave, Pasig City', room: 'Room 405', floor: '4th Floor' }]
    },
    { id: '5', init: 'AC', name: 'Dr. Anna Cruz', status: 'Available', spec: 'Psychiatrist', exp: '18 years experience', clinic: 'OkieDoc+ Manila Clinic', location: 'Manila',
      facilities: [{ id: 'f5', name: 'OkieDoc+ Manila Clinic', address: '202 Taft Ave, Manila', room: 'Room 201', floor: '2nd Floor' }]
    },
    { id: '6', init: 'MG', name: 'Dr. Miguel Garcia', status: 'Available', spec: 'Orthopedic Surgeon', exp: '22 years experience', clinic: 'OkieDoc+ Makati Clinic', location: 'Makati City',
      facilities: [{ id: 'f6', name: 'OkieDoc+ Makati Clinic', address: '123 Ayala Avenue, Makati City', room: 'Room 305', floor: '3rd Floor' }]
    },
  ];

  const filteredDoctors = physicalDoctors.filter(doc => 
    !searchQuery || 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.spec.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSymptoms = ['Fever', 'Cough', 'Headache', 'Sore Throat', 'Body Pain', 'Fatigue', 'Nausea', 'Dizziness', 'Chest Pain', 'Shortness of Breath', 'Stomach Pain', 'Loss of Appetite'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title="Book Physical Consultation" subtitle="Schedule an in-person appointment with our healthcare professionals" icon="calendar-outline" navigation={navigation} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 100 }]} keyboardShouldPersistTaps="handled">
          
        {/* Pagination Control */}
        <Card style={{ paddingVertical: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
            <View style={{ position: 'absolute', top: 12, left: 16, right: 16, height: 2, backgroundColor: '#E2E8F0', zIndex: -1 }} />
            <View style={{ position: 'absolute', top: 12, left: 16, width: `${(step / (totalSteps - 1)) * 100}%`, height: 2, backgroundColor: cyan, zIndex: -1 }} />
            
            {stepLabels.map((label, i) => (
              <View key={label} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: step >= i ? cyan : '#F1F5F9', borderWidth: step >= i ? 0 : 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ color: step >= i ? '#FFFFFF' : '#64748B', fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 9, color: step >= i ? cyan : '#64748B', fontWeight: step >= i ? '700' : '500', textAlign: 'center' }}>{label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* STEP 1: DOCTOR */}
        {step === 0 && (
          <>
            <Text style={styles.sectionHeader}>Select Specialty / Doctor</Text>
            <View style={[styles.searchBox, { marginTop: 4, marginBottom: 16 }]}>
              <Ionicons name="search-outline" size={18} color={muted} />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search doctors or specialties..." 
                placeholderTextColor="#94A3B8" 
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

          {filteredDoctors.map(doc => {
            const isSelected = selectedDoctor?.id === doc.id;
            return (
              <AnimatedSelectionCard 
                key={doc.id} 
                isSelected={isSelected}
                disabled={doc.status === 'Unavailable'}
                disabledStyle={{ opacity: 0.6 }}
                onPress={() => {
                  if (doc.status === 'Available') {
                    if (selectedDoctor?.id !== doc.id) setSelectedFacility(null);
                    setSelectedDoctor(doc);
                  }
                }}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{doc.init}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{doc.name}</Text>
                      <Text style={[styles.bodyText, { color: cyan, fontWeight: '700' }]}>{doc.spec}</Text>
                    </View>
                  </View>
                  <Pill label={doc.status} color={doc.status === 'Available' ? '#10B981' : '#64748B'} />
                </View>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: isSelected ? '#D8EAF0' : '#F1F5F9' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="business-outline" size={14} color={muted} style={{ marginRight: 6 }} />
                    <Text style={[styles.bodyText, { fontWeight: '600', color: ink }]}>{doc.clinic}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="location-outline" size={14} color={muted} style={{ marginRight: 6 }} />
                    <Text style={styles.bodyText}>{doc.location}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="stethoscope" size={14} color={muted} style={{ marginRight: 6 }} />
                    <Text style={styles.bodyText}>{doc.exp}</Text>
                  </View>
                </View>
              </AnimatedSelectionCard>
            );
          })}
          </>
        )}

        {/* STEP 2: FACILITY */}
        {step === 1 && (
          <>
            <Text style={styles.sectionHeader}>Select Facility / Location</Text>
            <Text style={[styles.bodyText, {marginBottom: 16, marginTop: -4, paddingHorizontal: 4}]}>Available locations for {selectedDoctor?.name}</Text>
          {selectedDoctor?.facilities.map(fac => {
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <AnimatedSelectionCard 
                key={fac.id} 
                isSelected={isSelected}
                onPress={() => setSelectedFacility(fac)}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{fac.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4 }}>
                      <Ionicons name="location-outline" size={14} color={muted} style={{ marginRight: 6 }} />
                      <Text style={styles.bodyText}>{fac.address}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="business-outline" size={14} color={muted} style={{ marginRight: 6 }} />
                      <Text style={{ color: ink, fontSize: 13, fontWeight: '600' }}>{fac.room}</Text>
                      <Text style={{ color: muted, fontSize: 13, marginHorizontal: 6 }}>•</Text>
                      <Text style={{ color: muted, fontSize: 13 }}>{fac.floor}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={cyan} />
                  )}
                </View>
              </AnimatedSelectionCard>
            );
          })}
          </>
        )}

        {/* STEP 3: SCHEDULE */}
        {step === 2 && (
          <>
            <Text style={styles.sectionHeader}>Select Date & Time</Text>
            <Card>
              <Text style={styles.inputLabel}>Desired Date *</Text>
              <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 16, backgroundColor: '#FFFFFF' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <TouchableOpacity onPress={handlePrevMonth}><Ionicons name="chevron-back" size={20} color={muted} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setPickerYear(viewDate.getFullYear()); setShowMonthYearPicker(true); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: ink, marginRight: 4 }}>{currentMonthName} {currentYear}</Text>
                    <Ionicons name="caret-down" size={14} color={ink} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextMonth}><Ionicons name="chevron-forward" size={20} color={muted} /></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <Text key={day} style={{ width: 32, textAlign: 'center', color: muted, fontSize: 12, fontWeight: '600' }}>{day}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <View key={`empty-${i}`} style={{ width: '14.28%', height: 40 }} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonthName} ${day}, ${currentYear}`;
                    const isSelected = selectedDate === dateStr;
                    return (
                      <TouchableOpacity 
                        key={day}
                        style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => setSelectedDate(dateStr)}
                      >
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isSelected ? cyan : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
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
                    {availableTimes.map((t, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={{ width: '31%', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: selectedTime === t ? cyan : '#E2E8F0', backgroundColor: selectedTime === t ? '#E8F6FA' : '#F8FAFC', alignItems: 'center' }}
                        onPress={() => setSelectedTime(t)}
                      >
                        <Text style={{ color: selectedTime === t ? cyan : ink, fontWeight: '700', fontSize: 12 }}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </Card>

            <Modal visible={showMonthYearPicker} transparent={true} animationType="fade" onRequestClose={() => setShowMonthYearPicker(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => setPickerYear(prev => prev - 1)} style={{ padding: 8 }}>
                      <Ionicons name="chevron-back" size={24} color={ink} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: ink }}>{pickerYear}</Text>
                    <TouchableOpacity onPress={() => setPickerYear(prev => prev + 1)} style={{ padding: 8 }}>
                      <Ionicons name="chevron-forward" size={24} color={ink} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {monthNames.map((month, index) => {
                      const isSelected = viewDate.getMonth() === index && viewDate.getFullYear() === pickerYear;
                      return (
                        <TouchableOpacity
                          key={month}
                          style={{ width: '30%', paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: isSelected ? cyan : '#F8FAFC', borderWidth: 1, borderColor: isSelected ? cyan : '#E2E8F0', marginBottom: 10 }}
                          onPress={() => {
                            setViewDate(new Date(pickerYear, index, 1));
                            setShowMonthYearPicker(false);
                          }}
                        >
                          <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontWeight: isSelected ? '700' : '500', fontSize: 13 }}>{month.substring(0, 3)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 }}
                    onPress={() => setShowMonthYearPicker(false)}
                  >
                    <Text style={{ color: muted, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}

        {/* STEP 4: DETAILS (was STEP 5) */}
        {step === 3 && (
          <>
            <Text style={styles.sectionHeader}>Consultation Details</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chief Complaint *</Text>
                <TextInput 
                  style={[styles.textInput, { height: 80, paddingTop: 12 }]} 
                  placeholder="What brings you in today?" 
                  placeholderTextColor="#94A3B8" 
                  multiline 
                  value={chiefComplaint}
                  onChangeText={setChiefComplaint}
                />
              </View>

              <Text style={styles.inputLabel}>Symptoms (Select all that apply)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {allSymptoms.map((sym, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: selectedSymptoms.includes(sym) ? cyan : '#E2E8F0', backgroundColor: selectedSymptoms.includes(sym) ? cyan : '#F8FAFC' }}
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
                  placeholder="Any additional information you'd like the doctor to know" 
                  placeholderTextColor="#94A3B8" 
                  multiline 
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </Card>
          </>
        )}

        {/* STEP 5: REVIEW (was STEP 6) */}
        {step === 4 && (
          <>
            <Text style={styles.sectionHeader}>Review Your Appointment</Text>
            <Card>
              <Text style={styles.detailLabel}>Doctor</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{selectedDoctor?.init}</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>{selectedDoctor?.name}</Text>
                  <Text style={styles.bodyText}>{selectedDoctor?.spec}</Text>
                </View>
              </View>

              <Text style={styles.detailLabel}>Location</Text>
              <View style={{ marginTop: 4, marginBottom: 16 }}>
                <Text style={[styles.bodyText, { color: ink, fontWeight: '700' }]}>{selectedFacility?.name}</Text>
                <Text style={[styles.bodyText, { color: ink }]}>{selectedFacility?.address}</Text>
                <Text style={[styles.bodyText, { color: ink }]}>{selectedFacility?.room} • {selectedFacility?.floor}</Text>
              </View>

              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={[styles.bodyText, { color: ink, marginTop: 4 }]}>{selectedDate}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={[styles.bodyText, { color: ink, marginTop: 4 }]}>{selectedTime}</Text>
                </View>
              </View>

              <View style={{ marginTop: 16, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16, marginBottom: 16 }}>
                <Text style={styles.detailLabel}>Patient</Text>
                <Text style={[styles.bodyText, { color: ink, marginTop: 4, fontWeight: '600' }]}>{fullName}</Text>
                <Text style={[styles.bodyText, { color: ink }]}>{age} years old • {gender}</Text>
                <Text style={[styles.bodyText, { color: ink }]}>{contactNumber}</Text>
              </View>

              <View style={{ borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16, marginBottom: 16 }}>
                <Text style={styles.detailLabel}>Chief Complaint</Text>
                <Text style={[styles.bodyText, { color: ink, marginBottom: 12, marginTop: 4 }]}>{chiefComplaint}</Text>
                
                <Text style={styles.detailLabel}>Symptoms</Text>
                <Text style={[styles.bodyText, { color: ink, marginBottom: 12, marginTop: 4 }]}>{selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None'}</Text>

                <Text style={styles.detailLabel}>Additional Notes</Text>
                <Text style={[styles.bodyText, { color: ink, marginTop: 4 }]}>{notes || 'None'}</Text>
              </View>

              <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0' }}>
                <Text style={{ color: '#166534', fontWeight: '800', fontSize: 15, marginBottom: 8 }}>Important Reminders</Text>
                <Text style={{ color: '#15803D', fontSize: 13, marginBottom: 4 }}>• Please arrive 15 minutes before your appointment</Text>
                <Text style={{ color: '#15803D', fontSize: 13, marginBottom: 4 }}>• Bring a valid ID and PhilHealth card (if applicable)</Text>
                <Text style={{ color: '#15803D', fontSize: 13, marginBottom: 4 }}>• Wear a face mask inside the clinic</Text>
                <Text style={{ color: '#15803D', fontSize: 13 }}>• You will receive a confirmation SMS with appointment details</Text>
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
            style={{ height: 48, paddingHorizontal: 32, borderRadius: 8, backgroundColor: isNextDisabled ? '#CBD5E1' : cyan, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setStep(step + 1)}
            disabled={isNextDisabled}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={{ height: 48, paddingHorizontal: 32, borderRadius: 8, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => {
              const newAppt = {
                id: Date.now().toString(),
                doctor: selectedDoctor?.name,
                specialty: selectedDoctor?.spec,
                status: 'Confirmed',
                date: selectedDate,
                time: selectedTime,
                type: 'Clinic Visit',
                color: '#089FB4',
                actions: ['Message']
              };
              
              setStep(0);
              setSearchQuery('');
              setSelectedDoctor(null);
              setSelectedFacility(null);
              setSelectedDate('');
              setSelectedTime(null);
              setViewDate(new Date());
              setShowMonthYearPicker(false);
              setPickerYear(new Date().getFullYear());
              setChiefComplaint('');
              setSelectedSymptoms([]);
              setNotes('');
              
              navigation.navigate('Appointments', { newAppointment: newAppt });
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ConsultationIntakeScreen({ navigation, route }) {
  const scrollViewRef = useRef(null);
  const consultationType = route.params?.type || 'Consultation';
  const [mainConcern, setMainConcern] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [bodyView, setBodyView] = useState('Front');
  const [selectedBodyParts, setSelectedBodyParts] = useState([]);
  const [duration, setDuration] = useState('');
  const [painLevel, setPainLevel] = useState(0);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setMainConcern('');
      setSelectedSymptoms([]);
      setOtherSymptoms('');
      setBodyView('Front');
      setSelectedBodyParts([]);
      setDuration('');
      setPainLevel(0);
      setAttachments([]);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Body Pain', 'Dizziness', 'Chest Pain', 
    'Sore Throat', 'Nausea', 'Fatigue', 'Shortness of Breath', 'Stomach Pain', 'Loss of Appetite'
  ];

  const frontBodyParts = [
    { id: 'Head', isCircle: true, cx: 100, cy: 30, r: 22 },
    { id: 'Neck', isRect: true, x: 90, y: 55, w: 20, h: 15 },
    { id: 'Chest', isRect: true, x: 60, y: 73, w: 80, h: 45, rx: 10 },
    { id: 'Abdomen', isRect: true, x: 65, y: 121, w: 70, h: 50, rx: 10 },
    { id: 'Pelvis', isRect: true, x: 65, y: 174, w: 70, h: 30, rx: 10 },
    { id: 'Right Arm', isRect: true, x: 30, y: 73, w: 25, h: 100, rx: 12 }, // visual left
    { id: 'Left Arm', isRect: true, x: 145, y: 73, w: 25, h: 100, rx: 12 },  // visual right
    { id: 'Right Leg', isRect: true, x: 65, y: 207, w: 30, h: 110, rx: 12 }, // visual left
    { id: 'Left Leg', isRect: true, x: 105, y: 207, w: 30, h: 110, rx: 12 }, // visual right
  ];

  const backBodyParts = [
    { id: 'Back of Head', isCircle: true, cx: 100, cy: 30, r: 22 },
    { id: 'Neck (Back)', isRect: true, x: 90, y: 55, w: 20, h: 15 },
    { id: 'Upper Back', isRect: true, x: 60, y: 73, w: 80, h: 45, rx: 10 },
    { id: 'Lower Back', isRect: true, x: 65, y: 121, w: 70, h: 50, rx: 10 },
    { id: 'Glutes', isRect: true, x: 65, y: 174, w: 70, h: 30, rx: 10 },
    { id: 'Left Back Arm', isRect: true, x: 30, y: 73, w: 25, h: 100, rx: 12 }, // visual left
    { id: 'Right Back Arm', isRect: true, x: 145, y: 73, w: 25, h: 100, rx: 12 }, // visual right
    { id: 'Left Hamstring', isRect: true, x: 65, y: 207, w: 30, h: 50, rx: 10 },
    { id: 'Right Hamstring', isRect: true, x: 105, y: 207, w: 30, h: 50, rx: 10 },
    { id: 'Left Calf', isRect: true, x: 65, y: 260, w: 30, h: 57, rx: 10 },
    { id: 'Right Calf', isRect: true, x: 105, y: 260, w: 30, h: 57, rx: 10 },
  ];

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const toggleBodyPart = (part) => {
    if (selectedBodyParts.includes(part)) {
      setSelectedBodyParts(selectedBodyParts.filter(p => p !== part));
    } else {
      setSelectedBodyParts([...selectedBodyParts, part]);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      setAttachments([...attachments, ...newUris]);
    }
  };

  const isProceedDisabled = !mainConcern.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Consultation Intake Form" subtitle={`${consultationType} • Help us understand your health concern to provide better care`} icon="document-text-outline" navigation={navigation} />
      
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 40 }]} keyboardShouldPersistTaps="handled">
        
        <Card>
          <Text style={styles.inputLabel}>What is your main concern? *</Text>
          <TextInput 
            style={[styles.textInput, { height: 80, paddingTop: 12 }]} 
            placeholder="Describe your concern briefly (e.g., 'I have a persistent cough for 3 days with mild fever')" 
            placeholderTextColor="#94A3B8" 
            multiline 
            value={mainConcern}
            onChangeText={setMainConcern}
          />
          <Text style={{ fontSize: 11, color: muted, marginTop: 6 }}>This helps the doctor prepare for your consultation</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Common Symptoms</Text>
          <Text style={[styles.bodyText, { marginBottom: 12 }]}>Select all that apply</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {commonSymptoms.map((sym, idx) => (
              <TouchableOpacity key={idx} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: selectedSymptoms.includes(sym) ? cyan : '#E2E8F0', backgroundColor: selectedSymptoms.includes(sym) ? cyan : '#F8FAFC' }} onPress={() => toggleSymptom(sym)}>
                <Text style={{ color: selectedSymptoms.includes(sym) ? '#FFFFFF' : muted, fontSize: 12, fontWeight: '600' }}>{sym}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.cardTitle}>Other Symptoms</Text>
          <Text style={[styles.bodyText, { marginBottom: 12 }]}>Add any symptoms not listed above</Text>
          <TextInput style={[styles.textInput, { height: 60, paddingTop: 12 }]} placeholder="e.g., Rash on arms, numbness in fingers, etc." placeholderTextColor="#94A3B8" multiline value={otherSymptoms} onChangeText={setOtherSymptoms} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Pain Location</Text>
          <Text style={[styles.bodyText, { marginBottom: 16 }]}>Click on the body areas where you feel pain or discomfort</Text>
          
          <View style={[styles.segmentRow, { marginBottom: 16 }]}>
            {['Front', 'Back'].map((view) => (
              <TouchableOpacity key={view} style={[styles.segment, bodyView === view && styles.segmentActive]} onPress={() => setBodyView(view)}>
                <Text style={[styles.segmentText, bodyView === view && styles.segmentTextActive]}>{view} View</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
            <Svg width="200" height="320" viewBox="0 0 200 320" style={{ marginBottom: 16 }}>
              {(bodyView === 'Front' ? frontBodyParts : backBodyParts).map(part => {
                const isSelected = selectedBodyParts.includes(part.id);
                return <AnimatedBodyPart key={part.id} part={part} isSelected={isSelected} onPress={() => toggleBodyPart(part.id)} />;
              })}
            </Svg>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {(bodyView === 'Front' ? frontBodyParts : backBodyParts).map(part => (
                <TouchableOpacity key={part.id} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: selectedBodyParts.includes(part.id) ? '#EF4444' : '#CBD5E1', backgroundColor: selectedBodyParts.includes(part.id) ? '#FEF2F2' : '#FFFFFF' }} onPress={() => toggleBodyPart(part.id)}>
                  <Text style={{ color: selectedBodyParts.includes(part.id) ? '#EF4444' : ink, fontSize: 12, fontWeight: '600' }}>{part.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Additional Details (Optional)</Text>
          
          <Text style={styles.inputLabel}>Duration (Days)</Text>
          <TextInput style={[styles.textInput, { marginBottom: 20 }]} placeholder="e.g. 5" placeholderTextColor="#94A3B8" keyboardType="numeric" value={duration} onChangeText={setDuration} />

          <Text style={styles.inputLabel}>Pain/Discomfort Severity: {painLevel > 0 ? `${painLevel}/10` : 'None'}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 4 }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const level = i + 1;
              const isSelected = painLevel >= level;
              // Simple color gradient from green to red
              const color = level <= 3 ? '#10B981' : level <= 7 ? '#F59E0B' : '#EF4444';
              return (
                <TouchableOpacity key={level} style={{ flex: 1, height: 32, marginHorizontal: 2, borderRadius: 4, backgroundColor: isSelected ? color : '#F1F5F9', borderWidth: isSelected ? 0 : 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }} onPress={() => setPainLevel(level)}>
                  <Text style={{ color: isSelected ? '#FFFFFF' : muted, fontSize: 12, fontWeight: '800' }}>{level}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 11, color: muted, fontWeight: '600' }}>Mild</Text>
            <Text style={{ fontSize: 11, color: muted, fontWeight: '600' }}>Moderate</Text>
            <Text style={{ fontSize: 11, color: muted, fontWeight: '600' }}>Severe</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Attachments (Optional)</Text>
          <Text style={[styles.bodyText, { marginBottom: 16 }]}>Upload images of rashes, prescriptions, lab results, etc.</Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: attachments.length > 0 ? 12 : 0 }}>
            {attachments.map((uri, idx) => (
              <View key={idx} style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <TouchableOpacity style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 2 }} onPress={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: cyan, borderStyle: 'dashed', backgroundColor: '#F8FCFF', alignItems: 'center', justifyContent: 'center' }} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color={cyan} />
              <Text style={{ fontSize: 10, color: cyan, fontWeight: '700', marginTop: 4 }}>Upload</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 11, color: muted, marginTop: 4 }}>(PNG, JPG up to 10MB each)</Text>
        </Card>

        <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 24 }}>
          <Text style={{ color: '#166534', fontWeight: '800', fontSize: 15, marginBottom: 8 }}>Important Information</Text>
          <Text style={{ color: '#15803D', fontSize: 13, marginBottom: 4 }}>• A doctor will review your intake before the consultation</Text>
          <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>• In case of emergency, please call 911 or go to the nearest ER</Text>
        </View>

        <View style={{ paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 8 }}>
          <PrimaryButton 
            label="Proceed to Consultation" 
            disabled={isProceedDisabled} 
            color={isProceedDisabled ? '#CBD5E1' : cyan} 
            onPress={() => {
              const newAppt = {
                doctor: 'Dr. Sarah Johnson',
                specialty: 'Family Medicine',
                status: 'Confirmed',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                time: 'In ~10 mins',
                type: consultationType,
                color: '#089FB4',
                chiefComplaint: mainConcern
              };
              
              // Silently save to Sails.js database in the background
              fetch(`${API_URL}/appointment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppt),
              }).catch(err => console.error('Error saving appointment:', err));

              // Navigate to Appointments screen for all consultation types
              navigation.navigate('Appointments', { newAppointment: newAppt });
            }} 
          />
          <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: muted, fontSize: 14, fontWeight: '700' }}>Save for Later</Text>
          </TouchableOpacity>
          {isProceedDisabled && <Text style={{ textAlign: 'center', fontSize: 11, color: '#EF4444', marginTop: 12 }}>Please describe your main concern to continue</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RequestReferralScreen({ navigation, route }) {
  const scrollViewRef = useRef(null);
  const initialSpecialty = route.params?.targetSpecialty || '';
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [reason, setReason] = useState('');

  // Calendar & Scheduling State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setSpecialty('');
      setReason('');
      setSelectedDate('');
      setSelectedTime(null);
      setViewDate(new Date());
      setShowMonthYearPicker(false);
      setPickerYear(new Date().getFullYear());
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handlePrevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[viewDate.getMonth()];
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentYear, viewDate.getMonth(), 1).getDay();
  const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:30 PM', '04:00 PM'];

  const quickSpecialties = ['Cardiologist', 'Dermatologist', 'Orthopedic Surgeon', 'Psychiatrist', 'Physical Therapy'];
  
  const isSubmitDisabled = !reason.trim() || !specialty.trim() || !selectedDate || !selectedTime;

  return (
    <Screen scrollViewRef={scrollViewRef} title="Request Referral" subtitle="Get a medical referral for a specialist or therapy" icon="document-text-outline" navigation={navigation}>
      
      {/* Explanation Box to avoid user confusion */}
      <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 20 }}>
        <Text style={{ color: '#166534', fontWeight: '800', fontSize: 15, marginBottom: 10 }}>How getting a referral works</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingRight: 10 }}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={{ color: '#15803D', fontSize: 13, lineHeight: 18 }}>You need an official medical referral to proceed with HMO or PhilHealth coverage.</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingRight: 10 }}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={{ color: '#15803D', fontSize: 13, lineHeight: 18 }}>Tell us what specialist you need and why.</Text>
        </View>
        <View style={{ flexDirection: 'row', paddingRight: 10 }}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={{ color: '#15803D', fontSize: 13, lineHeight: 18 }}>Schedule a brief video assessment with a General Physician to issue your referral.</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.inputLabel}>Which specialist or therapy do you need? *</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {quickSpecialties.map(s => (
            <TouchableOpacity 
              key={s} 
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: specialty === s ? cyan : '#E2E8F0', backgroundColor: specialty === s ? cyan : '#F8FAFC' }}
              onPress={() => setSpecialty(s)}
            >
              <Text style={{ color: specialty === s ? '#FFFFFF' : muted, fontSize: 12, fontWeight: '600' }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput 
          style={[styles.textInput, { marginBottom: 16 }]} 
          placeholder="Or type specialist name here..." 
          placeholderTextColor="#94A3B8" 
          value={specialty}
          onChangeText={setSpecialty}
        />

        <Text style={styles.inputLabel}>Why do you need this referral? *</Text>
        <TextInput 
          style={[styles.textInput, { height: 100, paddingTop: 12, marginBottom: 20 }]} 
          placeholder="Briefly describe your symptoms or reason..." 
          placeholderTextColor="#94A3B8" 
          multiline 
          value={reason}
          onChangeText={setReason}
        />

        <Text style={[styles.inputLabel, { marginBottom: 12 }]}>Schedule GP Assessment *</Text>
        <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 16, backgroundColor: '#FFFFFF' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={handlePrevMonth}><Ionicons name="chevron-back" size={20} color={muted} /></TouchableOpacity>
            <TouchableOpacity onPress={() => { setPickerYear(viewDate.getFullYear()); setShowMonthYearPicker(true); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: ink, marginRight: 4 }}>{currentMonthName} {currentYear}</Text>
              <Ionicons name="caret-down" size={14} color={ink} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMonth}><Ionicons name="chevron-forward" size={20} color={muted} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <Text key={day} style={{ width: 32, textAlign: 'center', color: muted, fontSize: 12, fontWeight: '600' }}>{day}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={{ width: '14.28%', height: 40 }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonthName} ${day}, ${currentYear}`;
              const isSelected = selectedDate === dateStr;
              return (
                <TouchableOpacity 
                  key={day}
                  style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isSelected ? cyan : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontSize: 14, fontWeight: isSelected ? '700' : '500' }}>{day}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedDate?.length > 0 && (
          <>
            <Text style={[styles.cardTitle, { marginTop: 4, marginBottom: 12 }]}>Available Times</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {availableTimes.map((t, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={{ width: '31%', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: selectedTime === t ? cyan : '#E2E8F0', backgroundColor: selectedTime === t ? '#E8F6FA' : '#F8FAFC', alignItems: 'center' }}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={{ color: selectedTime === t ? cyan : ink, fontWeight: '700', fontSize: 12 }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </Card>

      <View style={{ paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 8 }}>
        <PrimaryButton 
          label="Submit Referral Request" 
          disabled={isSubmitDisabled} 
          color={isSubmitDisabled ? '#CBD5E1' : cyan} 
          onPress={() => {
            const isTherapy = specialty.toLowerCase().includes('therapy');
            const newReq = {
              id: Date.now().toString(),
              title: `Referral to ${specialty}`,
              subtitle: 'Requested via Referral Form',
              reason: reason,
              date: selectedDate,
              actionType: isTherapy ? 'BookTherapy' : 'BookSpecialist',
              specialty: specialty
            };
            
            navigation.navigate('Dashboard', { newReferralRequest: newReq });
          }} 
        />
      </View>

      <Modal visible={showMonthYearPicker} transparent={true} animationType="fade" onRequestClose={() => setShowMonthYearPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setPickerYear(prev => prev - 1)} style={{ padding: 8 }}>
                <Ionicons name="chevron-back" size={24} color={ink} />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '800', color: ink }}>{pickerYear}</Text>
              <TouchableOpacity onPress={() => setPickerYear(prev => prev + 1)} style={{ padding: 8 }}>
                <Ionicons name="chevron-forward" size={24} color={ink} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {monthNames.map((month, index) => {
                const isSelected = viewDate.getMonth() === index && viewDate.getFullYear() === pickerYear;
                return (
                  <TouchableOpacity
                    key={month}
                    style={{ width: '30%', paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: isSelected ? cyan : '#F8FAFC', borderWidth: 1, borderColor: isSelected ? cyan : '#E2E8F0', marginBottom: 10 }}
                    onPress={() => {
                      setViewDate(new Date(pickerYear, index, 1));
                      setShowMonthYearPicker(false);
                    }}
                  >
                    <Text style={{ color: isSelected ? '#FFFFFF' : ink, fontWeight: isSelected ? '700' : '500', fontSize: 13 }}>{month.substring(0, 3)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={{ marginTop: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 }}
              onPress={() => setShowMonthYearPicker(false)}
            >
              <Text style={{ color: muted, fontWeight: '700', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

export function MessagesScreen({ navigation, route }) {
  const [activeChatId, setActiveChatId] = useState(null);
  const activeChatIdRef = useRef(activeChatId);
  const scrollViewRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123'; // Use mock data if no user is logged in, or if it's the mock user

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const pickAttachment = () => {
    Alert.alert(
      'Attach a file',
      'Choose where to select your file from:',
      [
        {
          text: 'Select from Gallery',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
              });

              if (!result.canceled) {
                const asset = result.assets[0];
                setAttachment({
                  uri: asset.uri,
                  name: asset.fileName || `image_${Date.now()}.${asset.uri.split('.').pop()}`,
                  type: asset.mimeType || `image/${asset.uri.split('.').pop()}`,
                });
              }
            } catch (err) {
              console.error('Error picking image:', err);
              Alert.alert('Error', 'Could not select the image.');
            }
          },
        },
        {
          text: 'Choose a File',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all file types
              });
              if (result.canceled === false) {
                const asset = result.assets[0];
                setAttachment({
                  uri: asset.uri,
                  name: asset.name,
                  type: asset.mimeType,
                });
              }
            } catch (err) {
              console.error('Error picking document:', err);
              Alert.alert('Error', 'Could not pick the file.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setActiveChatId(null);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route?.params?.chatId) {
      setActiveChatId(route.params.chatId);
      navigation.setParams({ chatId: undefined }); // Clear param so back navigation works smoothly
    } else if (route?.params?.doctorName) {
      const docName = route.params.doctorName;
      setConversations(prev => {
        const existingChat = prev.find(c => c.name === docName);
        if (existingChat) {
          setTimeout(() => setActiveChatId(existingChat.id), 0);
          return prev;
        }
        
        const newChatId = Date.now().toString();
        let initials = 'DR';
        const nameParts = docName.split(' ').filter(w => !w.toLowerCase().includes('dr') && !w.toLowerCase().includes('dr.'));
        if (nameParts.length >= 2) {
          initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
          initials = nameParts[0].substring(0, 2).toUpperCase();
        }

        const newChat = {
          id: newChatId,
          name: docName,
          role: 'Physician',
          avatar: initials,
          color: '#089FB4',
          unread: 0,
          isTyping: false,
          messages: [{ id: Date.now().toString(), sender: docName, text: 'Hello! How can I help you today?', time: 'Just now' }]
        };
        
        setTimeout(() => setActiveChatId(newChatId), 0);
        return [newChat, ...prev];
      });
      navigation.setParams({ doctorName: undefined });
    }
  }, [route?.params?.chatId, route?.params?.doctorName, navigation]);

  const [conversations, setConversations] = useState(isMockUser ? [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Family Medicine',
      avatar: 'SJ',
      color: '#089FB4',
      unread: 2,
      isTyping: false,
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
      isTyping: false,
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
      isTyping: false,
      messages: [
        { id: 'n1', sender: 'You', text: 'Hi Emily, I have a quick question about my wound dressing.', time: 'Monday' },
        { id: 'n2', sender: 'Nurse Emily', text: 'Sure, what seems to be the issue? Is there any redness or swelling?', time: 'Monday' },
      ]
    },
    {
      id: 'pharmacy_1',
      name: 'Pharmacy Support',
      role: 'Order Assistance',
      avatar: 'Rx',
      color: '#0AB4B5',
      unread: 0,
      isTyping: false,
      messages: [
        { id: 'rx1', sender: 'Pharmacy Support', text: 'Hello! Do you have any questions regarding your current medication orders?', time: 'Just now' },
      ]
    }
  ] : []);

  const sendMessage = () => {
    if (!inputText.trim() && !attachment) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputText,
      attachment: attachment,
      time: 'Just now'
    };

    const currentChatId = activeChatId;

    setConversations(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        return { ...chat, messages: [...chat.messages, newMessage], isTyping: true };
      }
      return chat;
    }));
    setInputText('');
    setAttachment(null);

    setTimeout(() => {
      setConversations(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const isChatStillOpen = activeChatIdRef.current === currentChatId;
          const autoReply = {
            id: Date.now().toString(),
            sender: chat.name,
            text: chat.id === 'pharmacy_1' 
              ? "Thanks for reaching out! A pharmacist will review your request and get back to you momentarily."
              : "Thank you for your message. I will review it and get back to you as soon as possible.",
            time: 'Just now'
          };
          return { ...chat, messages: [...chat.messages, autoReply], unread: isChatStillOpen ? chat.unread : (chat.unread || 0) + 1, isTyping: false };
        }
        return chat;
      }));
    }, 2000);
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
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
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatScrollArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
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
                {msg.attachment && (
                  msg.attachment.type?.startsWith('image/') ? (
                    <Image 
                      source={{ uri: msg.attachment.uri }} 
                      style={{ width: 200, height: 200, borderRadius: 10, marginBottom: msg.text ? 8 : 0 }} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: msg.text ? 8 : 0 }}>
                      <Ionicons name="document-attach-outline" size={24} color={isMine ? '#FFFFFF' : ink} style={{ marginRight: 8 }} />
                      <View>
                        <Text style={[styles.chatText, isMine ? styles.chatMineText : styles.chatOtherText, { fontWeight: '700' }]} numberOfLines={1}>
                          {msg.attachment.name}
                        </Text>
                        <Text style={[styles.chatTime, isMine ? styles.chatMineTime : styles.chatOtherTime, { marginTop: 2 }]}>
                          File Attachment
                        </Text>
                      </View>
                    </View>
                  )
                )}
                {!!msg.text && <Text style={[styles.chatText, isMine ? styles.chatMineText : styles.chatOtherText]}>{msg.text}</Text>}
                <Text style={[styles.chatTime, isMine ? styles.chatMineTime : styles.chatOtherTime]}>{msg.time}</Text>
              </View>
            </View>
          );
        })}
        {activeChat.isTyping && (
          <View style={[styles.messageWrapper, styles.messageWrapperOther]}>
            <View style={[styles.chatAvatarTiny, { backgroundColor: activeChat.color }]}>
              <Text style={styles.chatAvatarTextTiny}>{activeChat.avatar}</Text>
            </View>
            <View style={[styles.chatBubble, styles.chatBubbleOther]}>
              <Text style={[styles.chatText, styles.chatOtherText, { fontStyle: 'italic' }]}>Typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Message Composer */}
      <View>
        {attachment && (
          <View style={styles.attachmentPreview}>
            <Ionicons name="document-attach-outline" size={20} color={muted} style={{ marginRight: 8 }} />
            <Text style={styles.attachmentPreviewText} numberOfLines={1}>{attachment.name}</Text>
            <TouchableOpacity onPress={() => setAttachment(null)} style={{ padding: 4, marginLeft: 'auto' }}>
              <Ionicons name="close-circle" size={20} color={muted} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.messageComposer}>
          <TouchableOpacity style={styles.attachmentButton} onPress={pickAttachment}>
            <Ionicons name="attach" size={24} color="#64748B" />
          </TouchableOpacity>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            style={styles.messageInput}
            placeholder="Message..."
            placeholderTextColor="#94A3B8"
            multiline
          />
          <TouchableOpacity style={[styles.sendButton, !inputText.trim() && !attachment && { backgroundColor: '#CBD5E1' }]} onPress={sendMessage} disabled={!inputText.trim() && !attachment}>
            <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function CallDoctorScreen({ navigation, route }) {
  return (
    <Screen title="Call Doctor" subtitle="Choose a physician contact option" icon="call-outline" navigation={navigation}>
      <Card style={styles.heroCard}>
        <View style={styles.bigIcon}><Ionicons name="call" size={32} color="#FFFFFF" /></View>
        <Text style={styles.largeTitle}>Speak to a physician</Text>
        <Text style={styles.bodyText}>Connect with an available doctor or schedule a callback from your care team.</Text>
        <PrimaryButton label="Call Now" icon="call" color="#10B981" onPress={() => navigation.navigate('JoinVideoCall', { doctorName: 'On-call Physician' })} />
      </Card>
      {['Family Medicine', 'Urgent Care', 'Nurse Triage'].map((title) => (
        <TouchableOpacity key={title} onPress={() => navigation.navigate('JoinVideoCall', { doctorName: title })}>
          <Card style={styles.listRow}>
            <View style={styles.rowIcon}><Ionicons name="call-outline" size={20} color={cyan} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.bodyText}>Average wait 5-10 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

export function JoinVideoCallScreen({ navigation, route }) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const doctorName = route.params?.doctorName || 'Dr. Sarah Johnson';

  return (
    <Screen title="Video Call" subtitle={doctorName} icon="videocam-outline" navigation={navigation}>
      <View style={styles.videoPreview}>
        <Ionicons name={cameraOff ? 'videocam-off-outline' : 'person-circle-outline'} size={90} color="#BDEAF0" />
        <Text style={styles.videoTitle}>Waiting Room</Text>
        <Text style={styles.videoSub}>
          {doctorName === 'On-call Physician'
            ? 'Connecting you to the next available doctor...'
            : `Your doctor will join at 2:30 PM.`}
        </Text>
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

const mockReferralsData = [
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

export function MedicalRecordsScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.initialCategory || 'Consultation History');
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

  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123'; // Use mock data if no user is logged in, or if it's the mock user

  const consultationHistory = isMockUser ? [
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
  ] : [];

  const prescriptionsList = isMockUser ? [
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
  ] : [];

  const labRequestsList = isMockUser ? [
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
  ] : [];

  const medicalCertificatesList = isMockUser ? [
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
  ] : [];

  const treatmentPlansList = isMockUser ? [
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
  ] : [];

  const [referralsList, setReferralsList] = useState(isMockUser ? mockReferralsData : []);

  useEffect(() => {
    const loadData = () => {
      const isCurrentlyMockUser = !currentUser || currentUser?.id === 'mock-user-123';

      if (!currentUser?.id) {
        // Clear all data if logged out
        setReferralsList([]);
        // ... clear other data lists here
        return;
      }

      if (isCurrentlyMockUser) {
        // Set mock data for mock user
        setReferralsList(mockReferralsData);
        // ... set other mock data lists here
        return;
      }

      // Fetch referrals when the screen is focused
      fetch(`${API_URL}/referral?user=${currentUser.id}`)
        .then(res => res.ok ? res.json() : Promise.resolve([]))
        .then(data => {
          if (data && Array.isArray(data)) {
            setReferralsList(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
          } else {
            setReferralsList([]);
          }
        })
        .catch(err => {
          console.error('Error fetching referrals for Medical Records:', err);
          setReferralsList([]);
        });
      
      // Note: Fetches for other categories like prescriptions, labs, etc., would go here
      // to replace their respective mock data when a real user is logged in.
    };

    const unsubscribe = navigation.addListener('focus', loadData);
    loadData(); // Initial load

    return unsubscribe;
  }, [navigation]);

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
                  <TouchableOpacity style={[styles.outlineButton, { flex: 0, paddingHorizontal: 12, height: 32 }]} onPress={() => {
                    const details = `Type: ${item.type}\nDate: ${item.date} at ${item.time}\nDuration: ${item.duration}\n\nChief Complaint:\n${item.complaint}\n\nStatus: ${item.status}`;
                    Alert.alert(`Details for Dr. ${item.doctor}`, details);
                  }}>
                    <Text style={[styles.outlineButtonText, { fontSize: 12 }]}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 0, paddingHorizontal: 12, height: 32 }]} onPress={() => navigation.navigate('Messages', { doctorName: item.doctor })}>
                    <Text style={[styles.outlineButtonText, { fontSize: 12 }]}>View Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 0, paddingHorizontal: 12, height: 32 }]} onPress={() => handleDownload('Consultation Summary')}>
                    <Text style={[styles.outlineButtonText, { fontSize: 12 }]}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 0, paddingHorizontal: 12, height: 32 }]} onPress={() => {
                    const subject = `Medical Record Summary for ${item.date}`;
                    const body = `Hello,\n\nPlease find a summary of my consultation on ${item.date} with ${item.doctor}:\n\n- Type: ${item.type}\n- Complaint: ${item.complaint}\n- Status: ${item.status}\n\nThank you.`;
                    Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}>
                    <Text style={[styles.outlineButtonText, { fontSize: 12 }]}>Email</Text>
                  </TouchableOpacity>
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
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => {
                    const details = `Prescriber: ${item.doctor}\nIssued On: ${item.issuedOn}\nStatus: ${item.status}\nValid Until: ${item.validUntil}\n\nMedications:\n${item.medications.map(med => `• ${med}`).join('\n')}`;
                    Alert.alert('Prescription Details', details);
                  }}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => handleDownload('Prescription')}>
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
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => {
                    const details = `Requested by: ${item.doctor}\nTest(s): ${item.test}\nDate: ${item.date}\nStatus: ${item.status}\nLocation: ${item.location}`;
                    Alert.alert('Lab Request Details', details);
                  }}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Details</Text>
                  </TouchableOpacity>
                  {item.status === 'Completed' && (
                    <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => handleDownload('Lab Results')}>
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
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => {
                    const details = `Issued by: ${item.doctor}\nPurpose: ${item.purpose}\nDate: ${item.date}\nDuration: ${item.duration}`;
                    Alert.alert('Medical Certificate Details', details);
                  }}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Certificate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => handleDownload('Medical Certificate')}>
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
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => {
                    const details = `Plan: ${item.plan}\nDoctor: ${item.doctor} (${item.specialty})\nStart Date: ${item.startDate}\nNext Review: ${item.nextReview}\nStatus: ${item.status}`;
                    Alert.alert('Treatment Plan Details', details);
                  }}>
                    <Ionicons name="eye-outline" size={16} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={styles.outlineButtonText}>View Plan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => handleDownload('Prescription')}>
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
                    <TouchableOpacity 
                      style={[{ backgroundColor: '#F59E0B', borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, height: 36, flex: 1 }]}
                      onPress={() => navigation.navigate('BookSpecialist', { preselectedDoctor: item.referredTo })}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Book Appointment</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.outlineButton, { flex: 1, flexDirection: 'row' }]} onPress={() => {
                    const details = `From: ${item.doctor}\nTo: ${item.referredTo} (${item.specialty})\nDate: ${item.date}\nReason: ${item.reason}\nStatus: ${item.status}${item.notes ? `\n\nNotes:\n${item.notes}` : ''}`;
                    Alert.alert('Referral Details', details);
                  }}>
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
    ['Medical Certificate', '₱350'],
    ['Medical Clearance', '₱450'],
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
            <Text style={styles.totalAmount}>₱800</Text>
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
            <Text style={styles.invoiceAmount}>₱800</Text>
          </View>
          <View style={[styles.invoiceRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.cardTitle}>Amount Due</Text>
            <Text style={styles.totalAmount}>₱800</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Actions</Text>
        <PrimaryButton
          label="Pay Now"
          icon="card"
          color="#F59E0B"
          onPress={() =>
            Alert.alert(
              'Confirm Payment',
              'You are about to pay ₱800. Do you want to proceed?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Pay',
                  onPress: () => navigation.navigate('PaymentSuccess'),
                },
              ],
            )
          }
        />
        <TouchableOpacity style={[styles.outlineButton, { marginTop: 12 }]} onPress={() => handleDownload('invoice')}>
          <Text style={styles.outlineButtonText}>Download Invoice PDF</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
}

const handleDownload = (docType) => {
  Alert.alert(
    'Download Started',
    `Your ${docType} is being downloaded. You will be notified upon completion.`,
    [{ text: 'OK' }],
  );
};

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
            <Text style={[styles.invoiceAmount, { color: '#10B981', fontSize: 18 }]}>₱800.00</Text>
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
        <TouchableOpacity style={[styles.outlineButton, { marginTop: 12, flexDirection: 'row' }]} onPress={() => Alert.alert('Download', 'This would generate and download a PDF of the receipt.')}>
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
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123';

  const mockSharingRequests = [
    { doc: 'Dr. Maria Santos', spec: 'Cardiologist', reason: 'Heart Condition follow-up' },
    { doc: 'Dr. James Chen', spec: 'Orthopedic Surgeon', reason: 'Knee Pain assessment' },
    { doc: 'Dr. Sofia Reyes', spec: 'Dermatologist', reason: 'Skin condition review' },
  ];

  const sharingRequests = isMockUser ? mockSharingRequests : [];

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
    
      <Text style={styles.sectionHeader}>Sharing Requests</Text>
      {sharingRequests.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 24, marginBottom: 24 }}>
          <Ionicons name="people-outline" size={30} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <Text style={styles.cardTitle}>No Sharing Requests</Text>
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 4 }]}>
            Doctors who request access to your records will appear here.
          </Text>
        </Card>
      ) : (
        sharingRequests.map((item, index) => (
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
        ))
      )}

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
              <TouchableOpacity
                style={[styles.outlineButton, { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }]}
                onPress={() =>
                  Alert.alert('Shared Records', `You have shared ${lastShareActivity.count} record types with ${lastShareActivity.doctor}. Access is for: ${lastShareActivity.access}.`)
                }
              >
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

export function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const canSubmit = password.length > 0 && passwordsMatch;

  const handleReset = () => {
    // Note: In a full production app, you would send the new password to a backend endpoint here!
    Alert.alert('Success', 'Your password has been successfully reset. Please sign in with your new password.', [
      { text: 'OK', onPress: () => navigation.navigate('Auth') }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, styles.authWrapper]}>
      <StatusBar barStyle="dark-content" backgroundColor={bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.authHeader}>
            <View style={styles.authLogoBox}>
              <Text style={styles.authLogoText}>O+</Text>
            </View>
            <Text style={styles.authTitle}>Reset Password</Text>
            <Text style={styles.authSubtitle}>Create a new secure password</Text>
          </View>

          <Card style={styles.authCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password *</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput style={[styles.textInput, { paddingRight: 40 }]} placeholder="Enter new password" placeholderTextColor="#94A3B8" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={muted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput style={[styles.textInput, !passwordsMatch && confirmPassword.length > 0 && { borderColor: '#EF4444' }, { paddingRight: 40 }]} placeholder="Confirm new password" placeholderTextColor="#94A3B8" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 14 }}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={muted} />
                </TouchableOpacity>
              </View>
              {(!passwordsMatch && confirmPassword.length > 0) && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Passwords do not match.</Text>}
            </View>

            <PrimaryButton label="Reset Password" icon="checkmark-circle-outline" color={canSubmit ? cyan : '#CBD5E1'} disabled={!canSubmit} onPress={handleReset} />

            <TouchableOpacity style={styles.authToggle} onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.authToggleText}>Remembered it? <Text style={{ color: cyan, fontWeight: '800' }}>Sign In</Text></Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function RenewalRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`${API_URL}/renewalrequest?user=${currentUser.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status} - ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          // Sort by newest first
          setRequests(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        }
      })
      .catch((err) => console.error('Error fetching renewal requests:', err));
  }, []);

  return (
    <Screen title="Renewal Requests" subtitle="Track your pending prescriptions" icon="sync-outline" navigation={navigation}>
      {requests.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Ionicons name="document-text-outline" size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <Text style={styles.cardTitle}>No renewal requests</Text>
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 4 }]}>You haven't requested any prescription renewals yet.</Text>
        </Card>
      ) : (
        requests.map((req, idx) => (
          <Card key={req.id || idx}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{req.medication}</Text>
              <Pill label={req.status || 'Pending'} color={req.status === 'Approved' ? '#10B981' : '#F59E0B'} />
            </View>
            <Text style={[styles.bodyText, { marginTop: 4 }]}><Text style={{ fontWeight: '700', color: ink }}>Prescriber:</Text> {req.prescriber}</Text>
            <Text style={styles.bodyText}><Text style={{ fontWeight: '700', color: ink }}>Pharmacy:</Text> {req.pharmacy || 'N/A'}</Text>
            {!!req.notes && <Text style={[styles.bodyText, { marginTop: 8 }]}><Text style={{ fontWeight: '700', color: ink }}>Notes:</Text> {req.notes}</Text>}
            {req.createdAt && <Text style={[styles.bodyText, { marginTop: 12, fontSize: 11 }]}><Text style={{ fontWeight: '700', color: ink }}>Requested on:</Text> {new Date(req.createdAt).toLocaleDateString()}</Text>}
          </Card>
        ))
      )}
    </Screen>
  );
}

export function NotificationsScreen({ navigation }) {
  const isMockUser = !currentUser || currentUser?.id === 'mock-user-123';

  const mockNotifications = [
    {
      id: '1',
      icon: 'calendar-outline',
      color: '#089FB4',
      title: 'Appointment Confirmed',
      message: 'Your video consultation with Dr. Sarah Johnson is confirmed for March 31, 2026 at 2:30 PM.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      icon: 'chatbubble-ellipses-outline',
      color: '#10B981',
      title: 'New Message',
      message: 'You have a new message from Nurse Emily regarding your recent inquiry.',
      time: 'Yesterday',
      read: false,
    }
  ];

  const [notifications, setNotifications] = useState(isMockUser ? mockNotifications : []);
  
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Navigate to relevant screen based on notification
    if (notification.title.includes('Appointment')) {
      navigation.navigate('Appointments');
    } else if (notification.title.includes('Message')) {
      navigation.navigate('Messages');
    } else if (notification.title.includes('Prescription')) {
      navigation.navigate('Prescriptions');
    } else if (notification.title.includes('Referral')) {
      navigation.navigate('MedicalRecords', { initialCategory: 'Referrals' });
    } else if (notification.title.includes('Payment')) {
      navigation.navigate('Invoice');
    }
  };

  return (
    <Screen title="Notifications" subtitle="Your recent account activity" icon="notifications-outline" navigation={navigation}>
      {notifications.length > 0 && (
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 4, marginBottom: 4 }}>
          <TouchableOpacity onPress={handleClearNotifications} activeOpacity={0.7}>
            <Text style={{ color: cyan, fontSize: 13, fontWeight: '700' }}>
              Clear Notifications
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {notifications.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Ionicons name="notifications-off-outline" size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <Text style={styles.cardTitle}>No new notifications</Text>
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 4 }]}>You're all caught up! We'll let you know when there's new activity.</Text>
        </Card>
      ) : (
        notifications.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => handleNotificationPress(item)} activeOpacity={0.7}>
            <Card style={!item.read && styles.unreadCard}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={[styles.notificationIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[styles.bodyText, { marginTop: 4, marginBottom: 8 }]}>{item.message}</Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </Screen>
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
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
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
  attachmentButton: {
    padding: 8,
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  chatMineTime: { color: 'rgba(255,255,255,0.7)' },
  chatOtherTime: { color: '#94A3B8' },
  messageComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  attachmentPreviewText: {
    color: ink,
    fontSize: 13,
    flex: 1,
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
    marginRight: 8,
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
  totalAmount: { color: ink, fontSize: 26, fontWeight: '900' },

  // --- AUTH & FORMS ---
  authWrapper: { backgroundColor: bg, paddingHorizontal: 16 },
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { color: muted, fontSize: 13, fontWeight: '600' },
  infoValue: { color: ink, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  infoValue: { flex: 1, marginLeft: 16, color: ink, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  linkIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1FAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkText: { flex: 1, color: ink, fontSize: 14, fontWeight: '700' },
  linkDivider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 60 },

  // --- REGISTRATION STYLES ---
  reg_mainContainer: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  reg_topBar: { height: 62, backgroundColor: "#fff", paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  reg_logoContainer: { flexDirection: "row", alignItems: "center" },
  reg_logoIcon: { padding: 7, borderRadius: 8, marginRight: 8 },
  reg_logoText: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  reg_logoPlus: { color: "#2563EB" },
  reg_backHomeTopText: { fontSize: 13, color: "#334155", fontWeight: "700" },
  reg_headerSection: { alignItems: "center", paddingHorizontal: 20, paddingTop: 30, paddingBottom: 24 },
  reg_title: { fontSize: 27, fontWeight: "900", color: "#020617", textAlign: "center", marginBottom: 12 },
  reg_subtitle: { fontSize: 16, color: "#334155", textAlign: "center", lineHeight: 24 },
  reg_optionCard: { backgroundColor: "#fff", marginHorizontal: 18, marginBottom: 24, paddingVertical: 30, paddingHorizontal: 22, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 3 },
  reg_optionIconBox: { width: 74, height: 74, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  reg_optionTitle: { fontSize: 19, fontWeight: "900", color: "#020617", textAlign: "center", marginBottom: 12 },
  reg_optionSubtitle: { fontSize: 13, color: "#0F172A", textAlign: "center", lineHeight: 20, marginBottom: 22 },
  reg_continueText: { fontSize: 14, color: "#2563EB", fontWeight: "700" },
  reg_infoCard: { marginHorizontal: 18, marginTop: 6, marginBottom: 32, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 12, padding: 18, flexDirection: "row", alignItems: "flex-start" },
  reg_infoIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginRight: 14 },
  reg_infoTitle: { fontSize: 16, fontWeight: "900", color: "#020617", marginBottom: 8 },
  reg_infoText: { fontSize: 13, color: "#0F172A", lineHeight: 22 },
  reg_formHeader: { alignItems: "center", paddingHorizontal: 20, paddingTop: 30, paddingBottom: 28 },
  reg_formHeaderTitle: { fontSize: 28, fontWeight: "900", color: "#020617", textAlign: "center", marginBottom: 12 },
  reg_formHeaderSubtitle: { fontSize: 16, color: "#334155", textAlign: "center", lineHeight: 24 },
  reg_registrationHero: { alignItems: "center", paddingHorizontal: 20, paddingTop: 30, paddingBottom: 28 },
  reg_heroIconBox: { width: 62, height: 62, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  reg_registrationTitle: { fontSize: 27, fontWeight: "900", color: "#020617", textAlign: "center", marginBottom: 12 },
  reg_registrationSubtitle: { fontSize: 16, color: "#334155", textAlign: "center", lineHeight: 24 },
  reg_stepRow: { flexDirection: "row", alignItems: "center", marginTop: 28 },
  reg_stepCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  reg_stepCircleText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  reg_stepLine: { width: 44, height: 4, backgroundColor: "#E5E7EB", marginHorizontal: 14 },
  reg_formCard: { backgroundColor: "#fff", marginHorizontal: 14, marginBottom: 30, padding: 22, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 3 },
  reg_formTitle: { fontSize: 20, fontWeight: "900", color: "#020617", marginBottom: 18 },
  reg_inputLabel: { fontSize: 13, fontWeight: "700", color: "#020617", marginBottom: 8, marginTop: 10 },
  reg_required: { color: "#EF4444" },
  reg_inputBox: { minHeight: 42, backgroundColor: "#F1F1F3", borderRadius: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  reg_input: { flex: 1, fontSize: 14, color: "#020617" },
  reg_divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  reg_dropdownText: { flex: 1, fontSize: 14, color: "#020617" },
  reg_dropdownList: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, marginTop: -8, marginBottom: 12, overflow: "hidden" },
  reg_dropdownItem: { paddingVertical: 12, paddingHorizontal: 14 },
  reg_dropdownItemText: { fontSize: 14, color: "#020617" },
  reg_philHealthBox: { backgroundColor: "#EFF6FF", borderRadius: 10, padding: 16, flexDirection: "row", alignItems: "flex-start", marginTop: 12, marginBottom: 18 },
  reg_childPhilHealthBox: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  reg_checkbox: { width: 17, height: 17, borderRadius: 3, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#fff", marginRight: 12, marginTop: 2, justifyContent: "center", alignItems: "center" },
  reg_checkedBox: { backgroundColor: "#020617", borderColor: "#020617" },
  reg_philHealthTitle: { fontSize: 14, fontWeight: "900", color: "#020617", marginBottom: 4 },
  reg_philHealthText: { fontSize: 13, color: "#334155", lineHeight: 20 },
  reg_fieldHint: { fontSize: 11, color: "#64748B", marginTop: -6, marginBottom: 12 },
  reg_optionalWrapper: { borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 20, marginTop: 2, marginBottom: 16 },
  reg_optionalLabel: { color: "#2563EB", fontSize: 14, fontWeight: "700" },
  reg_passwordStrengthBox: { marginTop: -4, marginBottom: 10 },
  reg_strengthHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  reg_strengthLabel: { fontSize: 12, color: "#334155" },
  reg_strengthText: { fontSize: 12, fontWeight: "800" },
  reg_segmentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  reg_strengthSegment: { flex: 1, height: 4, backgroundColor: "#E5E7EB", borderRadius: 4, marginRight: 4 },
  reg_passwordCheck: { fontSize: 12, marginBottom: 4 },
  reg_passText: { color: "#16A34A" },
  reg_failText: { color: "#94A3B8" },
  reg_confirmStatusText: { fontSize: 12, fontWeight: "800", marginTop: -4, marginBottom: 8 },
  reg_matchText: { color: "#16A34A" },
  reg_noMatchText: { color: "#DC2626" },
  reg_errorText: { color: "#DC2626", fontSize: 13, fontWeight: "700", lineHeight: 20, marginBottom: 12 },
  reg_primaryButton: { height: 46, backgroundColor: "#2563EB", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 6 },
  reg_flexButton: { flex: 1, marginLeft: 8 },
  reg_primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  reg_secondaryButton: { flex: 1, height: 46, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 8 },
  reg_secondaryButtonText: { color: "#020617", fontSize: 15, fontWeight: "800" },
  reg_twoButtons: { flexDirection: "row", marginTop: 10 },
  reg_childInfoNotice: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#86EFAC", borderRadius: 8, padding: 12, marginBottom: 24 },
  reg_familyInfoNotice: { backgroundColor: "#FAF5FF", borderWidth: 1, borderColor: "#D8B4FE", borderRadius: 8, padding: 12, marginBottom: 24 },
  reg_childInfoNoticeText: { fontSize: 13, color: "#334155", lineHeight: 20 },
  reg_childCard: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 22, marginBottom: 22 },
  reg_childCardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  reg_childTitle: { fontSize: 17, fontWeight: "900", color: "#020617" },
  reg_addChildButton: { borderWidth: 1, borderStyle: "dashed", borderColor: "#22C55E", borderRadius: 10, height: 46, justifyContent: "center", alignItems: "center", flexDirection: "row", marginBottom: 12 },
  reg_addChildText: { marginLeft: 10, fontSize: 14, color: "#16A34A", fontWeight: "800" },
  reg_addFamilyButton: { borderWidth: 1, borderStyle: "dashed", borderColor: "#C084FC", borderRadius: 10, height: 46, justifyContent: "center", alignItems: "center", flexDirection: "row", marginBottom: 12 },
  reg_addFamilyText: { marginLeft: 10, fontSize: 14, color: "#9333EA", fontWeight: "800" },
  reg_bottomLoginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 22, marginBottom: 14 },
  reg_loginPrompt: { fontSize: 13, color: "#475569" },
  reg_loginText: { fontSize: 14, color: "#2563EB", fontWeight: "800" },
  reg_secureRow: { alignItems: "center", paddingBottom: 34 },
  reg_secureText: { color: "#64748B", fontSize: 13 },
});
