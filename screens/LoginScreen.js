import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ActionButton from '../components/ActionButton';

export default function LoginScreen({ onLogin }) {
  const [identifier, setIdentifier] = useState('gp.reyes@hqclinic.ph');
  const [password, setPassword] = useState('doctor123');

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>HQ</Text>
        </View>

        <Text style={styles.brand}>Healthcare Queue System</Text>
        <Text style={styles.title}>General Physician Dashboard</Text>
        <Text style={styles.subtitle}>Sign in to assess assigned patients and manage referrals.</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email or Doctor ID</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="doctor@clinic.com"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <ActionButton title="Login" onPress={onLogin} style={styles.loginButton} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  brandMark: {
    height: 64,
    width: 64,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  brandMarkText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  brand: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    color: '#0f172a',
    fontSize: 15,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 4,
  },
});
