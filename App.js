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
<<<<<<< HEAD
  PaymentSuccessScreen,
  AuthScreen,
  CreateProfileScreen,
  EditProfileScreen,
  MedicalRecordsSharingScreen,
  BookSpecialistScreen,
=======
  AuthScreen,
  CreateProfileScreen,
  EditProfileScreen,
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
} from './PatientFlowScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

<<<<<<< HEAD
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
          
=======
const tabIcons = {
  Home: 'home-outline',
  Appointments: 'calendar-outline',
  Rx: 'document-text-outline',
  Pharmacy: 'medkit-outline',
  PT: 'fitness-outline',
  Profile: 'person-outline',
};

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
        const color = isFocused ? '#0AB4B5' : '#64748B';

        return (
          <TouchableOpacity
<<<<<<< HEAD
            key={tab.name}
            style={styles.bottomNavItem}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Ionicons name={tab.icon} size={23} color={color} />
=======
            key={route.key}
            style={styles.bottomNavItem}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                if (route.name === 'Home') {
                  navigation.navigate(route.name, route.params);
                } else {
                  const stackMap = {
                    Appointments: 'Appointments',
                    Rx: 'Prescriptions',
                    Pharmacy: 'Pharmacy',
                    PT: 'PhysicalTherapy',
                    Profile: 'Profile'
                  };
                  navigation.getParent()?.navigate(stackMap[route.name] || route.name, route.params);
                }
              }
            }}
          >
            <Ionicons name={tabIcons[route.name]} size={23} color={color} />
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
            <Text
              style={[styles.bottomNavLabel, isFocused && styles.bottomNavLabelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
<<<<<<< HEAD
              {tab.label}
=======
              {label}
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
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
<<<<<<< HEAD
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
      <Tab.Screen name="Invoice" component={InvoiceScreen} />
      <Tab.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Tab.Screen name="EditProfile" component={EditProfileScreen} />
=======
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen}  />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Rx" component={PrescriptionsScreen} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} />
      <Tab.Screen name="PT" component={PhysicalTherapyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'none' }} initialRouteName="Auth">
<<<<<<< HEAD
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
=======
        <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="VideoConsult" component={VideoConsultScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} /> 
        <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="Messages" component={MessagesScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="CallDoctor" component={CallDoctorScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="JoinVideoCall" component={JoinVideoCallScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="ReferralDetails" component={ReferralDetailsScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Pharmacy" component={PharmacyScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="PhysicalTherapy" component={PhysicalTherapyScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
        
        
        
        
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
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
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
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
