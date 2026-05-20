import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const toneColors = {
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#d97706',
  red: '#dc2626',
  slate: '#475569',
};

export default function StatCard({ label, value, tone = 'blue' }) {
  const color = toneColors[tone] || toneColors.blue;

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    overflow: 'hidden',
  },
  accent: {
    height: 4,
    width: 36,
    borderRadius: 999,
    marginBottom: 16,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
});
