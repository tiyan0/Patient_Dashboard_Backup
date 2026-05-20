import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import ChatBox from '../components/ChatBox';
import EmptyState from '../components/EmptyState';
import PatientInfoCard from '../components/PatientInfoCard';
import SectionCard from '../components/SectionCard';
import SOAPInput from '../components/SOAPInput';
import StatusBadge from '../components/StatusBadge';
import TopSegmentTabs from '../components/TopSegmentTabs';

const segmentTabs = [
  { key: 'info', label: 'Info' },
  { key: 'request', label: 'Request' },
  { key: 'triage', label: 'Triage' },
  { key: 'records', label: 'Records' },
  { key: 'soap', label: 'Notes' },
  { key: 'history', label: 'History' },
  { key: 'prescription', label: 'Prescription' },
  { key: 'labs', label: 'Labs' },
  { key: 'certificate', label: 'Certificate' },
  { key: 'chat', label: 'Chat' },
];

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function Detail({ label, value }) {
  return (
    <View style={styles.detailBox}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function FieldInput({ label, value, onChangeText, placeholder, keyboardType, multiline, editable = true }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.fieldInput, multiline && styles.multilineInput, !editable && styles.disabledInput]}
      />
    </View>
  );
}

export default function PatientConsultationScreen({
  patient,
  initialSegment = 'info',
  onSegmentChange,
  onUpdatePatient,
  onUpdatePatientStatus,
  onCompleteConsultation,
}) {
  const [activeSegment, setActiveSegment] = useState(initialSegment);
  const [elapsedSeconds, setElapsedSeconds] = useState(4);

  useEffect(() => {
    setActiveSegment(initialSegment);
  }, [initialSegment, patient.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [patient.id]);

  const certificate = useMemo(() => {
    return (
      patient.medicalCertificates[0] || {
        id: 'draft-certificate',
        patientName: patient.name,
        diagnosis: '',
        restDays: '',
        notes: '',
      }
    );
  }, [patient]);

  const changeSegment = (segment) => {
    setActiveSegment(segment);
    if (onSegmentChange) {
      onSegmentChange(segment);
    }
  };

  const updateSoap = (field, value) => {
    onUpdatePatient(patient.id, (currentPatient) => ({
      ...currentPatient,
      soapNotes: {
        ...currentPatient.soapNotes,
        [field]: value,
      },
    }));
  };

  const addMedication = () => {
    onUpdatePatient(patient.id, (currentPatient) => ({
      ...currentPatient,
      prescriptions: [
        ...currentPatient.prescriptions,
        {
          id: `rx-${Date.now()}`,
          medicationName: 'Paracetamol',
          dosage: '500 mg',
          frequency: 'Every 6 hours as needed',
          duration: '3 days',
          instructions: 'Take after meals. Do not exceed 4 doses in 24 hours.',
        },
      ],
    }));
  };

  const addLabRequest = () => {
    onUpdatePatient(patient.id, (currentPatient) => ({
      ...currentPatient,
      labRequests: [
        ...currentPatient.labRequests,
        {
          id: `lab-${Date.now()}`,
          testName: 'Complete Blood Count',
          reason: 'Evaluate possible infection or inflammation',
          priority: 'Routine',
          notes: 'Coordinate sample collection with clinic laboratory.',
        },
      ],
    }));
  };

  const updateCertificate = (patch) => {
    onUpdatePatient(patient.id, (currentPatient) => {
      const existingCertificate =
        currentPatient.medicalCertificates[0] || {
          id: `cert-${Date.now()}`,
          patientName: currentPatient.name,
          diagnosis: '',
          restDays: '',
          notes: '',
        };

      return {
        ...currentPatient,
        medicalCertificates: [{ ...existingCertificate, ...patch }],
      };
    });
  };

  const generateCertificate = () => {
    updateCertificate({
      diagnosis: certificate.diagnosis || 'Acute headache under evaluation',
      restDays: certificate.restDays || '2',
      notes:
        certificate.notes ||
        'Patient is advised to rest, hydrate, and return for follow-up if symptoms persist.',
    });
    Alert.alert('Medical certificate ready', 'A draft medical certificate has been generated.');
  };

  const sendMessage = (text) => {
    onUpdatePatient(patient.id, (currentPatient) => ({
      ...currentPatient,
      messages: [
        ...currentPatient.messages,
        {
          id: `msg-${Date.now()}`,
          type: 'doctor',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
  };

  const approveRequest = () => {
    onUpdatePatientStatus(patient.id, 'In Consultation', {
      consultationRequestStatus: 'Approved',
      requestDecisionNote: 'Approved by the doctor for active consultation.',
    });
    Alert.alert('Request approved', `${patient.name} is now marked In Consultation.`);
  };

  const rejectRequest = () => {
    onUpdatePatient(patient.id, (currentPatient) => ({
      ...currentPatient,
      status: currentPatient.status === 'Completed' ? currentPatient.status : 'Waiting',
      consultationRequestStatus: 'Rejected',
      requestDecisionNote: 'Rejected by the doctor. Patient needs queue review before consultation.',
      messages: [
        ...currentPatient.messages,
        {
          id: `reject-${Date.now()}`,
          type: 'system',
          text: 'Consultation request was rejected by the doctor.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
    Alert.alert('Request rejected', `${patient.name} has been marked for queue review.`);
  };

  const requestRecords = () => {
    Alert.alert('Records requested', 'A secure records request has been sent to the patient.');
  };

  const viewCompleteHistory = () => {
    Alert.alert('Complete medical history', 'Past consultations, treatments and records are ready to review.');
  };

  const renderRequest = () => (
    <SectionCard title="Consultation Request" subtitle="Approve or reject assigned patient requests">
      <View style={styles.requestSummary}>
        <View style={styles.requestSummaryTop}>
          <Text style={styles.requestTitle}>Current request status</Text>
          <StatusBadge status={patient.consultationRequestStatus || 'Pending'} compact />
        </View>
        <Text style={styles.paragraph}>{patient.requestDecisionNote || 'Awaiting doctor decision.'}</Text>
      </View>

      <View style={styles.requestActions}>
        <ActionButton
          title="Approve Request"
          onPress={approveRequest}
          tone="success"
          disabled={patient.consultationRequestStatus === 'Approved' || patient.status === 'Completed'}
          style={styles.requestButton}
        />
        <ActionButton
          title="Reject Request"
          onPress={rejectRequest}
          tone="danger"
          disabled={patient.consultationRequestStatus === 'Rejected' || patient.status === 'Completed'}
          style={styles.requestButton}
        />
      </View>

      <Text style={styles.helperText}>
        Approving moves the patient to In Consultation. Rejecting marks the request for queue review.
      </Text>
    </SectionCard>
  );

  const renderTriage = () => (
    <SectionCard title="Triage Notes From Nurse" subtitle={`Triaged at ${patient.triagedTime}`}>
      <Text style={styles.groupTitle}>Patient Submitted Concern</Text>
      <Text style={styles.paragraph}>{patient.complaint}</Text>

      <Text style={styles.groupTitle}>Original Complaint</Text>
      <Text style={styles.paragraph}>{patient.complaint}</Text>

      <Text style={styles.groupTitle}>Vital Signs</Text>
      <View style={styles.detailGrid}>
        <Detail label="Blood Pressure" value={patient.vitalSigns.bloodPressure} />
        <Detail label="Heart Rate" value={patient.vitalSigns.heartRate} />
        <Detail label="Temperature" value={patient.vitalSigns.temperature} />
        <Detail label="Oxygen Saturation" value={patient.vitalSigns.oxygenSaturation} />
      </View>

      <Text style={styles.groupTitle}>Nurse Notes</Text>
      <Text style={styles.paragraph}>{patient.nurseNotes}</Text>
    </SectionCard>
  );

  const renderRecords = () => (
    <SectionCard
      title="Medical Records Access"
      subtitle="Past consultations, treatments and records"
    >
      {patient.recordsShared ? (
        <View style={styles.recordsBox}>
          <Text style={styles.recordsTitle}>Complete medical history is available</Text>
          {patient.medicalHistory.map((item) => (
            <Text key={item} style={styles.historyLine}>
              {item}
            </Text>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No medical records shared yet"
          subtitle="Request access from the patient to review prior consultations, treatments and records."
          actionLabel="Request Records from Patient"
          onAction={requestRecords}
        />
      )}
      <ActionButton
        title="View Complete Medical History"
        onPress={viewCompleteHistory}
        tone="ghost"
        style={styles.fullHistoryButton}
      />
    </SectionCard>
  );

  const renderSoap = () => (
    <SectionCard title="Consultation Notes" subtitle="Editable SOAP documentation for this visit">
      <SOAPInput
        label="Subjective"
        value={patient.soapNotes.subjective}
        onChangeText={(value) => updateSoap('subjective', value)}
        placeholder="Patient's reported symptoms and history..."
      />
      <SOAPInput
        label="Objective"
        value={patient.soapNotes.objective}
        onChangeText={(value) => updateSoap('objective', value)}
        placeholder="Clinical findings, vital signs, examination results..."
      />
      <SOAPInput
        label="Assessment"
        value={patient.soapNotes.assessment}
        onChangeText={(value) => updateSoap('assessment', value)}
        placeholder="Diagnosis and clinical impression..."
      />
      <SOAPInput
        label="Plan"
        value={patient.soapNotes.plan}
        onChangeText={(value) => updateSoap('plan', value)}
        placeholder="Treatment plan, medications, follow-up..."
      />
    </SectionCard>
  );

  const renderHistory = () => (
    <SectionCard title="Consultation History" subtitle="Past consultations, treatments and record summaries">
      {patient.consultationHistory.length === 0 ? (
        <EmptyState title="No consultation history yet" subtitle="Past consultations will appear here." />
      ) : (
        patient.consultationHistory.map((history) => (
          <View key={history.id} style={styles.historyCard}>
            <Text style={styles.historyDate}>{history.date}</Text>
            <Text style={styles.historyDiagnosis}>{history.diagnosis}</Text>
            <Text style={styles.historyMeta}>
              {history.doctor} - {history.department}
            </Text>
            <Text style={styles.historySummary}>{history.summary}</Text>
          </View>
        ))
      )}
    </SectionCard>
  );

  const renderPrescription = () => (
    <SectionCard
      title="Prescription"
      subtitle="Add medications for the patient"
      action={<ActionButton title="Add Medication" onPress={addMedication} style={styles.smallAction} />}
    >
      {patient.prescriptions.length === 0 ? (
        <EmptyState
          title="No medications prescribed yet"
          subtitle="Click Add Medication to start"
          actionLabel="Add Medication"
          onAction={addMedication}
        />
      ) : (
        patient.prescriptions.map((medication) => (
          <View key={medication.id} style={styles.listCard}>
            <Text style={styles.listTitle}>{medication.medicationName}</Text>
            <Text style={styles.listLine}>Dosage: {medication.dosage}</Text>
            <Text style={styles.listLine}>Frequency: {medication.frequency}</Text>
            <Text style={styles.listLine}>Duration: {medication.duration}</Text>
            <Text style={styles.listLine}>Instructions: {medication.instructions}</Text>
          </View>
        ))
      )}
    </SectionCard>
  );

  const renderLabs = () => (
    <SectionCard
      title="Lab Requests"
      subtitle="Order diagnostic tests and notes"
      action={<ActionButton title="Add Lab Request" onPress={addLabRequest} style={styles.smallAction} />}
    >
      {patient.labRequests.length === 0 ? (
        <EmptyState
          title="No lab requests yet"
          subtitle="Add a laboratory request when diagnostics are needed."
          actionLabel="Add Lab Request"
          onAction={addLabRequest}
        />
      ) : (
        patient.labRequests.map((lab) => (
          <View key={lab.id} style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{lab.testName}</Text>
              <StatusBadge status={lab.priority} compact />
            </View>
            <Text style={styles.listLine}>Reason: {lab.reason}</Text>
            <Text style={styles.listLine}>Notes: {lab.notes}</Text>
          </View>
        ))
      )}
    </SectionCard>
  );

  const renderCertificate = () => (
    <SectionCard
      title="Medical Certificate"
      subtitle="Prepare a printable patient certificate"
      action={
        <ActionButton
          title="Generate Medical Certificate"
          onPress={generateCertificate}
          tone="success"
          style={styles.smallAction}
        />
      }
    >
      <FieldInput label="Patient Name" value={patient.name} editable={false} placeholder="" />
      <FieldInput
        label="Diagnosis"
        value={certificate.diagnosis}
        onChangeText={(value) => updateCertificate({ diagnosis: value })}
        placeholder="Enter diagnosis"
      />
      <FieldInput
        label="Recommended Rest Days"
        value={certificate.restDays}
        onChangeText={(value) => updateCertificate({ restDays: value })}
        placeholder="Example: 2"
        keyboardType="number-pad"
      />
      <FieldInput
        label="Doctor Notes"
        value={certificate.notes}
        onChangeText={(value) => updateCertificate({ notes: value })}
        placeholder="Add advice, work restrictions, or follow-up notes"
        multiline
      />

      <View style={styles.previewCard}>
        <Text style={styles.previewKicker}>Medical Certificate Preview</Text>
        <Text style={styles.previewTitle}>{patient.name}</Text>
        <Text style={styles.previewLine}>Diagnosis: {certificate.diagnosis || 'Pending diagnosis'}</Text>
        <Text style={styles.previewLine}>Rest Days: {certificate.restDays || 'Not set'}</Text>
        <Text style={styles.previewLine}>{certificate.notes || 'Doctor notes will appear here.'}</Text>
      </View>
    </SectionCard>
  );

  const renderChat = () => (
    <SectionCard title="Patient Communication" subtitle={`Started consultation with ${patient.name}`}>
      <ChatBox messages={patient.messages} onSend={sendMessage} />
    </SectionCard>
  );

  const renderActiveSegment = () => {
    if (activeSegment === 'request') {
      return renderRequest();
    }

    if (activeSegment === 'triage') {
      return renderTriage();
    }

    if (activeSegment === 'records') {
      return renderRecords();
    }

    if (activeSegment === 'soap') {
      return renderSoap();
    }

    if (activeSegment === 'history') {
      return renderHistory();
    }

    if (activeSegment === 'prescription') {
      return renderPrescription();
    }

    if (activeSegment === 'labs') {
      return renderLabs();
    }

    if (activeSegment === 'certificate') {
      return renderCertificate();
    }

    if (activeSegment === 'chat') {
      return renderChat();
    }

    return <PatientInfoCard patient={patient} />;
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.patientHeader}>
          <View style={styles.patientTopRow}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>{patient.initials}</Text>
            </View>
            <View style={styles.patientMain}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.patientMeta}>{patient.specialty}</Text>
                <Text style={styles.metaDot}>-</Text>
                <Text style={styles.patientMeta}>{patient.consultationType}</Text>
              </View>
            </View>
            <StatusBadge status={patient.status} compact />
          </View>

          <View style={styles.requestBadgeRow}>
            <Text style={styles.requestBadgeLabel}>Request</Text>
            <StatusBadge status={patient.consultationRequestStatus || 'Pending'} compact />
          </View>

          <View style={styles.consultInfoRow}>
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>Duration</Text>
              <Text style={styles.timerValue}>{formatTimer(elapsedSeconds)}</Text>
            </View>
            <View style={styles.videoPill}>
              <Text style={styles.videoPillText}>Video Ready</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <ActionButton
              title="Start Video Call"
              onPress={() => Alert.alert('Video call', `Starting secure call with ${patient.name}.`)}
              style={styles.headerActionButton}
            />
            <ActionButton
              title="Complete Consultation"
              onPress={() => onCompleteConsultation(patient.id)}
              tone="success"
              disabled={patient.status === 'Completed'}
              style={styles.headerActionButton}
            />
          </View>
        </View>

        <View style={styles.tabsShell}>
          <TopSegmentTabs tabs={segmentTabs} activeTab={activeSegment} onChange={changeSegment} />
        </View>

        <View style={styles.content}>{renderActiveSegment()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  pageContent: {
    paddingBottom: 136,
  },
  patientHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    zIndex: 3,
  },
  patientTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientAvatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  patientAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  patientMain: {
    flex: 1,
  },
  patientName: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  patientMeta: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  metaDot: {
    color: '#94a3b8',
    fontSize: 13,
  },
  requestBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  requestBadgeLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  consultInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  timerCard: {
    minWidth: 104,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  timerLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  timerValue: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  videoPill: {
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  videoPillText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  headerActionButton: {
    flex: 1,
  },
  tabsShell: {
    backgroundColor: '#f5f7fb',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 2,
    elevation: 4,
  },
  content: {
    padding: 18,
    paddingBottom: 0,
    zIndex: 1,
  },
  groupTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 8,
  },
  paragraph: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  requestSummary: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    marginBottom: 12,
  },
  requestSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  requestTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '900',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  requestButton: {
    flex: 1,
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  detailBox: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },
  smallAction: {
    minHeight: 38,
    paddingHorizontal: 10,
  },
  fullHistoryButton: {
    marginTop: 12,
  },
  recordsBox: {
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 14,
  },
  recordsTitle: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  historyLine: {
    color: '#14532d',
    fontSize: 14,
    lineHeight: 21,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    marginBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listTitle: {
    flex: 1,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  listLine: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    marginBottom: 10,
  },
  historyDate: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '900',
  },
  historyDiagnosis: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
  historyMeta: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  historySummary: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  fieldWrapper: {
    marginBottom: 13,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 7,
  },
  fieldInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    color: '#0f172a',
    fontSize: 14,
  },
  disabledInput: {
    color: '#64748b',
    backgroundColor: '#eef2f7',
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 12,
    paddingBottom: 12,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    padding: 15,
    marginTop: 5,
  },
  previewKicker: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previewTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 7,
  },
  previewLine: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 3,
  },
});
