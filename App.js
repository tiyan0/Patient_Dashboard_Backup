import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';

import DashboardScreen from './DashboardScreen';
import PharmacyScreen from './PharmacyScreen';
import PhysicalTherapyScreen from './PhysicalTherapyScreen';
import VideoConsultScreen from './VideoConsultScreen';
import {
  AppointmentsScreen,
  PrescriptionsScreen,
  ProfileScreen,
  MedicalRecordsScreen,
  MessagesScreen,
  CallDoctorScreen,
  JoinVideoCallScreen,
  ReferralDetailsScreen,
  InvoiceScreen,
  PaymentSuccessScreen,
  AuthScreen,
  CreateProfileScreen,
  EditProfileScreen,
  MedicalRecordsSharingScreen,
  BookSpecialistScreen,
  BookTherapyScreen,
  BookPhysicalScreen,
  ConsultationIntakeScreen,
} from './PatientFlowScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabList = [
  { name: 'Dashboard', label: 'Home', icon: 'home-outline' },
  { name: 'Appointments', label: 'Appointments', icon: 'calendar-outline' },
  { name: 'Prescriptions', label: 'Rx', icon: 'document-text-outline' },
  { name: 'Pharmacy', label: 'Pharmacy', icon: 'medkit-outline' },
  { name: 'PhysicalTherapy', label: 'PT', icon: 'fitness-outline' },
  { name: 'Profile', label: 'Profile', icon: 'person-outline' },
];

function CustomTabBar({ state, navigation }) {
  const activeRouteName = state.routes[state.index].name;

  return (
    <View style={styles.bottomNav}>
      {tabList.map((tab) => {
        // Keep the Dashboard tab active if on an interior sub-screen
        const isFocused = 
          activeRouteName === tab.name || 
          (!tabList.some(t => t.name === activeRouteName) && tab.name === 'Dashboard');
          
        const color = isFocused ? '#0AB4B5' : '#64748B';

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.bottomNavItem}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Ionicons name={tab.icon} size={23} color={color} />
            <Text
              style={[styles.bottomNavLabel, isFocused && styles.bottomNavLabelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      backBehavior="history"
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsScreen} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} />
      <Tab.Screen name="PhysicalTherapy" component={PhysicalTherapyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
      {/* Interior screens included in tabs to keep the bottom nav globally visible */}
      <Tab.Screen name="VideoConsult" component={VideoConsultScreen} /> 
      <Tab.Screen name="MedicalRecords" component={MedicalRecordsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="CallDoctor" component={CallDoctorScreen} />
      <Tab.Screen name="JoinVideoCall" component={JoinVideoCallScreen} />
      <Tab.Screen name="ReferralDetails" component={ReferralDetailsScreen} />
      <Tab.Screen name="MedicalRecordsSharing" component={MedicalRecordsSharingScreen} />
      <Tab.Screen name="BookSpecialist" component={BookSpecialistScreen} />
      <Tab.Screen name="BookTherapy" component={BookTherapyScreen} />
      <Tab.Screen name="BookPhysical" component={BookPhysicalScreen} />
      <Tab.Screen name="ConsultationIntake" component={ConsultationIntakeScreen} />
      <Tab.Screen name="Invoice" component={InvoiceScreen} />
      <Tab.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Tab.Screen name="EditProfile" component={EditProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'none' }} initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  
    
  );
  

}

const styles = StyleSheet.create({
  bottomNav: {
    minHeight: Platform.OS === 'ios' ? 82 : 70,
    paddingTop: 9,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingHorizontal: 2,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  bottomNavLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomNavLabelActive: {
    color: '#0AB4B5',
    fontWeight: '700',
  },
});
