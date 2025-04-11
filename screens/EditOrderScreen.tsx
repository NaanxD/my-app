"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { OrderItem, EditOrderParams, Contact } from "../index";
import { useAppContext } from "../contexts/AppContext";

type NavigationProp = {
  navigate: (screen: string, params: any) => void;
  goBack: () => void;
};

const EditOrderScreen = ({
  navigation,
  route,
}: {
  navigation: NavigationProp;
  route: any;
}) => {
  const { order } = route.params as EditOrderParams;
  const { cancelOrder, updateOrder } = useAppContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<OrderItem[]>(
    order.items || [
      {
        name: "Crab Soup",
        quantity: 1,
        price: "450.000",
        description: "Fresh Crab Meat",
        extras: ["1 x Chicken", "1 x Shrimp"],
      },
    ]
  );

  // COMPLETELY REWRITTEN: handleContinue function
  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tính tổng giá từ tất cả các món
      const totalPrice = items.reduce((sum, item) => {
        // Lấy giá hiện tại (đã bao gồm số lượng)
        const itemPrice = item.price.replace(/\./g, "").replace("₫", "").trim();
        return sum + parseInt(itemPrice, 10);
      }, 0);

      // Cập nhật order trong context
      updateOrder(order.id, {
        items: items,
        amount: formatPrice(totalPrice),
        dishes: items.length,
      });

      // Tạo đơn hàng đã cập nhật để điều hướng
      const updatedOrder = {
        ...order,
        items: items,
        amount: formatPrice(totalPrice),
        dishes: items.length,
      };

      // Điều hướng đến Chi tiết đơn hàng với đơn hàng đã cập nhật
      navigation.navigate("OrderDetail", {
        order: updatedOrder,
        type: order.status || "now",
        returnToOrders: true,
      });
    }
  };

  // COMPLETELY REWRITTEN: handleDeleteItem function
  const handleDeleteItem = (index: number) => {
    // Tạo mảng mới không bao gồm món tại index
    const newItems = [...items];
    newItems.splice(index, 1);

    // Nếu không còn món nào
    if (newItems.length === 0) {
      // Hủy đơn và chuyển về history
      cancelOrder(order.id, order.status || "now");

      // Chuyển về màn hình History
      navigation.navigate("OrdersMain", { activeTab: "history" });
      return;
    }

    // Cập nhật state với mảng mới
    setItems(newItems);

    // Cập nhật đơn hàng trong context
    updateOrder(order.id, {
      items: newItems,
      dishes: newItems.length,
    });
  };

  // COMPLETELY REWRITTEN: updateItemQuantity function
  const updateItemQuantity = (index: number, increment: boolean) => {
    // Tạo bản sao của mảng items
    const newItems = [...items];
    const item = newItems[index];

    // Tính số lượng mới
    const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;

    // Nếu số lượng = 0, gọi hàm xóa món
    if (newQuantity <= 0) {
      handleDeleteItem(index);
      return;
    }

    // Tính giá cơ bản (mỗi đơn vị)
    const basePrice = extractBasePrice(item.price, item.quantity);

    // Tính tổng giá mới cho món này
    const newTotalPrice = basePrice * newQuantity;

    // Cập nhật món với số lượng và giá mới
    newItems[index] = {
      ...item,
      quantity: newQuantity,
      price: formatPrice(newTotalPrice),
    };

    // Cập nhật state
    setItems(newItems);

    // Cập nhật đơn hàng trong context
    updateOrder(order.id, {
      items: newItems,
      dishes: newItems.length,
    });
  };

  // Helper function to extract base price from formatted price string
  const extractBasePrice = (priceString: string, quantity: number): number => {
    // Remove dots, currency symbol and whitespace
    const cleanPrice = priceString.replace(/\./g, "").replace("₫", "").trim();
    // Convert to number and divide by quantity to get base price
    return parseInt(cleanPrice, 10) / quantity;
  };

  // Helper function to format price in Vietnamese currency format
  const formatPrice = (amount: number): string => {
    return amount.toLocaleString("vi-VN").replace(",", ".") + " ₫";
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Please call the customer to notify about the change
      </Text>

      <View style={styles.customerCard}>
        {order.customerImage ? (
          <Image
            source={{ uri: order.customerImage }}
            style={styles.customerAvatar}
          />
        ) : null}
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customer}</Text>
          <Text style={styles.customerPhone}>
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
          <Ionicons name="call" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <View style={styles.noticeContainer}>
        <Text style={styles.noticeTitle}>Notice</Text>
        <View style={styles.noticeList}>
          <Text style={styles.noticeItem}>
            • Please call the customer during the editing process.
          </Text>
          <Text style={styles.noticeItem}>
            • The restaurant may be fined if they do not notify the customer.
          </Text>
          <Text style={styles.noticeItem}>
            • The order can only be edited once.
          </Text>
        </View>
      </View>

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonTitle}>Reason for editing</Text>
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              reason === "incorrect" && styles.checkboxChecked,
            ]}
            onPress={() => setReason("incorrect")}
          >
            {reason === "incorrect" && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Incorrect dish</Text>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              reason === "outofstock" && styles.checkboxChecked,
            ]}
            onPress={() => setReason("outofstock")}
          >
            {reason === "outofstock" && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Dish is out of stock</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !reason && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!reason}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select items to edit</Text>

      {items.map((item, index) => (
        <View key={index} style={styles.editableItem}>
          <View style={styles.editableItemHeader}>
            <Text style={styles.editableItemName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.deleteItemButton}
              onPress={() => handleDeleteItem(index)}
            >
              <Text style={styles.deleteItemButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.editableItemDescription}>
            {item.description || ""}
          </Text>

          {item.extras && item.extras.length > 0 && (
            <View style={styles.extrasContainer}>
              {item.extras.map((extra, i) => (
                <Text key={i} style={styles.extraItem}>
                  • {extra}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.editableItemPrice}>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateItemQuantity(index, false)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateItemQuantity(index, true)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => {
    // Tính toán đơn giá cho mỗi món (price per item)
    const itemsWithUnitPrice = items.map((item) => {
      const totalItemPrice = item.price
        .replace(/\./g, "")
        .replace("₫", "")
        .trim();
      const unitPrice = Math.round(
        parseInt(totalItemPrice, 10) / item.quantity
      );
      return {
        ...item,
        unitPrice: formatPrice(unitPrice),
      };
    });

    // Tính tổng tiền toàn bộ đơn hàng
    const totalOrderAmount = items.reduce((sum, item) => {
      const itemPrice = item.price.replace(/\./g, "").replace("₫", "").trim();
      return sum + parseInt(itemPrice, 10);
    }, 0);

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Review Order</Text>
        <ScrollView style={styles.itemList}>
          {itemsWithUnitPrice.map((item, index) => (
            <View key={index} style={styles.reviewItem}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>
                  {item.description || ""}
                </Text>
                {item.extras && item.extras.length > 0 && (
                  <Text style={styles.itemExtras}>
                    {item.extras.join(", ")}
                  </Text>
                )}
              </View>
              <View style={styles.reviewItemRight}>
                <Text style={styles.reviewQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemUnitPrice}>{item.unitPrice}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>Total Amount:</Text>
          <Text style={styles.orderTotalAmount}>
            {formatPrice(totalOrderAmount)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, { marginTop: 20 }]}
          onPress={handleContinue}
        >
          <Text style={styles.confirmButtonText}>Confirm Changes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          {currentStep === 3 ? (
            <Ionicons name="chevron-back" size={24} color="#333" />
          ) : (
            <Ionicons name="close" size={24} color="#333" />
          )}
          <Text style={styles.headerTitle}>Edit Order</Text>
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          <View
            style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]}
          />
          <View style={styles.stepLine} />
          <View
            style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]}
          />
          <View style={styles.stepLine} />
          <View
            style={[styles.stepDot, currentStep >= 3 && styles.activeStepDot]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
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
    marginLeft: 10,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDDDDD",
  },
  activeStepDot: {
    backgroundColor: "#FF6B00",
  },
  stepLine: {
    width: 12,
    height: 1,
    backgroundColor: "#DDDDDD",
    marginHorizontal: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F3",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  customerPhone: {
    fontSize: 14,
    color: "#666",
  },
  callButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  noticeContainer: {
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  noticeList: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 15,
  },
  noticeItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  reasonContainer: {
    marginBottom: 30,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  continueButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  orderInfoLabel: {
    fontSize: 14,
    color: "#666",
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  orderListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
  },
  editableItem: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  editableItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  editableItemQuantity: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  editableItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  editableItemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  extrasContainer: {
    marginBottom: 10,
  },
  extraItem: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  deleteItemButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteItemButtonText: {
    fontSize: 12,
    color: "#FF6B00",
  },
  editableItemPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 10,
    width: 20,
    textAlign: "center",
  },
  previewButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  previewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemList: {
    flexGrow: 1,
  },
  reviewItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
  },
  itemExtras: {
    fontSize: 12,
    color: "#666",
  },
  reviewItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewQuantity: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  orderTotalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  confirmButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemUnitPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});

export default EditOrderScreen;
