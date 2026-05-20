import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function TopSegmentTabs({ tabs, activeTab, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabRow}
      style={styles.scroll}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.82}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    backgroundColor: '#f5f7fb',
  },
  tabRow: {
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    minHeight: 62,
  },
  tab: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  activeTab: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  label: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },
  activeLabel: {
    color: '#ffffff',
  },
});
