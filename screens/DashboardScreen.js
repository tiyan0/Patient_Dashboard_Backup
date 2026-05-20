import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import Header from '../components/Header';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function DashboardScreen({
  doctor,
  patients,
  currentPatient,
  onOpenAssigned,
  onOpenConsultation,
  onOpenRecords,
  onOpenReferrals,
  onGenerateInvoice,
}) {
  const assignedCount = patients.length;
  const inConsultationCount = patients.filter((patient) => patient.status === 'In Consultation').length;
  const waitingCount = patients.filter((patient) => patient.status === 'Waiting').length;
  const completedCount = patients.filter((patient) => patient.status === 'Completed').length;

  return (
    <View style={styles.screen}>
      <Header doctor={doctor} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statGrid}>
          <StatCard label="Assigned patients" value={assignedCount} tone="blue" />
          <StatCard label="In consultation" value={inConsultationCount} tone="green" />
          <StatCard label="Waiting" value={waitingCount} tone="yellow" />
          <StatCard label="Completed" value={completedCount} tone="slate" />
        </View>

        <SectionCard
          title="Current Patient"
          subtitle="Patient currently in consultation"
          action={<StatusBadge status={currentPatient.status} compact />}
        >
          <View style={styles.patientRow}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>{currentPatient.initials}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{currentPatient.name}</Text>
              <Text style={styles.patientMeta}>
                {currentPatient.queueNumber} - {currentPatient.specialty}
              </Text>
              <Text style={styles.patientConcern}>{currentPatient.complaint}</Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            <ActionButton title="Open Consultation" onPress={onOpenConsultation} style={styles.halfButton} />
            <ActionButton title="View Records" onPress={onOpenRecords} tone="ghost" style={styles.halfButton} />
          </View>
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Start assessments, referrals, and visit follow-up">
          <View style={styles.actionGrid}>
            <ActionButton title="Start Video Call" onPress={onOpenConsultation} style={styles.gridButton} />
            <ActionButton title="Manage Referrals" onPress={onOpenReferrals} tone="ghost" style={styles.gridButton} />
            <ActionButton
              title="Generate Invoice"
              onPress={onGenerateInvoice}
              tone="ghost"
              style={styles.gridButton}
            />
          </View>
        </SectionCard>

        <ActionButton title="View Assigned Patients" onPress={onOpenAssigned} tone="muted" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 18,
    paddingBottom: 118,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  patientRow: {
    flexDirection: 'row',
    gap: 12,
  },
  patientAvatar: {
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  patientAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  patientMeta: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  patientConcern: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 9,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  halfButton: {
    flex: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridButton: {
    width: '48%',
    flexGrow: 1,
  },
});
