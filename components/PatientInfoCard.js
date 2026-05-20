import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SectionCard from './SectionCard';

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function PatientInfoCard({ patient }) {
  return (
    <SectionCard title="Patient Information">
      <View style={styles.detailGrid}>
        <Detail label="Queue Number" value={patient.queueNumber} />
        <Detail label="Consultation Type" value={patient.consultationType} />
        <Detail label="Age" value={`${patient.age} years`} />
        <Detail label="Gender" value={patient.gender} />
        <Detail label="Blood Type" value={patient.bloodType} />
        <Detail label="Contact" value={patient.contact} />
      </View>

      <View style={styles.divider} />

      <Text style={styles.groupTitle}>Allergies</Text>
      <View style={styles.chips}>
        {patient.allergies.map((allergy) => (
          <View key={allergy} style={styles.allergyChip}>
            <Text style={styles.allergyText}>{allergy}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.groupTitle, styles.historyTitle]}>Medical History</Text>
      {patient.medicalHistory.map((item) => (
        <Text key={item} style={styles.historyItem}>
          {item}
        </Text>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  detail: {
    width: '50%',
    paddingRight: 10,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  value: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 18,
  },
  groupTitle: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 9,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    backgroundColor: '#fee2e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  allergyText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '800',
  },
  historyTitle: {
    marginTop: 18,
  },
  historyItem: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 5,
  },
});
