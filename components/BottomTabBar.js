import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', shortLabel: 'Home' },
  { key: 'assigned', label: 'Assigned', shortLabel: 'Queue' },
  { key: 'consultation', label: 'Consult', shortLabel: 'Consult' },
  { key: 'referrals', label: 'Referrals', shortLabel: 'Refer' },
  { key: 'billing', label: 'Billing', shortLabel: 'Billing' },
  { key: 'profile', label: 'Profile', shortLabel: 'Profile' },
];

export default function BottomTabBar({ activeTab, onTabPress }) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab || (activeTab === 'records' && tab.key === 'consultation');

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.82}
            onPress={() => onTabPress(tab.key)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <View style={[styles.dot, active && styles.activeDot]} />
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {tab.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 12,
    minHeight: 48,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  dot: {
    height: 5,
    width: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    marginBottom: 5,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#2563eb',
  },
  label: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  activeLabel: {
    color: '#1d4ed8',
  },
});
