import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PharmacyScreen({ navigation }) {
  const pharmacyOrders = [
    {
      id: '1',
      medication: 'Lisinopril 10mg',
      quantity: 'Qty: 30 tablets',
      status: 'Delivered',
      date: 'March 15, 2026',
      pharmacy: 'CVS Pharmacy',
    },
    {
      id: '2',
      medication: 'Metformin 500mg',
      quantity: 'Qty: 60 tablets',
      status: 'In Transit',
      date: 'Arriving March 20, 2026',
      pharmacy: 'Walgreens',
    },
    {
      id: '3',
      medication: 'Atorvastatin 20mg',
      quantity: 'Qty: 30 tablets',
      status: 'Processing',
      date: 'Order placed March 18, 2026',
      pharmacy: 'CVS Pharmacy',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#10B981';
      case 'In Transit':
        return '#F59E0B';
      case 'Processing':
        return '#3B82F6';
      default:
        return '#64748B';
    }
  };

<<<<<<< HEAD
=======
  const rootNavigation = navigation.getParent?.()?.getParent?.() || navigation.getParent?.() || navigation;

>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
<<<<<<< HEAD
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Dashboard');
=======
            if (rootNavigation.canGoBack()) {
              rootNavigation.goBack();
            } else {
              rootNavigation.navigate('Dashboard');
>>>>>>> 867d58274d4ae65dd8e9435f42c2efd4b90eaaa5
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <FlatList
          data={pharmacyOrders}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.rowSpaceBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medication}>{item.medication}</Text>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Text style={styles.pharmacy}>{item.pharmacy}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getStatusColor(item.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <TouchableOpacity style={styles.trackButton}>
                <Text style={styles.trackButtonText}>Track Order</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="#0AB4B5"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medication: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  pharmacy: {
    fontSize: 12,
    color: '#64748B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0AB4B5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  trackButtonText: {
    color: '#0AB4B5',
    fontSize: 13,
    fontWeight: '600',
  },
});
