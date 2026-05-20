import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import AssignedPatientCard from '../components/AssignedPatientCard';

export default function AssignedPatientsScreen({ patients, selectedPatientId, onSelectPatient, onUpdateStatus }) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>General Physician Dashboard</Text>
        <Text style={styles.title}>Assigned Patients</Text>
        <Text style={styles.subtitle}>
          View assigned consultations, update status, or open the patient assessment workspace.
        </Text>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(patient) => patient.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AssignedPatientCard
            patient={item}
            selected={item.id === selectedPatientId}
            onPress={() => onSelectPatient(item.id, 'info')}
            onStatusChange={onUpdateStatus}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 6,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  list: {
    padding: 18,
    paddingBottom: 118,
  },
});
