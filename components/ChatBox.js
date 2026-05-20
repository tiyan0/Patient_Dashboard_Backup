import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatBox({ messages, onSend }) {
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setDraft('');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.messages}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.message, message.type === 'doctor' && styles.doctorMessage]}>
            <Text style={[styles.messageText, message.type === 'system' && styles.systemText]}>{message.text}</Text>
            <Text style={styles.time}>{message.time}</Text>
          </View>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        <TouchableOpacity activeOpacity={0.82} onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  messages: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 12,
    justifyContent: 'flex-start',
  },
  message: {
    alignSelf: 'center',
    maxWidth: '92%',
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 10,
  },
  doctorMessage: {
    alignSelf: 'flex-end',
    borderRadius: 14,
    backgroundColor: '#dbeafe',
  },
  messageText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  systemText: {
    color: '#64748b',
  },
  time: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    color: '#0f172a',
    fontSize: 14,
  },
  sendButton: {
    minWidth: 74,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
