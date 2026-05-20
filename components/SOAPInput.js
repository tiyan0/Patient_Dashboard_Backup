import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function SOAPInput({ label, placeholder, value, onChangeText }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline
        textAlignVertical="top"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  input: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
  },
});
