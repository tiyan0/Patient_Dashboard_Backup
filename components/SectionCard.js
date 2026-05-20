import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SectionCard({ title, subtitle, children, action, style }) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle || action) && (
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action ? <View style={styles.action}>{action}</View> : null}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  action: {
    flexShrink: 0,
  },
});
