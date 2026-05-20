import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import Header from '../components/Header';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

export default function ProfileScreen({ doctor, onLogout }) {
  return (
    <View style={styles.screen}>
      <Header doctor={doctor} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard title="Doctor Profile" subtitle="Clinic identity and contact details">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctor.initials}</Text>
          </View>

          <Text style={styles.name}>{doctor.name}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={doctor.status} compact />
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.label}>Clinical Role</Text>
            <Text style={styles.value}>{doctor.specialty}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.label}>Clinic / Hospital</Text>
            <Text style={styles.value}>{doctor.hospital}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{doctor.contact}</Text>
          </View>
        </SectionCard>

        <ActionButton title="Logout" onPress={onLogout} tone="danger" />
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
  avatar: {
    height: 78,
    width: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    alignSelf: 'center',
    marginTop: 4,
  },
  avatarText: {
    color: '#1d4ed8',
    fontSize: 26,
    fontWeight: '900',
  },
  name: {
    color: '#0f172a',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 14,
  },
  badgeRow: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  detailBlock: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 14,
    marginTop: 14,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 5,
  },
});
