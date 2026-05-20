import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const tones = {
  primary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: '#ffffff',
  },
  success: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
    color: '#ffffff',
  },
  danger: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    color: '#ffffff',
  },
  warning: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
    color: '#ffffff',
  },
  ghost: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    color: '#1e293b',
  },
  muted: {
    backgroundColor: '#eaf2ff',
    borderColor: '#eaf2ff',
    color: '#1d4ed8',
  },
};

export default function ActionButton({ title, onPress, tone = 'primary', style, disabled }) {
  const colors = tones[tone] || tones.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.color }]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.48,
  },
});
