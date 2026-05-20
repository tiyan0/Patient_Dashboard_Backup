import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import StatusBadge from './StatusBadge';

export default function Header({ doctor, eyebrow = 'Healthcare Queue System' }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.mark}>
          <Text style={styles.markText}>HQ</Text>
        </View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </View>

      <View style={styles.doctorRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{doctor.initials}</Text>
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
        </View>
        <StatusBadge status={doctor.status} compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  mark: {
    height: 30,
    width: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  markText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  eyebrow: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
  },
  avatarText: {
    color: '#1d4ed8',
    fontSize: 18,
    fontWeight: '900',
  },
  doctorInfo: {
    flex: 1,
  },
  name: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
  },
  specialty: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 3,
  },
});
