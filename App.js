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
  AuthScreen,
  CreateProfileScreen,
  EditProfileScreen,
} from './PatientFlowScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
        const color = isFocused ? '#0AB4B5' : '#64748B';

        return (
          <TouchableOpacity
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
            <Text
              style={[styles.bottomNavLabel, isFocused && styles.bottomNavLabelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {label}
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
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'none' }} initialRouteName="Auth">
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
