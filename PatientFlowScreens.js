import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const teal = '#0AB4B5';
const cyan = '#089FB4';
const bg = '#F1FAFE';
const ink = '#071C3A';
const muted = '#45627F';

function navigateRoot(navigation, name, params) {
  const rootNavigation = navigation?.getParent?.()?.getParent?.() || navigation?.getParent?.() || navigation;
  rootNavigation?.navigate?.(name, params);
}

function Header({ title, subtitle, icon, navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (navigation?.canGoBack?.()) {
            navigation.goBack();
          }
        }}
      >
        <Ionicons name="chevron-back" size={23} color={ink} />
      </TouchableOpacity>
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

function Screen({ children, title, subtitle, icon, navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={title} subtitle={subtitle} icon={icon} navigation={navigation} />
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

export function AppointmentsScreen({ navigation }) {
  const [selected, setSelected] = useState('Upcoming');

  const upcomingAppointments = [
    {
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
      doctor: 'Dr. Miguel Reyes',
      specialty: 'Orthopedic Surgeon',
      status: 'Pending',
      date: 'April 2, 2026',
      time: '10:00 AM',
      type: 'Clinic Visit',
      color: '#F59E0B',
      actions: ['Reschedule', 'Details']
    }
  ];

  const pastAppointments = [
    {
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Family Medicine',
      status: 'Completed',
      date: 'March 15, 2026',
      time: '1:00 PM',
      type: 'Video Consultation',
      color: '#10B981',
      actions: ['View Summary', 'Book Again']
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
          onPress={() => navigateRoot(navigation, 'VideoConsult')}
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
                    if (act === 'Join Call') navigateRoot(navigation, 'JoinVideoCall');
                    else if (act === 'Message') navigateRoot(navigation, 'Messages');
                    else if (act === 'Book Again') navigateRoot(navigation, 'VideoConsult');
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
  const meds = [
    ['Lisinopril', '10mg tablet', 'Take once daily', 'Refill in 5 days', '#F59E0B'],
    ['Metformin', '500mg tablet', 'Take twice daily with meals', 'Refill in 30 days', '#10B981'],
    ['Atorvastatin', '20mg tablet', 'Take every evening', 'Active', '#089FB4'],
  ];

  return (
    <Screen title="Prescriptions" subtitle="Track medications and refills" icon="document-text-outline" navigation={navigation}>
      <Card style={styles.heroCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.heroEyebrow}>Medication Summary</Text>
            <Text style={styles.largeTitle}>3 Active</Text>
          </View>
          <View style={styles.bigIcon}>
            <Ionicons name="medical-outline" size={30} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.bodyText}>One medication needs refill attention soon.</Text>
      </Card>

      {meds.map(([name, dose, instruction, refill, color]) => (
        <Card key={name}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{name}</Text>
              <Text style={styles.bodyText}>{dose}</Text>
            </View>
            <Pill label={refill} color={color} />
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="alarm-outline" size={16} color={muted} />
            <Text style={styles.metaText}>{instruction}</Text>
          </View>
          <PrimaryButton label="Request Refill" icon="refresh" color={color === '#F59E0B' ? '#F59E0B' : cyan} />
        </Card>
      ))}
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
          onPress={() => navigateRoot(navigation, 'MainTabs')}
        />

        <TouchableOpacity style={styles.authToggle} onPress={() => navigateRoot(navigation, 'CreateProfile')}>
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
        <PrimaryButton label="Complete Registration" icon="checkmark-circle-outline" onPress={() => navigateRoot(navigation, 'MainTabs')} />
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
        <PrimaryButton label="Save Changes" icon="save-outline" onPress={() => navigation.goBack()} />
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
          <PrimaryButton label="Edit Profile" icon="create-outline" onPress={() => navigateRoot(navigation, 'EditProfile')} />
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
          onPress={() => navigateRoot(navigation, 'Auth')} 
        />
      </View>
    </Screen>
  );
}

export function MedicalRecordsScreen({ navigation }) {
  const records = [
    ['Lab Results', 'Complete blood count uploaded', 'March 15, 2026', 'New', '#8B5CF6'],
    ['Visit Summary', 'Family medicine consultation', 'March 8, 2026', 'Reviewed', '#089FB4'],
    ['Imaging', 'Right knee X-ray report', 'February 21, 2026', 'Available', '#10B981'],
    ['Immunization', 'Flu vaccine record', 'January 12, 2026', 'Complete', '#089FB4'],
  ];

  return (
    <Screen title="Medical Records" subtitle="View health history and files" icon="folder-open-outline" navigation={navigation}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={muted} />
        <TextInput style={styles.searchInput} placeholder="Search records" placeholderTextColor="#94A3B8" />
      </View>
      {records.map(([title, detail, date, status, color]) => (
        <Card key={title}>
          <View style={styles.rowBetween}>
            <View style={styles.recordIcon}>
              <Ionicons name="document-text-outline" size={22} color={color} />
            </View>
            <Pill label={status} color={color} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.bodyText}>{detail}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={muted} />
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

export function MessagesScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const chat = [
    ['Care Team', 'Hi Sarah, your referral request has been received.', '9:12 AM'],
    ['You', 'Thank you. Can I book this week?', '9:14 AM'],
    ['Care Team', 'Yes, we have orthopedic appointments available Friday.', '9:15 AM'],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Messages" subtitle="Chat with your care team" icon="chatbubble-ellipses-outline" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        {chat.map(([sender, text, time], idx) => {
          const mine = sender === 'You';
          return (
            <View key={`${time}-${idx}`} style={[styles.chatBubble, mine && styles.chatBubbleMine]}>
              <Text style={[styles.chatSender, mine && styles.chatMineText]}>{sender}</Text>
              <Text style={[styles.chatText, mine && styles.chatMineText]}>{text}</Text>
              <Text style={[styles.chatTime, mine && styles.chatMineText]}>{time}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.messageComposer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={styles.messageInput}
          placeholder="Type a message"
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => setMessage('')}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
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
        <TouchableOpacity style={[styles.callControl, styles.endCall]} onPress={() => navigation.goBack()}>
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
        <PrimaryButton label="Book Appointment" icon="person-add" color="#F59E0B" onPress={() => navigateRoot(navigation, 'Appointments')} />
      </Card>
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
        <Text style={styles.heroEyebrow}>Consultation with</Text>
        <Text style={styles.largeTitle}>Dr. Maria Santos</Text>
        <Text style={styles.bodyText}>Consultation Date: March 28, 2026</Text>
      </Card>
      <Card>
        {items.map(([label, amount]) => (
          <View key={label} style={styles.invoiceRow}>
            <Text style={styles.bodyText}>{label}</Text>
            <Text style={styles.invoiceAmount}>{amount}</Text>
          </View>
        ))}
        <View style={styles.invoiceTotal}>
          <Text style={styles.cardTitle}>Total Due</Text>
          <Text style={styles.totalAmount}>$800</Text>
        </View>
        <PrimaryButton label="Pay Now" icon="card" color="#F59E0B" />
      </Card>
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
  chatBubble: {
    alignSelf: 'flex-start',
    maxWidth: '86%',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D8EAF0',
  },
  chatBubbleMine: { alignSelf: 'flex-end', backgroundColor: cyan, borderColor: cyan },
  chatSender: { color: ink, fontSize: 12, fontWeight: '800', marginBottom: 5 },
  chatText: { color: muted, fontSize: 14, lineHeight: 20 },
  chatTime: { color: '#64748B', fontSize: 10, marginTop: 7, alignSelf: 'flex-end' },
  chatMineText: { color: '#FFFFFF' },
  messageComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  messageInput: { flex: 1, height: 42, borderRadius: 10, backgroundColor: '#F1FAFE', paddingHorizontal: 13, color: ink },
  sendButton: { width: 42, height: 42, borderRadius: 10, backgroundColor: cyan, alignItems: 'center', justifyContent: 'center', marginLeft: 9 },
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
