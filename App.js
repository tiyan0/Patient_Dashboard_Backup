import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";

export default function App() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // stats
  const stats = [
    { title: "New Orders", count: 12, info: "+3 from yesterday", color: "#3B82F6" },
    { title: "Preparing", count: 8, info: "4 pending pickup", color: "#F59E0B" },
    { title: "Ready", count: 15, info: "Awaiting collection", color: "#22C55E" },
    { title: "Delivery", count: 6, info: "2 delivered today", color: "#A855F7" },
    { title: "Completed", count: 127, info: "+18% this week", color: "#10B981" },
    { title: "Low Stock", count: 5, info: "Requires reorder", color: "#EF4444" },
  ];

  // full mock data for requests and details
  const [pharmacyRequests, setPharmacyRequests] = useState([
    {
      id: "RX-1234",
      patient: "Maria Santos",
      age: "28",
      gender: "Female",
      contact: "+63 917 123 4567",
      medicine: "Amoxicillin 500mg",
      qty: "21 Capsules",
      dosage: "1 capsule 3x a day for 7 days",
      status: "New",
      type: "Delivery",
      doctor: "Dr. Manuel Rizal",
      notes: "Patient prefers brand-name if available.",
    },
    {
      id: "RX-1233",
      patient: "Juan dela Cruz",
      age: "45",
      gender: "Male",
      contact: "+63 918 765 4321",
      medicine: "Metformin 850mg",
      qty: "90 Tablets",
      dosage: "1 tablet twice daily with meals",
      status: "Preparing",
      type: "Pickup",
      doctor: "Dr. Elena Cruz",
      notes: "Check for generic substitute eligibility.",
    },
    {
      id: "RX-1232",
      patient: "Anna Reyes",
      age: "34",
      gender: "Female",
      contact: "+63 922 987 6543",
      medicine: "Losartan 50mg",
      qty: "30 Tablets",
      dosage: "1 tablet once daily in the morning",
      status: "Ready",
      type: "Pickup",
      doctor: "Dr. Manuel Rizal",
      notes: "Awaiting patient arrival.",
    },
    {
      id: "RX-1231",
      patient: "Antonio Luna",
      age: "61",
      gender: "Male",
      contact: "+63 915 444 5555",
      medicine: "Amlodipine 5mg",
      qty: "30 Tablets",
      dosage: "1 tablet daily at bedtime",
      status: "Delivery",
      type: "Delivery",
      doctor: "Dr. Sylvia Chang",
      notes: "Endorsed to rider John Doe.",
    },
  ]);

  // handle cycle status (Update pharmacy request status / Track statuses)
  const cycleStatus = (id) => {
    setPharmacyRequests(
      pharmacyRequests.map((req) => {
        if (req.id === id) {
          const statusOrder = ["New", "Preparing", "Ready", "Delivery", "Completed"];
          const nextIndex = (statusOrder.indexOf(req.status) + 1) % statusOrder.length;
          return { ...req, status: statusOrder[nextIndex] };
        }
        return req;
      })
    );
  };

  // filter & search logic (Search pharmacy requests / View pharmacy requests)
  const filteredRequests = pharmacyRequests.filter((req) => {
    const matchesSearch =
      req.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.medicine.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Pickup") return matchesSearch && req.type === "Pickup";
    if (activeTab === "Delivery") return matchesSearch && req.type === "Delivery";
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "#3B82F6";
      case "Preparing": return "#F59E0B";
      case "Ready": return "#22C55E";
      case "Delivery": return "#A855F7";
      case "Completed": return "#10B981";
      default: return "#6B7280";
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pharmacy Portal</Text>
      </View>

      {/* stats overview */}
      <View style={styles.grid}>
        {stats.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { borderLeftColor: item.color, borderLeftWidth: 4 }]}
            onPress={() => setSelectedCard(item)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar component */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests by ID, patient name, or medicine..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Request Management Tabs (Manage pickup/delivery requests) */}
      <View style={styles.tabSection}>
        {["All", "Pickup", "Delivery"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab} Requests
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pharmacy Requests List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pharmacy Requests Tracker</Text>

        {filteredRequests.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={[styles.badge, { backgroundColor: order.type === "Delivery" ? "#F3E8FF" : "#FEF3C7" }]}>
                <Text style={[styles.badgeText, { color: order.type === "Delivery" ? "#6B21A8" : "#92400E" }]}>
                  {order.type}
                </Text>
              </View>
            </View>

            <Text style={styles.patientName}>{order.patient}</Text>
            <Text style={styles.medicineName}>{order.medicine} — {order.qty}</Text>

            {/* Tracker status step */}
            <View style={styles.trackerRow}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.status) }]} />
              <Text style={styles.statusText}>Status: <Text style={{ fontWeight: "700" }}>{order.status}</Text></Text>
            </View>

            {/* Functional UI Action Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setSelectedPatient(order)}
              >
                <Text style={styles.secondaryButtonText}>Patient Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setSelectedPrescription(order)}
              >
                <Text style={styles.secondaryButtonText}>Rx Note</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => cycleStatus(order.id)}
              >
                <Text style={styles.primaryButtonText}>Advance Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Stats Modal */}
      <Modal visible={selectedCard !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedCard?.title}</Text>
            <Text style={styles.modalCount}>{selectedCard?.count}</Text>
            <Text style={styles.modalInfo}>{selectedCard?.info}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCard(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Prescription Note Modal */}
      <Modal visible={selectedPrescription !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Prescription Note</Text>
            <View style={styles.rxContainer}>
              <Text style={styles.rxLabel}>Doctor:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.doctor}</Text>
              
              <Text style={styles.rxLabel}>Rx Med:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.medicine}</Text>

              <Text style={styles.rxLabel}>Directions:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.dosage}</Text>

              <Text style={styles.rxLabel}>Internal Notes:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.notes}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPrescription(null)}>
              <Text style={styles.closeText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Patient Details Modal */}
      <Modal visible={selectedPatient !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Patient Demographics</Text>
            <View style={styles.rxContainer}>
              <Text style={styles.rxLabel}>Full Name:</Text>
              <Text style={styles.rxValue}>{selectedPatient?.patient}</Text>

              <Text style={styles.rxLabel}>Age / Gender:</Text>
              <Text style={styles.rxValue}>{selectedPatient?.age} yrs old / {selectedPatient?.gender}</Text>

              <Text style={styles.rxLabel}>Contact Number:</Text>
              <Text style={styles.rxValue}>{selectedPatient?.contact}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPatient(null)}>
              <Text style={styles.closeText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  header: {
    marginTop: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  cardCount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  searchSection: {
    marginVertical: 8,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#1F2937",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  section: {
    marginTop: 12,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontWeight: "bold",
    color: "#2563EB",
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 6,
  },
  medicineName: {
    color: "#4B5563",
    fontSize: 14,
    marginTop: 2,
  },
  trackerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: "#374151",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "85%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalCount: {
    fontSize: 40,
    fontWeight: "800",
    color: "#111827",
    marginVertical: 8,
  },
  modalInfo: {
    color: "#6B7280",
    marginBottom: 16,
  },
  rxContainer: {
    width: "100%",
    marginVertical: 14,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
  },
  rxLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 6,
  },
  rxValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});