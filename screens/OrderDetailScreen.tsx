"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Image,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import type { Order, Contact, OrderItem } from "../index";

type RootStackParamList = {
  OrdersMain: { activeTab?: string };
  EditOrder: { order: Order; sourceTab?: string };
  Call: { contact: Contact };
  TrackDriver: { driver: { name: string; phone: string; image?: string } };
};

type OrderDetailParams = {
  order: Order;
  type: string;
  showMoreOptions?: boolean;
  onCancel?: (sourceTab?: string) => Promise<void>;
  onDone?: () => void;
  onEdit?: () => void;
  returnToOrders?: boolean;
  sourceTab?: string;
};

type OrderDetailScreenRouteProp = RouteProp<
  { OrderDetail: OrderDetailParams },
  "OrderDetail"
>;

const OrderDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<OrderDetailScreenRouteProp>();
  // Get parameters including returnToOrders and sourceTab
  const {
    order,
    type,
    showMoreOptions,
    onCancel,
    onDone,
    onEdit,
    returnToOrders,
    sourceTab,
  } = route.params as OrderDetailParams;

  const [showActionModal, setShowActionModal] = useState(
    showMoreOptions || false
  );
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  // FIXED: handleCancel function to show confirmation modal
  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  // Confirm cancel function that will be called from the modal
  const confirmCancel = async () => {
    try {
      // Call the onCancel callback if provided
      if (onCancel) {
        // Execute onCancel and wait for it to complete
        await onCancel();
      }
      // Close the cancel confirmation modal
      setShowCancelConfirmModal(false);
      // Navigate to OrdersMain with history tab
      navigation.navigate("OrdersMain", { activeTab: "history" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      // Close modal even if there's an error
      setShowCancelConfirmModal(false);
      Alert.alert("Error", "Failed to cancel order. Please try again.");
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Allow editing for both scheduled and now orders
      navigation.navigate("EditOrder", { order });
    }
  };

  const handleMarkAsDone = () => {
    if (onDone) {
      onDone();
      // Navigate back to OrdersMain with confirmed tab
      navigation.navigate("OrdersMain", { activeTab: "confirmed" });
    }
  };

  const handleNoticeToDriver = () => {
    if (order.driver) {
      const contact: Contact = {
        name: order.driver,
        phone: order.driverPhone || "0274 458 999",
        image: order.driverImage,
      };
      navigation.navigate("Call", { contact });
    } else {
      // Show alert that no driver is assigned
      Alert.alert("No Driver", "No driver is assigned to this order yet.");
    }
  };

  const handleTrackDriver = () => {
    if (order.driver) {
      navigation.navigate("TrackDriver", {
        driver: {
          name: order.driver,
          phone: order.driverPhone || "0274 458 999",
          image: order.driverImage,
        },
      });
    } else {
      // Show alert that no driver is assigned
      Alert.alert("No Driver", "No driver is assigned to this order yet.");
    }
  };

  // Render order item with correct price display
  const renderOrderItem = (item: OrderItem) => (
    <View style={styles.orderItem} key={item.name}>
      <View style={styles.orderItemHeader}>
        <Text style={styles.orderItemQuantity}>{item.quantity} x</Text>
        <Text style={styles.orderItemName}>{item.name}</Text>
        <Text style={styles.orderItemPrice}>{item.price}</Text>
      </View>

      {item.description && (
        <Text style={styles.orderItemDescription}>
          Description: {item.description}
        </Text>
      )}

      {item.spicy && (
        <Text style={styles.orderItemSpicy}>
          <FontAwesome name="fire" size={14} color="#FF6B00" /> Spicy
        </Text>
      )}

      {item.extras &&
        item.extras.map((extra, index) => (
          <Text key={index} style={styles.orderItemExtra}>
            • {extra}
          </Text>
        ))}
    </View>
  );

  const getStatusText = () => {
    if (type === "history") {
      return order.status === "cancelled" ? "Cancelled" : "Completed";
    } else if (type === "scheduled") {
      return "Scheduled";
    } else if (type === "now") {
      return "In Progress";
    } else if (type === "confirmed") {
      return order.status === "looking_for_driver"
        ? "Looking for Driver"
        : "Confirmed";
    }
    return "";
  };

  const getStatusColor = () => {
    if (type === "history") {
      return order.status === "cancelled" ? "#F44336" : "#4CAF50";
    } else if (type === "scheduled") {
      return "#FF9800";
    } else if (type === "now") {
      return "#2196F3";
    } else if (type === "confirmed") {
      return order.status === "looking_for_driver" ? "#FF9800" : "#4CAF50";
    }
    return "#999"; // Default gray color
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {/* Fix the back button to check returnToOrders parameter */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (returnToOrders) {
                navigation.navigate("OrdersMain", { activeTab: type });
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
            {type === "scheduled" ? (
              <Text style={styles.headerTitle}>Scheduled</Text>
            ) : (
              <Text style={styles.headerTitle}>Order Details</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              // Only show action modal for "now" and "scheduled" orders
              if (type !== "confirmed" && type !== "history") {
                setShowActionModal(true);
              }
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor() + "20",
                  borderColor: getStatusColor(),
                },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderItems}>
            {order.items
              ? `${order.items.length} items`
              : `${order.dishes} dishes`}{" "}
            for {order.customer}
          </Text>

          {order.customerNotes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Customer Notes: </Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{order.customerNotes}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.contactSection}>
          <View style={styles.contactItem}>
            {order.customerImage ? (
              <Image
                source={{ uri: order.customerImage }}
                style={styles.contactAvatar}
              />
            ) : (
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>
                  {order.customer.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{order.customer}</Text>
              <Text style={styles.contactPhone}>
                {order.customerPhone || "0956 367 489"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                const contact: Contact = {
                  name: order.customer,
                  phone: order.customerPhone || "0956 367 489",
                  image: order.customerImage,
                };
                navigation.navigate("Call", { contact });
              }}
            >
              <Ionicons name="call-outline" size={20} color="#FF6B00" />
            </TouchableOpacity>
          </View>

          {(type === "confirmed" || (order.driver && order.driverPhone)) && (
            <View style={styles.contactItem}>
              {order.driverImage ? (
                <Image
                  source={{ uri: order.driverImage }}
                  style={[styles.contactAvatar, styles.driverAvatar]}
                />
              ) : (
                <View style={[styles.contactAvatar, styles.driverAvatar]}>
                  <Ionicons name="person-outline" size={20} color="#FF6B00" />
                </View>
              )}
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {order.driver || "Driver not assigned"}
                </Text>
                <Text style={styles.contactPhone}>
                  {order.driverPhone || (order.driver ? "0274 458 999" : "")}
                </Text>
              </View>
              {order.driver && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => {
                    const contact: Contact = {
                      name: order.driver || "Driver",
                      phone: order.driverPhone || "0274 458 999",
                      image: order.driverImage,
                    };
                    navigation.navigate("Call", { contact });
                  }}
                >
                  <Ionicons name="call-outline" size={20} color="#FF6B00" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.orderSummarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {order.items && order.items.map((item) => renderOrderItem(item))}

          <View style={styles.priceSummary}>
            <View style={styles.payoutRow}>
              <View style={styles.payoutLabelContainer}>
                <Ionicons name="wallet-outline" size={20} color="#FF6B00" />
                <Text style={styles.payoutLabel}>Payout Amount</Text>
              </View>
              <Text style={styles.payoutAmount}>
                {type === "history" && order.status === "cancelled"
                  ? "0 ₫"
                  : order.amount || "450.000 ₫"}
              </Text>
            </View>
          </View>
        </View>

        {type === "scheduled" && (
          <View style={styles.orderInfoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>{order.id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order time</Text>
              <Text style={styles.infoValue}>
                {order.scheduledTime || "Today 16:50"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{order.distance || "2.9km"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated pickup time</Text>
              <Text style={styles.infoValue}>
                {order.estimatedPickupTime || "Today 19:05"}
              </Text>
            </View>
          </View>
        )}

        {(type === "scheduled" || type === "now") && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {type === "confirmed" && order.driver && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.trackButton}
              onPress={handleTrackDriver}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color="#FF6B00"
                style={styles.buttonIcon}
              />
              <Text style={styles.trackButtonText}>Track Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.noticeButton}
              onPress={handleNoticeToDriver}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color="#333"
                style={styles.buttonIcon}
              />
              <Text style={styles.noticeButtonText}>Call Driver</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowActionModal(false)}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {(type === "now" || type === "scheduled") && (
                <>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowActionModal(false);
                      handleCancel();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel Order</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowActionModal(false);
                      handleEdit();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Edit Order</Text>
                  </TouchableOpacity>
                </>
              )}

              {type === "now" && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowActionModal(false);
                    handleMarkAsDone();
                  }}
                >
                  <Text style={styles.modalButtonText}>Mark as Done</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmModalHeader}>
              <Ionicons
                name="warning"
                size={40}
                color="#F44336"
                style={styles.warningIcon}
              />
              <Text style={styles.confirmModalTitle}>Cancel Order</Text>
              <Text style={styles.confirmModalMessage}>
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </Text>
            </View>

            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.confirmModalCancelButton}
                onPress={() => setShowCancelConfirmModal(false)}
              >
                <Text style={styles.confirmModalCancelText}>
                  No, Keep Order
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalConfirmButton}
                onPress={confirmCancel}
              >
                <Text style={styles.confirmModalConfirmText}>
                  Yes, Cancel Order
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  orderHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  orderItems: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  notesLabel: {
    fontSize: 14,
    color: "#666",
  },
  notesBox: {
    backgroundColor: "#FFF8F3",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  notesText: {
    fontSize: 14,
    color: "#FF6B00",
  },
  contactSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  driverAvatar: {
    backgroundColor: "#F5F5F5",
    borderColor: "#EEEEEE",
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: "#999",
  },
  callButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  orderSummarySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  orderItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  orderItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  orderItemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  orderItemSpicy: {
    fontSize: 12,
    color: "#FF6B00",
    marginBottom: 5,
  },
  orderItemExtra: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
  },
  priceSummary: {
    marginTop: 15,
  },
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 15,
    paddingHorizontal: 5,
  },
  payoutLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  payoutLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF6B00",
  },
  orderInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#FF6B00",
    fontSize: 16,
    fontWeight: "500",
  },
  editButton: {
    flex: 1,
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 10,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  noticeButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  noticeButtonText: {
    color: "#333",
    fontSize: 14,
  },
  trackButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  trackButtonText: {
    color: "#FF6B00",
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    paddingBottom: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  confirmModalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignSelf: "center",
  },
  confirmModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  warningIcon: {
    marginBottom: 10,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmModalButtons: {
    flexDirection: "column",
  },
  confirmModalCancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  confirmModalCancelText: {
    color: "#333",
    fontSize: 16,
  },
  confirmModalConfirmButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmModalConfirmText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OrderDetailScreen;
