import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";

export default function App() {
  const [selectedCard, setSelectedCard] = useState(null);

  const stats = [
    {
      title: "New Orders",
      count: 12,
      info: "+3 from yesterday",
      color: "#3B82F6",
    },
    {
      title: "Preparing",
      count: 8,
      info: "4 pending pickup",
      color: "#F59E0B",
    },
    {
      title: "Ready",
      count: 15,
      info: "Awaiting collection",
      color: "#22C55E",
    },
    {
      title: "Delivery",
      count: 6,
      info: "2 delivered today",
      color: "#A855F7",
    },
    {
      title: "Completed",
      count: 127,
      info: "+18% this week",
      color: "#10B981",
    },
    {
      title: "Low Stock",
      count: 5,
      info: "Requires reorder",
      color: "#EF4444",
    },
  ];

  const recentOrders = [
    {
      id: "RX-1234",
      patient: "Maria Santos",
      medicine: "Amoxicillin 500mg",
      status: "New",
    },
    {
      id: "RX-1233",
      patient: "Juan dela Cruz",
      medicine: "Metformin 850mg",
      status: "Preparing",
    },
    {
      id: "RX-1232",
      patient: "Anna Reyes",
      medicine: "Losartan 50mg",
      status: "Ready",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Pharmacy Portal</Text>
        <Text style={styles.subtitle}>
          Manage prescriptions and medicine fulfillment
        </Text>
      </View>

      {/* STATS GRID */}
      <View style={styles.grid}>
        {stats.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => setSelectedCard(item)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RECENT ORDERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>

        {recentOrders.map((order, index) => (
          <View key={index} style={styles.orderCard}>
            <Text style={styles.orderId}>{order.id}</Text>

            <Text style={styles.patient}>{order.patient}</Text>

            <Text style={styles.medicine}>{order.medicine}</Text>

            <View style={styles.statusContainer}>
              <Text style={styles.status}>{order.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* MODAL */}
      <Modal
        visible={selectedCard !== null}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {selectedCard?.title}
            </Text>

            <Text style={styles.modalCount}>
              {selectedCard?.count}
            </Text>

            <Text style={styles.modalInfo}>
              {selectedCard?.info}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCard(null)}
            >
              <Text style={styles.closeText}>Close</Text>
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
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    color: "#6B7280",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderLeftWidth: 5,
  },

  cardTitle: {
    fontSize: 14,
    color: "#6B7280",
  },

  cardCount: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#111827",
  },

  section: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },

  orderCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },

  orderId: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827",
  },

  patient: {
    marginTop: 8,
    fontSize: 16,
    color: "#111827",
  },

  medicine: {
    marginTop: 4,
    color: "#6B7280",
  },

  statusContainer: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  status: {
    fontWeight: "600",
    color: "#111827",
  },

  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  modalCount: {
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 15,
    color: "#111827",
  },

  modalInfo: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },

  closeButton: {
    marginTop: 25,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  closeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});