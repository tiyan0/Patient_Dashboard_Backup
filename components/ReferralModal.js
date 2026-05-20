import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ActionButton from './ActionButton';

const SPECIALIST_DEPARTMENTS = [
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Internal Medicine',
  'Surgery',
  'Psychiatry',
  'Neurology',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Rheumatology',
  'Endocrinology',
  'Nephrology',
  'Urology',
];

const THERAPY_SERVICES = [
  'Physical Therapy',
  'Occupational Therapy',
  'Speech Therapy',
  'Mental Health Therapy',
  'Respiratory Therapy',
  'Nutrition Counseling',
  'Rehabilitation Medicine',
];

const REFERRAL_TYPES = {
  specialist: {
    label: 'Specialist',
    actionLabel: 'Refer to Specialist',
    fieldLabel: 'Specialist Department',
    placeholder: 'Choose a specialist department',
    options: SPECIALIST_DEPARTMENTS,
  },
  therapist: {
    label: 'Therapist',
    actionLabel: 'Refer to Therapist',
    fieldLabel: 'Therapy Service',
    placeholder: 'Choose a therapy service',
    options: THERAPY_SERVICES,
  },
};

const URGENCY_LEVELS = ['Normal', 'Urgent', 'Emergency'];

export default function ReferralModal({
  visible,
  patientName,
  initialReferralType = 'specialist',
  onClose,
  onSubmit,
}) {
  const safeInitialType = initialReferralType === 'therapist' ? 'therapist' : 'specialist';
  const [referralType, setReferralType] = useState(safeInitialType);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const referralConfig = REFERRAL_TYPES[referralType];

  useEffect(() => {
    if (visible) {
      setReferralType(safeInitialType);
      setSelectedDepartment('');
      setUrgency('Normal');
      setReason('');
      setNotes('');
      setShowDepartmentDropdown(false);
    }
  }, [visible, safeInitialType]);

  const handleSubmit = () => {
    if (!selectedDepartment || !reason.trim()) {
      Alert.alert(
        'Missing Information',
        `Please select a ${referralConfig.fieldLabel.toLowerCase()} and enter a referral reason.`
      );
      return;
    }

    onSubmit({
      type: referralType,
      department: selectedDepartment,
      urgency,
      reason,
      notes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    resetForm();
  };

  const resetForm = () => {
    setReferralType(safeInitialType);
    setSelectedDepartment('');
    setUrgency('Normal');
    setReason('');
    setNotes('');
    setShowDepartmentDropdown(false);
    onClose();
  };

  const changeReferralType = (type) => {
    setReferralType(type);
    setSelectedDepartment('');
    setShowDepartmentDropdown(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetForm}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Refer {patientName} to {referralConfig.label}</Text>
            <Text style={styles.modalSubtitle}>
              Choose the care team, urgency, reason, and notes for continued care.
            </Text>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabsContainer}>
              {Object.entries(REFERRAL_TYPES).map(([type, config]) => (
                <ActionButton
                  key={type}
                  title={config.actionLabel}
                  onPress={() => changeReferralType(type)}
                  tone={referralType === type ? 'primary' : 'ghost'}
                  style={styles.tabButton}
                />
              ))}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{referralConfig.fieldLabel}</Text>
              <ActionButton
                title={selectedDepartment || referralConfig.placeholder}
                onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                tone="ghost"
                style={styles.departmentButton}
              />
              {showDepartmentDropdown && (
                <View style={styles.dropdownList}>
                  {referralConfig.options.map((dept) => (
                    <ActionButton
                      key={dept}
                      title={dept}
                      onPress={() => {
                        setSelectedDepartment(dept);
                        setShowDepartmentDropdown(false);
                      }}
                      tone={selectedDepartment === dept ? 'primary' : 'ghost'}
                      style={styles.departmentOption}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Urgency Level</Text>
              <View style={styles.urgencyContainer}>
                {URGENCY_LEVELS.map((level) => (
                  <ActionButton
                    key={level}
                    title={level}
                    onPress={() => setUrgency(level)}
                    tone={urgency === level ? (level === 'Emergency' ? 'danger' : 'primary') : 'ghost'}
                    style={styles.urgencyButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Referral Reason</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Explain why you're referring this patient..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                style={styles.reasonInput}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Referral Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add clinical context, precautions, or handoff notes..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                style={styles.reasonInput}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <ActionButton
              title="Cancel"
              onPress={resetForm}
              tone="ghost"
              style={styles.footerButton}
            />
            <ActionButton
              title="Submit Referral"
              onPress={handleSubmit}
              tone="success"
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  departmentButton: {
    minHeight: 46,
  },
  dropdownList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    marginTop: 8,
    overflow: 'hidden',
  },
  departmentOption: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    minHeight: 44,
  },
  reasonInput: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerButton: {
    flex: 1,
    minHeight: 46,
  },
});
