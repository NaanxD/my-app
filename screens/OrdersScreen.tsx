"use client";

import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from "@react-navigation/native";
import {
  scheduledOrders,
  nowOrders,
  confirmedOrders,
  historyOrders,
} from "../data/orders";
import { Calendar } from "react-native-calendars";
import { useAppContext, OrderStats } from "../contexts/AppContext";

// Type definitions
interface Order {
  id: string;
  customer: string;
  customerImage?: string;
  pickup?: string;
  dishes: number;
  distance: string;
  amount: string;
  status?: string;
  delivery?: string;
  scheduledTime?: string;
  estimatedPickupTime?: string;
  driver?: string;
  driverPhone?: string;
  driverImage?: string;
  date?: string;
  items?: {
    name: string;
    quantity: number;
    price: string;
    description: string;
  }[];
}

interface OrdersState {
  scheduled: Order[];
  now: Order[];
  confirmed: Order[];
  history: Order[];
  [key: string]: Order[]; // Add index signature
}

interface DateRange {
  start: string | null;
  end: string | null;
}

interface DailyStats {
  netSales: string;
  completed: number;
  cancelled: number;
  orders: Order[];
}

interface DailyStatsMap {
  [date: string]: DailyStats;
}

type RootStackParamList = {
  OrderDetail: {
    order: Order;
    type: string;
    onCancel?: (sourceTab?: string) => Promise<void>;
    onEdit?: () => void;
    onDone?: () => void;
    showMoreOptions?: boolean;
    sourceTab?: string;
  };
  EditOrder: {
    order: Order;
    sourceTab?: string;
    onCancel?: (sourceTab?: string) => Promise<void>;
  };
  Call: {
    contact: {
      name: string;
      phone: string;
      image?: string;
    };
  };
  TrackDriver: {
    driver: {
      name: string;
      phone: string;
      image?: string;
    };
  };
  OrdersMain: { activeTab?: string };
};

const formatMoney = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
};

const generateSampleData = () => {
  const data: DailyStatsMap = {};
  const today = new Date();

  // Generate sample data for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Fixed data for today
    if (i === 0) {
      data[dateStr] = {
        netSales: formatMoney(691215),
        completed: 4,
        cancelled: 1,
        orders: [
          {
            id: "F-123",
            customer: "John Doe",
            pickup: "19:05",
            dishes: 1,
            distance: "2.9km",
            amount: "387.200 ₫",
            status: "cancelled",
            date: displayDate,
          },
          {
            id: "F-124",
            customer: "Alice Smith",
            pickup: "18:30",
            dishes: 2,
            distance: "1.5km",
            amount: "156.000 ₫",
            status: "completed",
            date: displayDate,
          },
          {
            id: "F-125",
            customer: "Bob Wilson",
            pickup: "19:15",
            dishes: 3,
            distance: "3.2km",
            amount: "234.000 ₫",
            status: "completed",
            date: displayDate,
          },
          {
            id: "F-126",
            customer: "Carol Brown",
            pickup: "20:00",
            dishes: 1,
            distance: "2.1km",
            amount: "145.000 ₫",
            status: "completed",
            date: displayDate,
          },
          {
            id: "F-127",
            customer: "David Lee",
            pickup: "20:30",
            dishes: 2,
            distance: "1.8km",
            amount: "156.215 ₫",
            status: "completed",
            date: displayDate,
          },
        ],
      };
    } else {
      // Generate data for past dates with more realistic numbers
      const completed = Math.floor(3 + Math.random() * 5);
      const cancelled = Math.floor(1 + Math.random() * 3);
      const netSales = Math.floor(300000 + Math.random() * 500000);

      data[dateStr] = {
        netSales: formatMoney(netSales),
        completed,
        cancelled,
        orders: [
          // Generate completed orders for past dates
          ...Array(completed)
            .fill(null)
            .map((_, j) => ({
              id: `F-${500 + j}-${dateStr}`,
              customer: `Customer ${j + 1}`,
              pickup: "19:05",
              dishes: Math.floor(1 + Math.random() * 3),
              distance: `${(1 + Math.random() * 3).toFixed(1)}km`,
              amount: formatMoney(Math.floor(100000 + Math.random() * 300000)),
              status: "completed",
              date: displayDate,
            })),
          // Generate cancelled orders for past dates
          ...Array(cancelled)
            .fill(null)
            .map((_, j) => ({
              id: `F-${400 + j}-${dateStr}`,
              customer: `Customer ${completed + j + 1}`,
              pickup: "19:05",
              dishes: Math.floor(1 + Math.random() * 3),
              distance: `${(1 + Math.random() * 3).toFixed(1)}km`,
              amount: formatMoney(Math.floor(100000 + Math.random() * 300000)),
              status: "cancelled",
              date: displayDate,
            })),
        ],
      };
    }
  }
  return data;
};

const OrdersScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {
    orders: orderData,
    moveOrderToTab,
    cancelOrder: cancelOrderContext,
    markOrderAsDone: markOrderAsDoneContext,
    getOrderStats,
    getOrdersByDateRange,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<string>("now");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeStatus, setStoreStatus] = useState("normal"); // 'normal' or 'paused'
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "completed" | "cancelled"
  >("all");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const [selectedDate, setSelectedDate] = useState(todayFormatted);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  // Get current stats based on the selected date range
  const [currentStats, setCurrentStats] = useState<OrderStats>(
    getOrderStats({ start: null, end: null })
  );

  // Update stats whenever the date range changes
  useEffect(() => {
    setCurrentStats(getOrderStats(dateRange));
  }, [dateRange, orderData.history]);

  const [notificationCount, setNotificationCount] = useState(3);

  // Effect to handle activeTab passed from navigation params
  useEffect(() => {
    if (route.params && "activeTab" in route.params) {
      const requestedTab = route.params.activeTab as string;
      console.log("Setting active tab to:", requestedTab);
      setActiveTab(requestedTab);
    }
  }, [route.params]);

  const handleEditOrder = (order: Order) => {
    navigation.navigate("EditOrder", { order });
  };

  const handleOrderPress = (order: Order) => {
    if (activeTab === "scheduled") {
      navigation.navigate("OrderDetail", {
        order,
        type: "scheduled",
        onCancel: async (sourceTab?: string) =>
          await handleCancelOrder(order.id, "scheduled"),
        onEdit: () => navigation.navigate("EditOrder", { order }),
      });
    } else if (activeTab === "now") {
      navigation.navigate("OrderDetail", {
        order,
        type: "now",
        onDone: () => handleMarkAsDone(order.id),
        onCancel: async (sourceTab?: string) =>
          await handleCancelOrder(order.id, "now"),
      });
    } else if (activeTab === "confirmed") {
      navigation.navigate("OrderDetail", {
        order,
        type: "confirmed",
      });
    } else {
      if (
        order.status === "cancelled" &&
        (!order.items || order.items.length === 0)
      ) {
        const enhancedOrder = {
          ...order,
          items: [
            {
              name: "Cancelled",
              quantity: 1,
              price: order.amount || "0 ₫",
              description: "This order has been cancelled",
            },
          ],
        };

        navigation.navigate("OrderDetail", {
          order: enhancedOrder,
          type: "history",
        });
      } else {
        navigation.navigate("OrderDetail", {
          order,
          type: "history",
        });
      }
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    // Determine status color
    let statusColor = "#4CAF50"; // Default green for completed
    let statusDot = null;

    if (activeTab === "history") {
      if (item.status === "cancelled") {
        statusColor = "#F44336"; // Red for cancelled
      }
      statusDot = (
        <View
          style={[styles.statusDotIndicator, { backgroundColor: statusColor }]}
        />
      );
    } else if (
      activeTab === "confirmed" &&
      item.status === "looking_for_driver"
    ) {
      statusColor = "#FF9800"; // Orange for looking for driver
      statusDot = (
        <View
          style={[styles.statusDotIndicator, { backgroundColor: statusColor }]}
        />
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.orderItem,
          activeTab === "history" &&
            item.status === "cancelled" &&
            styles.cancelledOrderItem,
        ]}
        onPress={() => handleOrderPress(item)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>{item.id.split("-")[0]}</Text>
            </View>
            <Text style={styles.orderId}>{item.id}</Text>
            {activeTab === "confirmed" && item.delivery && (
              <Text style={styles.deliveryTime}>
                Delivery at {item.delivery}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.customerRow}>
            {item.customerImage && (
              <Image
                source={{ uri: item.customerImage }}
                style={styles.customerImage}
              />
            )}
            <Text style={styles.customerName}>{item.customer}</Text>
            {statusDot}
          </View>

          {activeTab === "confirmed" &&
            item.status === "looking_for_driver" && (
              <Text style={styles.driverStatus}>
                Status: Looking for a driver
              </Text>
            )}

          {activeTab === "confirmed" && item.driver && (
            <View style={styles.driverRow}>
              {item.driverImage && (
                <Image
                  source={{ uri: item.driverImage }}
                  style={styles.driverImage}
                />
              )}
              <Text style={styles.driverName}>Driver: {item.driver}</Text>
            </View>
          )}

          {activeTab === "history" && (
            <Text
              style={{
                color: statusColor,
                fontSize: 12,
                fontWeight: "500",
                marginBottom: 5,
              }}
            >
              {item.status === "cancelled" ? "Cancelled" : "Completed"}
            </Text>
          )}

          <View style={styles.orderMetrics}>
            {item.pickup && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Pickup</Text>
                <Text style={styles.metricValue}>{item.pickup}</Text>
              </View>
            )}

            {item.dishes && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Dishes</Text>
                <Text style={styles.metricValue}>{item.dishes}</Text>
              </View>
            )}

            {item.distance && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Distance</Text>
                <Text style={styles.metricValue}>{item.distance}</Text>
              </View>
            )}
          </View>

          <View style={styles.orderFooter}>
            {item.amount && (
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>{item.amount}</Text>
              </View>
            )}

            {activeTab === "now" && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    navigation.navigate("OrderDetail", {
                      order: item,
                      type: "now",
                      showMoreOptions: true,
                      onDone: () => handleMarkAsDone(item.id),
                      onCancel: async (sourceTab?: string) =>
                        await handleCancelOrder(item.id, "now"),
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>More</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.doneButton]}
                  onPress={() => handleMarkAsDone(item.id)}
                >
                  <Text
                    style={{ color: "white", fontWeight: "500", fontSize: 12 }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === "confirmed" && item.driver && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => {
                    if (item.driver) {
                      navigation.navigate("TrackDriver", {
                        driver: {
                          name: item.driver,
                          phone: item.driverPhone || "",
                          image: item.driverImage || "",
                        },
                      });
                    }
                  }}
                >
                  <Ionicons name="location-outline" size={16} color="#FF6B00" />
                  <Text style={styles.trackButtonText}>Track</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.noticeButton}
                  onPress={() =>
                    navigation.navigate("Call", {
                      contact: {
                        name: item.driver || "Driver",
                        phone: item.driverPhone || "",
                        image: item.driverImage || "",
                      },
                    })
                  }
                >
                  <Ionicons name="call-outline" size={16} color="#333" />
                  <Text style={styles.noticeButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleMarkAsDone = (orderId: string): void => {
    markOrderAsDoneContext(orderId);
    Alert.alert(
      "Success",
      "Order has been moved to Confirmed tab with 'Looking for driver' status"
    );
    // Switch to confirmed tab
    setActiveTab("confirmed");
  };

  const handleCancelOrder = async (
    orderId: string,
    sourceTab: string
  ): Promise<void> => {
    try {
      cancelOrderContext(orderId, sourceTab);

      if (notificationCount > 0) {
        setNotificationCount((prev) => prev - 1);
      }

      // Switch to History tab after cancellation
      setActiveTab("history");

      Alert.alert(
        "Success",
        "Order has been cancelled and moved to History tab"
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert("Error", "Failed to cancel order. Please try again.");
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No orders found</Text>
    </View>
  );

  const getFilteredOrders = () => {
    let ordersToFilter = orderData[activeTab as keyof typeof orderData] || [];

    // Apply search filter
    if (searchQuery) {
      ordersToFilter = ordersToFilter.filter((order) =>
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return ordersToFilter;
  };

  const toggleStoreStatus = () => {
    setShowStatusModal(true);
  };

  const selectDateRange = (start: string | null, end: string | null): void => {
    if (start && end && new Date(start) > new Date(end)) {
      Alert.alert("Invalid Date Range", "Start date cannot be after end date");
      return;
    }

    setDateRange({ start, end });
    setShowCalendarModal(false);

    // Format the selected date range for display
    if (start && end) {
      setSelectedDate(`${start} - ${end}`);
    } else if (start) {
      setSelectedDate(start);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const [calendarMode, setCalendarMode] = useState<"single" | "range">(
    "single"
  );
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const renderCalendarModal = () => {
    // Set up date marking for the calendar
    const markedDates: any = {};

    // If we have a date range, mark all dates in the range
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      // Mark the start date
      const startDateStr = start.toISOString().split("T")[0];
      markedDates[startDateStr] = {
        startingDay: true,
        color: "#FF6B00",
        textColor: "#FFFFFF",
      };

      // Mark dates in between
      let currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + 1);

      while (currentDate < end) {
        const dateStr = currentDate.toISOString().split("T")[0];
        markedDates[dateStr] = {
          color: "#FFE2D1",
          textColor: "#FF6B00",
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Mark the end date
      const endDateStr = end.toISOString().split("T")[0];
      markedDates[endDateStr] = {
        endingDay: true,
        color: "#FF6B00",
        textColor: "#FFFFFF",
      };
    }
    // If we only have a start date (single selection mode)
    else if (dateRange.start) {
      const dateStr = new Date(dateRange.start).toISOString().split("T")[0];
      markedDates[dateStr] = {
        selected: true,
        selectedColor: "#FF6B00",
        textColor: "#FFFFFF",
      };
    }

    // Determine the marking type based on calendar mode
    const markingType = calendarMode === "range" ? "period" : "single";

    // Get today's date as string to allow selection up to today
    const todayStr = new Date().toISOString().split("T")[0];

    // Get current month and year for display from the state
    const currentMonth = currentMonthDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentMonthDate.getFullYear();

    // Hàm để chuyển tháng hiển thị
    const changeMonth = (direction: "prev" | "next") => {
      const newDate = new Date(currentMonthDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentMonthDate(newDate);
    };

    return (
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCalendarModal(false)}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarModeContainer}>
              <TouchableOpacity
                style={[
                  styles.calendarModeButton,
                  calendarMode === "single" && styles.calendarModeButtonActive,
                ]}
                onPress={() => {
                  setCalendarMode("single");
                  // Reset selection when changing modes
                  setDateRange({ start: null, end: null });
                }}
              >
                <Text
                  style={[
                    styles.calendarModeButtonText,
                    calendarMode === "single" &&
                      styles.calendarModeButtonTextActive,
                  ]}
                >
                  Single Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.calendarModeButton,
                  calendarMode === "range" && styles.calendarModeButtonActive,
                ]}
                onPress={() => {
                  setCalendarMode("range");
                  // Reset selection when changing modes
                  setDateRange({ start: null, end: null });
                }}
              >
                <Text
                  style={[
                    styles.calendarModeButtonText,
                    calendarMode === "range" &&
                      styles.calendarModeButtonTextActive,
                  ]}
                >
                  Date Range
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.calendarInfoTextContent}>
              {calendarMode === "single"
                ? "Select a date to filter orders"
                : dateRange.start && !dateRange.end
                ? "Select end date to complete the range"
                : "Select start date for the range"}
            </Text>

            <View style={styles.calendarMonthHeader}>
              <TouchableOpacity onPress={() => changeMonth("prev")}>
                <Ionicons name="chevron-back" size={24} color="#FF6B00" />
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>
                {currentMonth} {currentYear}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const nextMonth = new Date(currentMonthDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  // Chỉ cho phép chuyển đến tháng hiện tại (không vượt quá hiện tại)
                  const today = new Date();
                  if (
                    nextMonth.getFullYear() <= today.getFullYear() &&
                    nextMonth.getMonth() <= today.getMonth()
                  ) {
                    changeMonth("next");
                  }
                }}
              >
                <Ionicons name="chevron-forward" size={24} color="#FF6B00" />
              </TouchableOpacity>
            </View>

            <Calendar
              current={currentMonthDate.toISOString()}
              markingType={markingType}
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => {
                const selectedDate = new Date(day.dateString);
                // Check if date is in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate > today) {
                  Alert.alert("Invalid Date", "You cannot select future dates");
                  return;
                }

                // Luôn cho phép chọn bất kỳ ngày hợp lệ nào, kể cả ngày hiện tại
                // Không có điều kiện giới hạn nào dựa trên lựa chọn trước đó
                if (calendarMode === "single") {
                  // Single date mode - chọn ngày nhưng không đóng modal ngay
                  setDateRange({
                    start: day.dateString,
                    end: null,
                  });
                  const formatted = new Date(day.dateString).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );
                  setSelectedDate(formatted);

                  // Update stats based on this date
                  setCurrentStats(
                    getOrderStats({
                      start: day.dateString,
                      end: null,
                    })
                  );

                  // Không đóng modal ngay, cho người dùng nhấn Apply hoặc chọn lại
                } else {
                  // Range mode - select start and end dates
                  if (!dateRange.start || (dateRange.start && dateRange.end)) {
                    // If no start date or both dates are set, start a new range
                    setDateRange({
                      start: day.dateString,
                      end: null,
                    });
                  } else {
                    // If we have a start date but no end date
                    const start = new Date(dateRange.start);
                    const selected = new Date(day.dateString);

                    // If selected date is before start date, make it the new start date
                    if (selected < start) {
                      setDateRange({
                        start: day.dateString,
                        end: null,
                      });
                    } else {
                      // Complete the range
                      setDateRange({
                        start: dateRange.start,
                        end: day.dateString,
                      });

                      // Format dates for display
                      const startFormatted = new Date(
                        dateRange.start
                      ).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      });
                      const endFormatted = new Date(
                        day.dateString
                      ).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      setSelectedDate(`${startFormatted} - ${endFormatted}`);

                      // Update stats based on date range
                      setCurrentStats(
                        getOrderStats({
                          start: dateRange.start,
                          end: day.dateString,
                        })
                      );
                    }
                  }
                }
              }}
              // Allow selection up to today (inclusive)
              maxDate={todayStr}
              // Đảm bảo ngày hiện tại luôn có thể chọn được
              disableAllTouchEventsForDisabledDays={false}
              hideArrows={true} // We're using our custom arrows
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                selectedDayBackgroundColor: "#FF6B00",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#FF6B00",
                dayTextColor: "#333333",
                textDisabledColor: "#d9e1e8",
                dotColor: "#FF6B00",
                selectedDotColor: "#ffffff",
                monthTextColor: "#333333",
                textDayFontSize: 16,
                textMonthFontSize: 0, // Hide default month text as we have a custom header
                textDayHeaderFontSize: 14,
                textDayHeaderFontWeight: "500",
                textSectionTitleColor: "#b6c1cd",
                "stylesheet.day.period": {
                  base: {
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  today: {
                    borderWidth: 1,
                    borderColor: "#FF6B00",
                  },
                  todayText: {
                    color: "#FF6B00",
                    fontWeight: "bold",
                  },
                  selectedText: {
                    color: "white",
                    fontWeight: "bold",
                  },
                  rightFillerText: {
                    color: "#FF6B00",
                  },
                  leftFillerText: {
                    color: "#FF6B00",
                  },
                },
                "stylesheet.day.single": {
                  base: {
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  today: {
                    borderWidth: 1,
                    borderColor: "#FF6B00",
                    borderRadius: 18,
                  },
                  selected: {
                    backgroundColor: "#FF6B00",
                    borderRadius: 18,
                  },
                  disabled: {
                    color: "#cccccc",
                  },
                },
                "stylesheet.calendar.header": {
                  header: {
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingTop: 0,
                    paddingBottom: 10,
                    alignItems: "center",
                  },
                  monthText: {
                    display: "none", // Hide default month text
                  },
                  week: {
                    marginTop: 0,
                    flexDirection: "row",
                    justifyContent: "space-around",
                  },
                  dayHeader: {
                    marginTop: 0,
                    marginBottom: 10,
                    width: 36,
                    textAlign: "center",
                    fontSize: 14,
                    color: "#b6c1cd",
                  },
                },
                "stylesheet.calendar.main": {
                  container: {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                  week: {
                    marginTop: 5,
                    marginBottom: 5,
                    flexDirection: "row",
                    justifyContent: "space-around",
                  },
                },
              }}
            />

            <View style={styles.calendarFooter}>
              <TouchableOpacity
                style={styles.calendarClearButton}
                onPress={() => {
                  // Xóa các lựa chọn ngày
                  setDateRange({ start: null, end: null });
                  setSelectedDate(todayFormatted);
                  // Reset stats to overall stats
                  setCurrentStats(getOrderStats({ start: null, end: null }));
                  // Không đóng lịch khi clear filter, để người dùng có thể chọn ngày hiện tại
                }}
              >
                <Text style={styles.calendarClearButtonText}>Clear Filter</Text>
              </TouchableOpacity>

              {(calendarMode === "range" && dateRange.start && dateRange.end) ||
              (calendarMode === "single" && dateRange.start) ? (
                <TouchableOpacity
                  style={styles.calendarApplyButton}
                  onPress={() => setShowCalendarModal(false)}
                >
                  <Text style={styles.calendarApplyButtonText}>
                    Apply Filter
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderHistoryHeader = () => (
    <View style={styles.historyHeader}>
      <Text style={styles.historyDateLabel}>Date Range</Text>
      <TouchableOpacity
        style={styles.historyDateSelector}
        onPress={() => setShowCalendarModal(true)}
      >
        <Text style={styles.historyDateText}>
          {dateRange.start && dateRange.end
            ? selectedDate // This will show the formatted date range
            : dateRange.start
            ? new Date(dateRange.start).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : todayFormatted}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#333" />
      </TouchableOpacity>

      <View style={styles.historySummary}>
        <Text style={styles.historyAmount}>{currentStats.netSales}</Text>
        <Text style={styles.historyAmountLabel}>Net sales</Text>
        <Text style={styles.historyAmountDescription}>
          This is your sales amount before adjustments and deductions.
        </Text>
      </View>

      <View style={styles.historyStats}>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatNumber}>{currentStats.completed}</Text>
          <Text style={styles.historyStatLabel}>Order Completed</Text>
        </View>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatNumber}>{currentStats.cancelled}</Text>
          <Text style={styles.historyStatLabel}>Order Cancelled</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status</Text>
        <TouchableOpacity
          style={styles.filterSelector}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterSelectorText}>
            {filterType === "all"
              ? "All"
              : filterType === "completed"
              ? "Completed"
              : "Cancelled"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filterOrdersByDateRange = (orders: Order[], dateRange: DateRange) => {
    // Use the context function
    if (activeTab === "history") {
      return getOrdersByDateRange(dateRange);
    }
    return orders;
  };

  const filteredItems = useMemo(() => {
    // First apply status filter if in history tab
    let filteredByStatus = orderData[activeTab as keyof typeof orderData];

    if (activeTab === "history") {
      // Get orders for the date range first
      let dateFilteredOrders = getOrdersByDateRange(dateRange);

      // Then apply status filter if needed
      if (filterType !== "all") {
        dateFilteredOrders = dateFilteredOrders.filter(
          (order) => order.status === filterType
        );
      }

      // Then apply search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        return dateFilteredOrders.filter(
          (order) =>
            order.customer.toLowerCase().includes(query) ||
            order.id.toLowerCase().includes(query)
        );
      }

      return dateFilteredOrders;
    } else {
      // For non-history tabs, apply only search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        return filteredByStatus.filter(
          (order) =>
            order.customer.toLowerCase().includes(query) ||
            order.id.toLowerCase().includes(query)
        );
      }

      return filteredByStatus;
    }
  }, [
    activeTab,
    searchQuery,
    dateRange,
    orderData,
    filterType,
    getOrdersByDateRange,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.headerTitle}>ORDERS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            storeStatus === "normal"
              ? styles.statusNormal
              : styles.statusPaused,
          ]}
          onPress={toggleStoreStatus}
        >
          <Ionicons
            name={storeStatus === "normal" ? "checkmark" : "pause"}
            size={16}
            color="white"
          />
          <Text style={styles.statusText}>
            {storeStatus === "normal" ? "NORMAL" : "PAUSED"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "scheduled" && styles.activeTab]}
          onPress={() => setActiveTab("scheduled")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "scheduled" && styles.activeTabLabel,
            ]}
          >
            Scheduled
          </Text>
          {orderData.scheduled.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {orderData.scheduled.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "now" && styles.activeTab]}
          onPress={() => setActiveTab("now")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "now" && styles.activeTabLabel,
            ]}
          >
            Now
          </Text>
          {orderData.now.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{orderData.now.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "confirmed" && styles.activeTab]}
          onPress={() => setActiveTab("confirmed")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "confirmed" && styles.activeTabLabel,
            ]}
          >
            Confirmed
          </Text>
          {orderData.confirmed.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {orderData.confirmed.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "history" && styles.activeTabLabel,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === "history"
                ? "Search by order ID or customer name"
                : "Search by order ID (e.g., F-123) or customer name"
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            if (activeTab === "history") {
              setShowFilterModal(true);
            }
          }}
        >
          <Ionicons name="options-outline" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      {activeTab !== "history" && (
        <View style={styles.dateHeader}>
          <Text style={styles.dateLabel}>Today</Text>
          {activeTab === "scheduled" && (
            <Text style={styles.dateValue}>Scheduled</Text>
          )}
        </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        ListHeaderComponent={
          activeTab === "history" ? renderHistoryHeader : null
        }
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={true}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Orders</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === "all" && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setFilterType("all");
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>All</Text>
              {filterType === "all" && (
                <Ionicons name="checkmark" size={20} color="#FF6B00" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === "completed" && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setFilterType("completed");
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>Completed</Text>
              {filterType === "completed" && (
                <Ionicons name="checkmark" size={20} color="#FF6B00" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === "cancelled" && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setFilterType("cancelled");
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>Cancelled</Text>
              {filterType === "cancelled" && (
                <Ionicons name="checkmark" size={20} color="#FF6B00" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderCalendarModal()}

      {/* Store Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Store Status</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setStoreStatus("normal");
                setShowStatusModal(false);
              }}
            >
              <View style={[styles.modalStatusDot, styles.statusDotNormal]} />
              <View style={styles.modalOptionTextContainer}>
                <Text style={styles.modalOptionTitle}>NORMAL</Text>
                <Text style={styles.modalOptionDescription}>
                  Accept all incoming orders
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setStoreStatus("paused");
                setShowStatusModal(false);
              }}
            >
              <View style={[styles.modalStatusDot, styles.statusDotPaused]} />
              <View style={styles.modalOptionTextContainer}>
                <Text style={styles.modalOptionTitle}>PAUSED</Text>
                <Text style={styles.modalOptionDescription}>
                  Temporarily stop incoming orders
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusNormal: {
    backgroundColor: "#4CAF50",
  },
  statusPaused: {
    backgroundColor: "#F44336",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B00",
  },
  tabLabel: {
    fontSize: 14,
    color: "#999",
  },
  activeTabLabel: {
    color: "#FF6B00",
    fontWeight: "500",
  },
  tabBadge: {
    position: "absolute",
    top: 8,
    right: 15,
    backgroundColor: "#FF6B00",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  filterButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
  },
  dateValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  cancelledOrderItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#F44336",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderBadge: {
    backgroundColor: "#FF6B00",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  orderBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  deliveryTime: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  orderDetails: {
    marginTop: 5,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  customerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusDotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  driverStatus: {
    fontSize: 12,
    color: "#FF9800",
    marginBottom: 5,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  driverImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  driverName: {
    fontSize: 12,
    color: "#666",
  },
  orderMetrics: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 15,
  },
  metricItem: {
    marginRight: 20,
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    color: "#333",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginLeft: 10,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#333",
  },
  doneButton: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FF6B00",
    marginLeft: 10,
  },
  trackButtonText: {
    fontSize: 12,
    color: "#FF6B00",
    marginLeft: 4,
  },
  noticeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginLeft: 10,
  },
  noticeButtonText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  historyHeader: {
    paddingBottom: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  historyDateLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  historyDateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 10,
    minHeight: 44,
  },
  historyDateText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  historySummary: {
    marginTop: 20,
    marginBottom: 15,
  },
  historyAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B00",
    marginBottom: 5,
  },
  historyAmountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  historyAmountDescription: {
    fontSize: 12,
    color: "#999",
  },
  historyStats: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 15,
  },
  historyStatItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 5,
  },
  historyStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  historyStatLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  filterSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  filterSelectorText: {
    fontSize: 12,
    color: "#333",
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  calendarModalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    padding: 5,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  filterOptionSelected: {
    backgroundColor: "#FFF8F3",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 15,
  },
  statusDotNormal: {
    backgroundColor: "#4CAF50",
  },
  statusDotPaused: {
    backgroundColor: "#F44336",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: "#999",
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#FF6B00",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 15,
  },
  simpleDateSelector: {
    padding: 15,
  },
  simpleDateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  simpleDateOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  simpleDateOptionText: {
    fontSize: 16,
    color: "#FF6B00",
  },
  calendarInfoText: {
    marginBottom: 12,
    alignItems: "center",
  },
  calendarInfoTextContent: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  calendarButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  calendarClearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  calendarClearButtonText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  calendarApplyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: "#FF6B00",
  },
  calendarApplyButtonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
  calendarModeContainer: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  calendarModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  calendarModeButtonActive: {
    backgroundColor: "#FF6B00",
  },
  calendarModeButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
  calendarModeButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  calendarMonthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  calendarFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default OrdersScreen;
