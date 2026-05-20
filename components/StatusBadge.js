import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const badgeStyles = {
  'In Consultation': {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  Waiting: {
    backgroundColor: '#fef3c7',
    color: '#a16207',
  },
  Completed: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  Available: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  Overdue: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  Routine: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  Urgent: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  Pending: {
    backgroundColor: '#fef3c7',
    color: '#a16207',
  },
  'HMO Pending': {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  Paid: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  Approved: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  Rejected: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  Referred: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  'Not referred': {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
};

export default function StatusBadge({ status, compact }) {
  const colors = badgeStyles[status] || {
    backgroundColor: '#eef2ff',
    color: '#3730a3',
  };

  return (
    <View style={[styles.badge, compact && styles.compact, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.text, compact && styles.compactText, { color: colors.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 11,
  },
});
