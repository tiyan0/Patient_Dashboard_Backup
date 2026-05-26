import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function PharmacyScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Orders');
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    {
      id: 'ORD-2026-0315',
      date: 'March 28, 2026',
      status: 'Out for Delivery',
      statusColor: '#3B82F6', // Blue
      items: [
        { name: 'Lisinopril 10mg', qty: 30 },
        { name: 'Metformin 500mg', qty: 60 }
      ],
      deliveryTitle: 'Estimated Delivery',
      deliveryText: 'Today, 4:00 PM - 6:00 PM',
      total: '$24.50',
      buttons: [
        { label: 'Track Order', primary: true },
        { label: 'Contact Pharmacy', primary: false }
      ]
    },
    {
      id: 'ORD-2026-0298',
      date: 'March 15, 2026',
      status: 'Ready for Pickup',
      statusColor: '#F59E0B', // Orange
      items: [
        { name: 'Atorvastatin 20mg', qty: 30 }
      ],
      deliveryTitle: 'Ready for Pickup',
      deliveryText: 'CVS Pharmacy - Main Street',
      total: '$12.00',
      buttons: [
        { label: 'Get Directions', primary: true },
        { label: 'Contact Pharmacy', primary: false }
      ]
    },
    {
      id: 'ORD-2026-0287',
      date: 'March 1, 2026',
      status: 'Delivered',
      statusColor: '#10B981', // Green
      items: [
        { name: 'Amoxicillin 500mg', qty: 21 },
        { name: 'Ibuprofen 400mg', qty: 30 }
      ],
      deliveryTitle: 'Delivered on',
      deliveryText: 'March 3, 2026',
      total: '$18.75',
      buttons: []
    },
  ];

  const initialPharmacies = [
    {
      id: '1',
      name: 'CVS Pharmacy',
      preferred: true,
      address: '123 Main Street, Oklahoma City, OK',
      hours: 'Open until 9:00 PM',
      rating: '4.5',
      distance: '0.5 miles away'
    },
    {
      id: '2',
      name: 'Walgreens',
      preferred: false,
      address: '456 Oak Avenue, Oklahoma City, OK',
      hours: '24 hours',
      rating: '4.3',
      distance: '1.2 miles away'
    },
    {
      id: '3',
      name: 'Walmart Pharmacy',
      preferred: false,
      address: '789 Commerce Blvd, Oklahoma City, OK',
      hours: 'Open until 7:00 PM',
      rating: '4.1',
      distance: '2.1 miles away'
    }
  ];

  const [pharmaciesData, setPharmaciesData] = useState(initialPharmacies);

  const togglePreferred = (id) => {
    setPharmaciesData(prev => prev.map(p => ({
      ...p,
      preferred: p.id === id ? !p.preferred : false // Ensures only one can be preferred at a time
    })));
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(lowerCaseQuery) ||
      order.items.some((item) => item.name.toLowerCase().includes(lowerCaseQuery))
    );
  });

  const openDirections = (address) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodeURIComponent(address)}`,
      android: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    });
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Dashboard');
            }
          }}
        >
          <Ionicons name="chevron-back" size={23} color="#071C3A" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="medkit-outline" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Pharmacy</Text>
          <Text style={styles.headerSubtitle}>Manage prescriptions, deliveries, and pharmacy locations</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity 
            style={[styles.segmentButton, activeTab === 'Orders' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('Orders')}
          >
            <Text style={[styles.segmentText, activeTab === 'Orders' && styles.segmentTextActive]}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentButton, activeTab === 'Pharmacies' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('Pharmacies')}
          >
            <Text style={[styles.segmentText, activeTab === 'Pharmacies' && styles.segmentTextActive]}>Pharmacies</Text>
          </TouchableOpacity>
        </View>

        {/* Orders Tab */}
        {activeTab === 'Orders' && (
          <View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by medication or order ID..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {filteredOrders.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                <Ionicons name="search-outline" size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
                <Text style={styles.pharmacyName}>No orders found</Text>
                <Text style={[styles.pharmacyAddress, { textAlign: 'center', marginTop: 4 }]}>
                  We couldn't find any orders matching "{searchQuery}".
                </Text>
              </View>
            ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.card}>
                <View style={[styles.rowSpaceBetween, { marginBottom: 12 }]}>
                  <View>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>Placed on {order.date}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: order.statusColor + '15', borderColor: order.statusColor + '30', borderWidth: 1 }]}>
                    <Text style={[styles.badgeText, { color: order.statusColor }]}>{order.status}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />

                {order.items.map((item, idx) => (
                  <View key={idx} style={{ marginBottom: 12 }}>
                    <Text style={styles.medication}>{item.name}</Text>
                    <Text style={styles.quantity}>Quantity: {item.qty}</Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.rowSpaceBetween}>
                  <View>
                    <Text style={styles.deliveryTitle}>{order.deliveryTitle}</Text>
                    <Text style={styles.deliveryText}>{order.deliveryText}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.deliveryTitle}>Total</Text>
                    <Text style={styles.totalText}>{order.total}</Text>
                  </View>
                </View>

                {order.buttons.length > 0 && (
                  <View style={styles.buttonRow}>
                    {order.buttons.map((btn, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.actionButton, btn.primary ? styles.btnPrimary : styles.btnOutline]}
                        onPress={() => {
                          if (btn.label === 'Track Order') {
                            setTrackedOrder(order);
                            setTrackingModalVisible(true);
                          } else if (btn.label === 'Contact Pharmacy') {
                            navigation.navigate('Messages', { chatId: 'pharmacy_1' });
                          } else if (btn.label === 'Get Directions') {
                            openDirections(order.deliveryText);
                          }
                        }}
                      >
                        <Text style={[styles.actionButtonText, btn.primary ? styles.btnPrimaryText : styles.btnOutlineText]}>
                          {btn.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
            )}
          </View>
        )}

        {/* Pharmacies Tab */}
        {activeTab === 'Pharmacies' && (
          <View>
            {pharmaciesData.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.card}>
                <View style={[styles.rowSpaceBetween, { marginBottom: 8 }]}>
                  <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                  {pharmacy.preferred && (
                    <View style={styles.preferredBadge}>
                      <Text style={styles.preferredBadgeText}>Preferred</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                <Text style={styles.pharmacyHours}>{pharmacy.hours}</Text>
                
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{pharmacy.rating}</Text>
                  <Text style={styles.distanceText}> • {pharmacy.distance}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.actionButton, styles.btnOutline]} onPress={() => togglePreferred(pharmacy.id)}>
                    <Text style={styles.btnOutlineText}>{pharmacy.preferred ? 'Remove Preferred' : 'Set as Preferred'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.btnOutline]} onPress={() => openDirections(pharmacy.address)}>
                    <Text style={styles.btnOutlineText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Tracking Modal */}
      <Modal visible={trackingModalVisible} transparent={true} animationType="slide" onRequestClose={() => setTrackingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Track Order</Text>
              <TouchableOpacity onPress={() => setTrackingModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            {trackedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <Text style={styles.trackingOrderId}>Order #{trackedOrder.id}</Text>
                
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: 35.4675,
                      longitude: -97.5164,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    <Marker coordinate={{ latitude: 35.4675, longitude: -97.5164 }} title="Delivery Vehicle" description="Out for delivery">
                      <View style={styles.customMarker}>
                        <Ionicons name="car" size={16} color="#FFFFFF" />
                      </View>
                    </Marker>
                  </MapView>
                </View>

                <Text style={styles.trackingSubtitle}>Delivery Status</Text>
                
                <View style={styles.timeline}>
                  {[
                    { title: 'Order Placed', time: 'Mar 28, 8:00 AM', active: true },
                    { title: 'Processing at Pharmacy', time: 'Mar 28, 9:30 AM', active: true },
                    { title: 'Out for Delivery', time: 'Today, 3:15 PM', active: true, current: true },
                    { title: 'Delivered', time: 'Estimated: 4:00 PM - 6:00 PM', active: false }
                  ].map((step, index, arr) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, step.active && styles.timelineDotActive, step.current && styles.timelineDotCurrent]} />
                        {index < arr.length - 1 && <View style={[styles.timelineLine, step.active && !step.current && styles.timelineLineActive]} />}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={[styles.timelineStepTitle, step.active && styles.timelineStepTitleActive]}>{step.title}</Text>
                        <Text style={styles.timelineStepTime}>{step.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'android' ? 8 : 5,
    paddingBottom: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#089FB4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071C3A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#45627F',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F6FA',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#089FB4',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#45627F',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  card: {
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
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  medication: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: '#64748B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deliveryTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#3B82F6',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnOutlineText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  preferredBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  preferredBadgeText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  pharmacyAddress: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  pharmacyHours: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 13,
    color: '#64748B',
  },
  searchBox: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    marginLeft: 8,
  },
  
  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  trackingOrderId: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  trackingSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0', zIndex: 1 },
  timelineDotActive: { backgroundColor: '#3B82F6' },
  timelineDotCurrent: { borderWidth: 3, borderColor: '#BFDBFE', width: 16, height: 16, borderRadius: 8 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: -2 },
  timelineLineActive: { backgroundColor: '#3B82F6' },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
    marginTop: -2,
  },
  timelineStepTitle: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 2 },
  timelineStepTitleActive: { color: '#0F172A', fontWeight: '800' },
  timelineStepTime: { fontSize: 13, color: '#64748B' },
});
