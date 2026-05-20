import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ActionButton from './ActionButton';

export default function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>+</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel ? (
        <ActionButton title={actionLabel} onPress={onAction} tone="muted" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    padding: 18,
    alignItems: 'center',
  },
  iconCircle: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0ecff',
    marginBottom: 12,
  },
  iconText: {
    color: '#2563eb',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  title: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
  action: {
    marginTop: 14,
    alignSelf: 'stretch',
  },
});
