import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import EmptyState from '../components/EmptyState';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const filters = ['All Status', 'Overdue', 'Pending', 'HMO Pending'];

function formatCurrency(value) {
  return `₱${Number(value).toFixed(2)}`;
}

function BillingItemCard({ item, onAction, onMarkPaid }) {
  const isPaid = item.status === 'Paid';
  const isOverdue = item.status === 'Overdue';
  const isHmo = item.status === 'HMO Pending';

  return (
    <View style={[styles.billingCard, isOverdue && styles.overdueCard, isHmo && styles.hmoCard, isPaid && styles.paidCard]}>
      <View style={styles.cardTopRow}>
        <View style={styles.ticketGroup}>
          <Text style={styles.ticketId}>{item.ticketId}</Text>
          <StatusBadge status={item.status} compact />
        </View>
        <View style={styles.balanceGroup}>
          <Text style={styles.balanceLabel}>{isPaid ? 'Settled' : 'Outstanding Balance'}</Text>
          <Text style={[styles.balanceValue, isPaid && styles.paidBalance]}>
            {isPaid ? 'Paid' : formatCurrency(item.outstandingBalance)}
          </Text>
        </View>
      </View>

      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.consultationType}>{item.consultationType}</Text>

      <View style={styles.divider} />

      <Text style={styles.servicesLabel}>Added Billable Services</Text>
      <View style={styles.serviceChips}>
        {item.billableServices.map((service) => (
          <View key={service} style={styles.serviceChip}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>

      <View style={styles.dateGrid}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Invoice Date</Text>
          <Text style={styles.dateValue}>{item.invoiceDate}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Last Reminder Sent</Text>
          <Text style={styles.dateValue}>{item.lastReminderSent}</Text>
        </View>
      </View>

      <View style={styles.actionGrid}>
        <ActionButton
          title="View Invoice"
          onPress={() => onAction('View Invoice', item)}
          tone="ghost"
          style={styles.cardAction}
        />
        <ActionButton
          title="Resend Link"
          onPress={() => onAction('Resend Link', item)}
          tone="ghost"
          style={styles.cardAction}
          disabled={isPaid}
        />
        <ActionButton
          title="Follow-up"
          onPress={() => onAction('Follow-up', item)}
          tone="ghost"
          style={styles.cardAction}
          disabled={isPaid}
        />
        <ActionButton
          title={isPaid ? 'Paid' : 'Mark Paid'}
          onPress={() => onMarkPaid(item.id)}
          tone="success"
          style={styles.cardAction}
          disabled={isPaid}
        />
      </View>

      {!isPaid ? (
        <ActionButton
          title="Escalate to Admin Billing"
          onPress={() => onAction('Escalate to Admin Billing', item)}
          tone="danger"
          style={styles.escalateButton}
        />
      ) : null}
    </View>
  );
}

export default function BillingScreen({ billingItems, onMarkPaid }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Status');

  const summary = useMemo(() => {
    const pendingItems = billingItems.filter((item) => item.status !== 'Paid');
    const overdueItems = pendingItems.filter((item) => item.status === 'Overdue');
    const outstanding = pendingItems.reduce((total, item) => total + item.outstandingBalance, 0);

    return {
      totalPending: pendingItems.length,
      overdue: overdueItems.length,
      outstanding,
    };
  }, [billingItems]);

  const filteredItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return billingItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.patientName.toLowerCase().includes(query) ||
        item.ticketId.toLowerCase().includes(query);
      const matchesStatus = activeFilter === 'All Status' || item.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeFilter, billingItems, searchText]);

  const showActionAlert = (action, item) => {
    Alert.alert(action, `${action} for ${item.patientName} (${item.ticketId}).`);
  };

  const exportReport = () => {
    Alert.alert('Export Billing Report', 'A billing report export has been generated locally for review.');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Billing</Text>
          <Text style={styles.title}>Post-Consultation Billing Tracker</Text>
          <Text style={styles.subtitle}>Manage and track all pending post-consultation billing items</Text>
        </View>

        <View style={styles.summaryGrid}>
          <StatCard label="Total Pending" value={summary.totalPending} tone="red" />
          <StatCard label="Overdue" value={summary.overdue} tone="yellow" />
          <StatCard label="Outstanding" value={formatCurrency(summary.outstanding)} tone="green" />
        </View>

        <SectionCard style={styles.filterCard}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by patient name or ticket ID..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filters.map((filter) => {
              const active = activeFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.82}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.filterButton, active && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SectionCard>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="No billing items found"
            subtitle="Try a different patient name, ticket ID, or status filter."
          />
        ) : (
          filteredItems.map((item) => (
            <BillingItemCard
              key={item.id}
              item={item}
              onAction={showActionAlert}
              onMarkPaid={onMarkPaid}
            />
          ))
        )}

        <View style={styles.footerActions}>
          <ActionButton title="Export Billing Report" onPress={exportReport} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 18,
    paddingBottom: 136,
  },
  header: {
    marginBottom: 14,
  },
  kicker: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 5,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  filterCard: {
    padding: 12,
  },
  searchInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 14,
    paddingHorizontal: 13,
  },
  filterRow: {
    gap: 8,
    paddingTop: 12,
  },
  filterButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  filterButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  billingCard: {
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
  overdueCard: {
    borderColor: '#fecaca',
    borderLeftWidth: 4,
    backgroundColor: '#fff1f2',
  },
  hmoCard: {
    borderColor: '#bfdbfe',
    borderLeftWidth: 4,
    backgroundColor: '#eff6ff',
  },
  paidCard: {
    borderColor: '#bbf7d0',
    borderLeftWidth: 4,
    backgroundColor: '#f0fdf4',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  ticketGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  ticketId: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  balanceGroup: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  balanceValue: {
    color: '#ea580c',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  paidBalance: {
    color: '#15803d',
  },
  patientName: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 11,
  },
  consultationType: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 18,
  },
  servicesLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  serviceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  serviceText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  dateValue: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  cardAction: {
    width: '48%',
    flexGrow: 1,
    minHeight: 42,
  },
  escalateButton: {
    marginTop: 10,
    minHeight: 42,
  },
  footerActions: {
    marginTop: 2,
  },
});
