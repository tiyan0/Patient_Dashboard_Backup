import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import StatusBadge from './StatusBadge';

const statusOptions = ['Waiting', 'In Consultation', 'Completed'];

export default function AssignedPatientCard({ patient, selected, onPress, onStatusChange }) {
  const isPriority = patient.status === 'In Consultation';
  const isRejected = patient.consultationRequestStatus === 'Rejected';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard, isPriority && styles.activeCard]}
    >
      <View style={styles.topRow}>
        <View style={styles.identityRow}>
          <View style={[styles.avatar, isPriority && styles.priorityAvatar]}>
            <Text style={[styles.avatarText, isPriority && styles.priorityAvatarText]}>{patient.initials}</Text>
          </View>
          <View style={styles.patientTitle}>
            <Text style={styles.queue}>{patient.queueNumber}</Text>
            <Text style={styles.name}>{patient.name}</Text>
          </View>
        </View>
        <StatusBadge status={patient.status} compact />
      </View>

      <View style={styles.requestRow}>
        <Text style={styles.requestLabel}>Request</Text>
        <StatusBadge status={patient.consultationRequestStatus || 'Pending'} compact />
        {isRejected ? <Text style={styles.rejectedText}>Review before accepting.</Text> : null}
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Department</Text>
          <Text style={styles.metaValue}>{patient.specialty}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Triaged</Text>
          <Text style={styles.metaValue}>{patient.triagedTime}</Text>
        </View>
      </View>

      <Text style={styles.complaintLabel}>Concern</Text>
      <Text style={styles.complaint}>{patient.complaint}</Text>

      <View style={styles.statusEditor}>
        <Text style={styles.statusEditorLabel}>Update status</Text>
        <View style={styles.statusButtons}>
          {statusOptions.map((status) => {
            const active = patient.status === status;

            return (
              <TouchableOpacity
                key={status}
                activeOpacity={0.82}
                onPress={() => onStatusChange(patient.id, status)}
                style={[styles.statusButton, active && styles.statusButtonActive]}
              >
                <Text style={[styles.statusButtonText, active && styles.statusButtonTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {isPriority ? <View style={styles.priorityBar} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 15,
    marginBottom: 12,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  activeCard: {
    borderColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  identityRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  avatar: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e8ff',
  },
  priorityAvatar: {
    backgroundColor: '#2563eb',
  },
  avatarText: {
    color: '#7e22ce',
    fontSize: 13,
    fontWeight: '900',
  },
  priorityAvatarText: {
    color: '#ffffff',
  },
  patientTitle: {
    flex: 1,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  requestLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '900',
  },
  rejectedText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  queue: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  name: {
    color: '#475569',
    fontSize: 13,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  complaintLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 14,
    textTransform: 'uppercase',
  },
  complaint: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  statusEditor: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 14,
    paddingTop: 13,
  },
  statusEditorLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 9,
    textTransform: 'uppercase',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexGrow: 1,
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  statusButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  statusButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2563eb',
  },
});
