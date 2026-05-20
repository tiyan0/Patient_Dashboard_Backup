import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { mockPatients } from './data/mockPatients';
import { mockBillingItems } from './data/mockBillingItems';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AssignedPatientsScreen from './screens/AssignedPatientsScreen';
import PatientConsultationScreen from './screens/PatientConsultationScreen';
import ReferralsScreen from './screens/ReferralsScreen';
import BillingScreen from './screens/BillingScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomTabBar from './components/BottomTabBar';

const doctor = {
  name: 'Dr. Adrian Reyes',
  initials: 'AR',
  specialty: 'General Physician',
  hospital: 'MediCare Queue Clinic',
  contact: '+63 917 222 3344',
  status: 'Available',
};

function makeSystemMessage(text) {
  return {
    id: `sys-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type: 'system',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function makeConsultationHistoryEntry(patient) {
  const diagnosis = patient.soapNotes.assessment || 'General physician consultation';
  const summary =
    patient.soapNotes.plan ||
    patient.soapNotes.subjective ||
    patient.complaint ||
    'Consultation completed by the general physician.';

  return {
    id: `hist-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    date: new Date().toISOString().slice(0, 10),
    doctor: doctor.name,
    department: doctor.specialty,
    diagnosis,
    summary,
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState(mockPatients);
  const [billingItems, setBillingItems] = useState(mockBillingItems);
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id);
  const [consultationSegment, setConsultationSegment] = useState('info');

  const selectedPatient = useMemo(() => {
    return patients.find((patient) => patient.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const updatePatient = (patientId, updater) => {
    setPatients((currentPatients) =>
      currentPatients.map((patient) => {
        if (patient.id !== patientId) {
          return patient;
        }

        return typeof updater === 'function' ? updater(patient) : { ...patient, ...updater };
      })
    );
  };

  const updatePatientStatus = (patientId, status, extraPatch = {}) => {
    if (status === 'In Consultation') {
      setSelectedPatientId(patientId);
    }

    setPatients((currentPatients) =>
      currentPatients.map((patient) => {
        if (status === 'In Consultation' && patient.id !== patientId && patient.status === 'In Consultation') {
          return {
            ...patient,
            status: 'Waiting',
            messages: [
              ...patient.messages,
              makeSystemMessage('Consultation status moved back to Waiting.'),
            ],
          };
        }

        if (patient.id !== patientId) {
          return patient;
        }

        const requestStatus =
          extraPatch.consultationRequestStatus ||
          (status === 'In Consultation' || status === 'Completed'
            ? 'Approved'
            : patient.consultationRequestStatus);

        return {
          ...patient,
          ...extraPatch,
          status,
          consultationRequestStatus: requestStatus,
          consultationHistory:
            status === 'Completed' && patient.status !== 'Completed'
              ? [...patient.consultationHistory, makeConsultationHistoryEntry(patient)]
              : patient.consultationHistory,
          messages: [
            ...patient.messages,
            makeSystemMessage(`Consultation status updated to ${status}.`),
          ],
        };
      })
    );
  };

  const selectPatient = (patientId, segment = 'info') => {
    setSelectedPatientId(patientId);
    setConsultationSegment(segment);
    setActiveTab('consultation');
  };

  const openRecords = (patientId = selectedPatient.id) => {
    setSelectedPatientId(patientId);
    setConsultationSegment('records');
    setActiveTab('records');
  };

  const openReferrals = (patientId = selectedPatient.id) => {
    setSelectedPatientId(patientId);
    setActiveTab('referrals');
  };

  const completeConsultation = (patientId = selectedPatient.id) => {
    updatePatientStatus(patientId, 'Completed');
    Alert.alert('Consultation completed', 'The patient has been marked completed.');
  };

  const generateInvoice = () => {
    Alert.alert('Invoice generated', 'A draft invoice has been generated for this consultation.');
  };

  const markBillingPaid = (billingItemId) => {
    setBillingItems((currentItems) =>
      currentItems.map((item) =>
        item.id === billingItemId
          ? {
              ...item,
              status: 'Paid',
              paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : item
      )
    );
    Alert.alert('Marked paid', 'This billing item has been marked paid locally.');
  };

  const renderScreen = () => {
    if (!isLoggedIn) {
      return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
    }

    if (activeTab === 'assigned') {
      return (
        <AssignedPatientsScreen
          patients={patients}
          selectedPatientId={selectedPatient.id}
          onSelectPatient={selectPatient}
          onUpdateStatus={updatePatientStatus}
        />
      );
    }

    if (activeTab === 'consultation' || activeTab === 'records') {
      return (
        <PatientConsultationScreen
          patient={selectedPatient}
          initialSegment={activeTab === 'records' ? 'records' : consultationSegment}
          onSegmentChange={setConsultationSegment}
          onUpdatePatient={updatePatient}
          onUpdatePatientStatus={updatePatientStatus}
          onCompleteConsultation={completeConsultation}
        />
      );
    }

    if (activeTab === 'referrals') {
      return (
        <ReferralsScreen
          doctor={doctor}
          patient={selectedPatient}
          onOpenConsultation={() => selectPatient(selectedPatient.id, 'info')}
          onUpdatePatient={updatePatient}
        />
      );
    }

    if (activeTab === 'billing') {
      return <BillingScreen billingItems={billingItems} onMarkPaid={markBillingPaid} />;
    }

    if (activeTab === 'profile') {
      return <ProfileScreen doctor={doctor} onLogout={() => setIsLoggedIn(false)} />;
    }

    return (
      <DashboardScreen
        doctor={doctor}
        patients={patients}
        currentPatient={selectedPatient}
        onOpenAssigned={() => setActiveTab('assigned')}
        onOpenConsultation={() => selectPatient(selectedPatient.id, 'info')}
        onOpenRecords={() => openRecords(selectedPatient.id)}
        onOpenReferrals={() => openReferrals(selectedPatient.id)}
        onGenerateInvoice={generateInvoice}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.appShell}>
          <View style={styles.screenArea}>{renderScreen()}</View>
          {isLoggedIn ? <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} /> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  screenArea: {
    flex: 1,
    overflow: 'hidden',
  },
});
