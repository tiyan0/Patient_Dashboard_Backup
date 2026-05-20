import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import ReferralModal from '../components/ReferralModal';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

export default function ReferralsScreen({ doctor, patient, onOpenConsultation, onUpdatePatient }) {
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [referralDraftType, setReferralDraftType] = useState('specialist');

  const openReferralModal = (type) => {
    setReferralDraftType(type);
    setReferralModalVisible(true);
  };

  const submitNewReferral = (referralData) => {
    const createdAt = Date.now();
    const referralId = `ref-${createdAt}`;
    const label = referralData.type === 'therapist' ? 'Therapist' : 'Specialist';
    const notes = (referralData.notes || '').trim();

    onUpdatePatient(patient.id, (currentPatient) => ({
      ...currentPatient,
      referrals: [
        ...currentPatient.referrals,
        {
          id: referralId,
          type: referralData.type,
          department: referralData.department,
          urgency: referralData.urgency,
          reason: referralData.reason,
          notes,
          status: 'Pending',
          createdAt: referralData.timestamp,
        },
      ],
      consultationHistory: [
        ...currentPatient.consultationHistory,
        {
          id: `hist-${referralId}`,
          date: new Date().toISOString().slice(0, 10),
          doctor: doctor.name,
          department: doctor.specialty,
          diagnosis: `Referral to ${label}`,
          summary: `Referred to ${referralData.department} with ${referralData.urgency.toLowerCase()} urgency. Reason: ${referralData.reason}${
            notes ? ` Notes: ${notes}` : ''
          }`,
        },
      ],
      messages: [
        ...currentPatient.messages,
        {
          id: `msg-${referralId}`,
          type: 'system',
          text: `${label} referral created to ${referralData.department}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));

    Alert.alert('Referral created', `${patient.name} has been referred to ${referralData.department}.`);
  };

  return (
    <View style={styles.screen}>
      <Header doctor={doctor} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard title="Referral Form" subtitle="Create specialist and therapist referrals">
          <View style={styles.patientRow}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>{patient.initials}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>
                {patient.queueNumber} - {patient.specialty}
              </Text>
              <Text style={styles.patientConcern}>{patient.complaint}</Text>
            </View>
            <StatusBadge status={patient.status} compact />
          </View>

          <View style={styles.referralActions}>
            <ActionButton
              title="Refer to Specialist"
              onPress={() => openReferralModal('specialist')}
              style={styles.referralActionButton}
            />
            <ActionButton
              title="Refer to Therapist"
              onPress={() => openReferralModal('therapist')}
              tone="ghost"
              style={styles.referralActionButton}
            />
          </View>

          <ActionButton
            title="Open Consultation"
            onPress={onOpenConsultation}
            tone="muted"
            style={styles.consultationButton}
          />
        </SectionCard>

        <SectionCard title="Referral List" subtitle="Saved referrals for this patient">
          {patient.referrals.length === 0 ? (
            <EmptyState
              title="No referrals yet"
              subtitle="Create a referral when the patient needs specialist assessment or therapy support."
            />
          ) : (
            patient.referrals.map((referral) => (
              <View key={referral.id} style={styles.referralCard}>
                <View style={styles.referralHeader}>
                  <View style={styles.referralTitleGroup}>
                    <View style={styles.referralDepartmentRow}>
                      <Text style={styles.referralDepartment}>{referral.department}</Text>
                      <View
                        style={[
                          styles.urgencyBadge,
                          referral.urgency === 'Emergency'
                            ? styles.urgencyEmergency
                            : referral.urgency === 'Urgent'
                              ? styles.urgencyUrgent
                              : styles.urgencyNormal,
                        ]}
                      >
                        <Text
                          style={[
                            styles.urgencyBadgeText,
                            referral.urgency === 'Emergency' || referral.urgency === 'Urgent'
                              ? styles.urgencyBadgeTextDark
                              : styles.urgencyBadgeTextLight,
                          ]}
                        >
                          {referral.urgency}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.referralType}>
                      {referral.type === 'therapist' ? 'Refer to Therapist' : 'Refer to Specialist'}
                    </Text>
                  </View>
                  <StatusBadge status={referral.status} compact />
                </View>

                <Text style={styles.referralReason}>Reason: {referral.reason}</Text>
                {referral.notes ? <Text style={styles.referralNotes}>Notes: {referral.notes}</Text> : null}
                <Text style={styles.referralTimestamp}>Created at {referral.createdAt}</Text>
              </View>
            ))
          )}
        </SectionCard>
      </ScrollView>

      <ReferralModal
        visible={referralModalVisible}
        patientName={patient.name}
        initialReferralType={referralDraftType}
        onClose={() => setReferralModalVisible(false)}
        onSubmit={submitNewReferral}
      />
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
  patientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  referralActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  referralActionButton: {
    flex: 1,
    minWidth: 150,
  },
  consultationButton: {
    marginTop: 10,
  },
  referralCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    marginBottom: 12,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  referralTitleGroup: {
    flex: 1,
  },
  referralDepartmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  referralDepartment: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyNormal: {
    backgroundColor: '#dbeafe',
  },
  urgencyUrgent: {
    backgroundColor: '#fed7aa',
  },
  urgencyEmergency: {
    backgroundColor: '#fecaca',
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  urgencyBadgeTextLight: {
    color: '#1d4ed8',
  },
  urgencyBadgeTextDark: {
    color: '#7c2d12',
  },
  referralType: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  referralReason: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  referralNotes: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  referralTimestamp: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});
