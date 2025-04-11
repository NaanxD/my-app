"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

// Type definitions
interface HistoryOrder {
  id: string;
  customer: string;
  customerImage: string;
  dishes: number;
  amount: string;
  status: "completed" | "cancelled";
  time: string;
}

interface CancelledOrder {
  id?: string;
  customer?: string;
  customerImage?: string;
  items?: any[];
  amount?: string;
  status: string;
  statusMessage?: string;
}

interface HistoryRouteParams {
  cancelledOrder?: CancelledOrder;
}

interface HistoryData {
  [date: string]: HistoryOrder[];
}

type HistoryScreenRouteProp = RouteProp<
  { History: HistoryRouteParams },
  "History"
>;

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  setParams: (params: Partial<HistoryRouteParams>) => void;
};

// Sample history data for different dates
const historyData: HistoryData = {
  "2025-03-17": [
    {
      id: "HI-90123",
      customer: "Grace White",
      customerImage: "https://randomuser.me/api/portraits/women/7.jpg",
      dishes: 3,
      amount: "700.000 ₫",
      status: "completed",
      time: "14:00",
    },
    {
      id: "HI-90124",
      customer: "Henry Black",
      customerImage: "https://randomuser.me/api/portraits/men/8.jpg",
      dishes: 4,
      amount: "850.000 ₫",
      status: "cancelled",
      time: "15:00",
    },
  ],
  "2025-03-16": [
    {
      id: "HI-90125",
      customer: "Emma Wilson",
      customerImage: "https://randomuser.me/api/portraits/women/9.jpg",
      dishes: 2,
      amount: "520.000 ₫",
      status: "completed",
      time: "12:30",
    },
    {
      id: "HI-90126",
      customer: "James Taylor",
      customerImage: "https://randomuser.me/api/portraits/men/10.jpg",
      dishes: 3,
      amount: "680.000 ₫",
      status: "completed",
      time: "13:45",
    },
    {
      id: "HI-90127",
      customer: "Olivia Martin",
      customerImage: "https://randomuser.me/api/portraits/women/11.jpg",
      dishes: 1,
      amount: "350.000 ₫",
      status: "cancelled",
      time: "18:20",
    },
  ],
  "2025-03-15": [
    {
      id: "HI-90128",
      customer: "William Anderson",
      customerImage: "https://randomuser.me/api/portraits/men/12.jpg",
      dishes: 5,
      amount: "920.000 ₫",
      status: "completed",
      time: "19:15",
    },
  ],
  "2025-03-14": [
    {
      id: "HI-90129",
      customer: "Sophia Thomas",
      customerImage: "https://randomuser.me/api/portraits/women/13.jpg",
      dishes: 2,
      amount: "480.000 ₫",
      status: "completed",
      time: "11:30",
    },
    {
      id: "HI-90130",
      customer: "Benjamin Jackson",
      customerImage: "https://randomuser.me/api/portraits/men/14.jpg",
      dishes: 3,
      amount: "650.000 ₫",
      status: "cancelled",
      time: "20:45",
    },
  ],
};

// Generate data for the current date
const generateCurrentDateData = (): HistoryOrder[] => {
  return [
    {
      id: `HI-${Math.floor(90000 + Math.random() * 10000)}`,
      customer: "Current User",
      customerImage: "https://randomuser.me/api/portraits/women/22.jpg",
      dishes: 3,
      amount: "650.000 ₫",
      status: "completed",
      time: "12:30",
    },
    {
      id: `HI-${Math.floor(90000 + Math.random() * 10000)}`,
      customer: "Today's Customer",
      customerImage: "https://randomuser.me/api/portraits/men/33.jpg",
      dishes: 2,
      amount: "450.000 ₫",
      status: "cancelled",
      time: "14:45",
    },
  ];
};

// Generate sales trend data
const generateSalesTrendData = () => {
  return {
    totalSales: "3.500.000 ₫",
    percentChange: "+12% from last week",
    chartData: "Chart visualization would go here",
  };
};

const HistoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HistoryScreenRouteProp>();

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showDatePickerModal, setShowDatePickerModal] =
    useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("all"); // 'all', 'completed', 'cancelled'
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [allHistoryData, setAllHistoryData] =
    useState<HistoryData>(historyData);
  const [salesTrend, setSalesTrend] = useState(generateSalesTrendData());

  // Add current date data when component mounts
  useEffect(() => {
    const currentDate = getCurrentDate();
    if (!allHistoryData[currentDate]) {
      setAllHistoryData((prevData) => ({
        ...prevData,
        [currentDate]: generateCurrentDateData(),
      }));
    }
  }, []);

  // Handle cancelled order from EditOrderScreen
  useEffect(() => {
    if (route.params?.cancelledOrder) {
      const { cancelledOrder } = route.params;
      const currentDate = getCurrentDate();

      // Create a new history order from the cancelled order
      const newHistoryOrder: HistoryOrder = {
        id:
          cancelledOrder.id ||
          `HI-${Math.floor(90000 + Math.random() * 10000)}`,
        customer: cancelledOrder.customer || "Customer",
        customerImage:
          cancelledOrder.customerImage ||
          "https://randomuser.me/api/portraits/men/1.jpg",
        dishes: cancelledOrder.items?.length || 0,
        amount: cancelledOrder.amount || "0 ₫",
        status: "cancelled",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add the cancelled order to today's history
      setAllHistoryData((prevData: HistoryData) => {
        const updatedData = { ...prevData };
        if (!updatedData[currentDate]) {
          updatedData[currentDate] = [newHistoryOrder];
        } else {
          updatedData[currentDate] = [
            newHistoryOrder,
            ...updatedData[currentDate],
          ];
        }
        return updatedData;
      });

      // Set filter to show cancelled orders
      setFilterType("cancelled");

      // Show a confirmation message
      Alert.alert(
        "Order Cancelled",
        "The order has been cancelled successfully.",
        [{ text: "OK" }]
      );

      // Clear the parameter to prevent re-processing on component updates
      navigation.setParams({ cancelledOrder: undefined });
    }
  }, [route.params?.cancelledOrder, navigation]);

  // Format date for display (e.g., "Mar 17, 2025")
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleOrderPress = (item: HistoryOrder) => {
    navigation.navigate("OrderDetail", {
      order: {
        ...item,
        date: formatDisplayDate(selectedDate),
      },
      type: "history",
    });
  };

  const getFilteredOrders = (): HistoryOrder[] => {
    // If no data for selected date, return empty array
    if (!allHistoryData[selectedDate]) {
      return [];
    }

    let orders = [...allHistoryData[selectedDate]];

    // Apply search filter
    if (searchQuery) {
      orders = orders.filter((order) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.customer.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (filterType !== "all") {
      orders = orders.filter((order) => order.status === filterType);
    }

    return orders;
  };

  // Calculate summary data
  const calculateSummary = () => {
    const orders = allHistoryData[selectedDate] || [];
    const completed = orders.filter((order) => order.status === "completed");
    const cancelled = orders.filter((order) => order.status === "cancelled");

    let totalSales = 0;
    completed.forEach((order) => {
      const amountString = order.amount
        .replace(/\./g, "")
        .replace(",", ".")
        .replace("₫", "")
        .trim();
      const amount = Number.parseFloat(amountString);
      if (!isNaN(amount)) {
        totalSales += amount;
      }
    });

    return {
      totalSales: totalSales.toLocaleString("vi-VN").replace(",", ".") + " ₫",
      completedCount: completed.length,
      cancelledCount: cancelled.length,
    };
  };

  const summary = calculateSummary();

  // Select a date from the quick select options
  const handleQuickDateSelect = (option: string) => {
    const now = new Date();
    let newDate: string;

    switch (option) {
      case "today":
        newDate = getCurrentDate();
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        newDate = `${yesterday.getFullYear()}-${String(
          yesterday.getMonth() + 1
        ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        break;
      case "last7days":
        // Just set to today, in a real app you'd handle date ranges differently
        newDate = getCurrentDate();
        break;
      case "thismonth":
        // Just set to today, in a real app you'd handle date ranges differently
        newDate = getCurrentDate();
        break;
      default:
        // For specific dates like "15 Mar 2025"
        const parts = option.split(" ");
        if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1] === "Mar" ? "03" : "01"; // Simplified
          const year = parts[2];
          newDate = `${year}-${month}-${day.padStart(2, "0")}`;
        } else {
          newDate = getCurrentDate();
        }
    }

    setSelectedDate(newDate);

    // If no data exists for this date, generate some
    if (!allHistoryData[newDate]) {
      const newData = generateCurrentDateData();
      setAllHistoryData((prevData) => ({
        ...prevData,
        [newDate]: newData,
      }));
    }

    setShowDatePickerModal(false);
  };

  const renderOrderItem = ({ item }: { item: HistoryOrder }) => {
    const statusColor = item.status === "cancelled" ? "#F44336" : "#4CAF50";

    return (
      <TouchableOpacity
        style={[
          styles.orderItem,
          item.status === "cancelled" && styles.cancelledOrderItem,
        ]}
        onPress={() => handleOrderPress(item)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>{item.id.split("-")[0]}</Text>
            </View>
            <Text style={styles.orderId}>{item.id}</Text>
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
            <View
              style={[
                styles.statusDotIndicator,
                { backgroundColor: statusColor },
              ]}
            />
          </View>

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

          <View style={styles.orderMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Time</Text>
              <Text style={styles.metricValue}>{item.time}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Dishes</Text>
              <Text style={styles.metricValue}>{item.dishes}</Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.amountContainer}>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No orders found for this date</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.headerTitle}>History</Text>
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
            placeholder="Search by order ID or customer name"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.dateSelector}>
          <Text style={styles.dateSelectorLabel}>Select date range</Text>
          <TouchableOpacity
            style={styles.dateSelectorButton}
            onPress={() => setShowDatePickerModal(true)}
          >
            <Text style={styles.dateSelectorText}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.salesAmount}>{summary.totalSales}</Text>
          <Text style={styles.salesLabel}>Net sales</Text>
          <Text style={styles.salesDescription}>
            This is your sales amount before adjustments and deductions.
          </Text>

          <View style={styles.percentChangeContainer}>
            <Ionicons name="arrow-up" size={16} color="#4CAF50" />
            <Text style={styles.percentChangeText}>
              {salesTrend.percentChange}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.completedCount}</Text>
            <Text style={styles.statLabel}>Order Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.cancelledCount}</Text>
            <Text style={styles.statLabel}>Order Cancelled</Text>
          </View>
        </View>

        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusLabel}>Filter by Status</Text>
          <TouchableOpacity
            style={styles.filterStatusButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.filterStatusText}>
              {filterType === "all"
                ? "All"
                : filterType === "completed"
                ? "Completed"
                : "Cancelled"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.ordersListHeader}>
          <Text style={styles.ordersListTitle}>Orders</Text>
        </View>

        {getFilteredOrders().map((item) => (
          <View key={item.id}>{renderOrderItem({ item })}</View>
        ))}

        {getFilteredOrders().length === 0 && renderEmptyList()}
      </ScrollView>

      {/* Date Picker Modal (Quick Select) */}
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDatePickerModal(false)}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.quickSelectTitle}>Quick Select</Text>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("today")}
            >
              <Text style={styles.quickSelectText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("yesterday")}
            >
              <Text style={styles.quickSelectText}>Yesterday</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("last7days")}
            >
              <Text style={styles.quickSelectText}>Last 7 days</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("thismonth")}
            >
              <Text style={styles.quickSelectText}>This month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("15 Mar 2025")}
            >
              <Text style={styles.quickSelectText}>15 Mar 2025</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("16 Mar 2025")}
            >
              <Text style={styles.quickSelectText}>16 Mar 2025</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectOption}
              onPress={() => handleQuickDateSelect("17 Mar 2025")}
            >
              <Text style={styles.quickSelectText}>17 Mar 2025</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => {
                setShowDatePickerModal(false);
                setShowCalendarModal(true);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#FF6B00" />
              <Text style={styles.calendarButtonText}>Open Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
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

            <View style={styles.calendarPlaceholder}>
              <Text style={styles.calendarPlaceholderText}>
                Calendar would be displayed here
              </Text>
              <Text style={styles.calendarPlaceholderSubtext}>
                Select a date to view orders
              </Text>

              {/* Simulated calendar date selection */}
              <View style={styles.simulatedCalendar}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarMonth}>March 2025</Text>
                </View>
                <View style={styles.calendarDays}>
                  <Text style={styles.calendarDayHeader}>Su</Text>
                  <Text style={styles.calendarDayHeader}>Mo</Text>
                  <Text style={styles.calendarDayHeader}>Tu</Text>
                  <Text style={styles.calendarDayHeader}>We</Text>
                  <Text style={styles.calendarDayHeader}>Th</Text>
                  <Text style={styles.calendarDayHeader}>Fr</Text>
                  <Text style={styles.calendarDayHeader}>Sa</Text>
                </View>

                <View style={styles.calendarGrid}>
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isSelected = day === 17;
                    const hasData = [14, 15, 16, 17].includes(day);

                    // Check if this day is in the future (assuming March 2025 as shown in UI)
                    const today = new Date();
                    const simulatedDate = new Date(2025, 2, day); // Month is 0-indexed, so 2 = March
                    const isFutureDate = simulatedDate > today;

                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.calendarDay,
                          isSelected && styles.selectedCalendarDay,
                          isFutureDate && styles.disabledCalendarDay,
                        ]}
                        onPress={() => {
                          // Prevent selection of future dates
                          if (isFutureDate) {
                            Alert.alert(
                              "Invalid Date",
                              "You cannot select future dates."
                            );
                            return;
                          }

                          const newDate = `2025-03-${String(day).padStart(
                            2,
                            "0"
                          )}`;
                          setSelectedDate(newDate);

                          // If no data exists for this date, generate some
                          if (!allHistoryData[newDate]) {
                            const newData = generateCurrentDateData();
                            setAllHistoryData((prevData) => ({
                              ...prevData,
                              [newDate]: newData,
                            }));
                          }

                          setShowCalendarModal(false);
                        }}
                        disabled={isFutureDate}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            isSelected && styles.selectedCalendarDayText,
                            isFutureDate && styles.disabledCalendarDayText,
                          ]}
                        >
                          {day}
                        </Text>
                        {hasData && <View style={styles.calendarDayDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
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
  scrollContainer: {
    flex: 1,
  },
  dateSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dateSelectorLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  dateSelectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  dateSelectorText: {
    fontSize: 14,
    color: "#333",
  },
  insightsCard: {
    backgroundColor: "#FFF8F3",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
  },
  salesAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B00",
    marginBottom: 5,
  },
  salesLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  salesDescription: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
  percentChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  percentChangeText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  filterStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  filterStatusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  filterStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  filterStatusText: {
    fontSize: 12,
    color: "#333",
    marginRight: 5,
  },
  ordersListHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    marginTop: 10,
  },
  ordersListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 20,
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
    marginRight: 8,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
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
  datePickerModalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  calendarModalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
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
    padding: 5,
  },
  quickSelectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  quickSelectOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  quickSelectText: {
    fontSize: 16,
    color: "#FF6B00",
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF8F3",
    borderRadius: 8,
  },
  calendarButtonText: {
    fontSize: 16,
    color: "#FF6B00",
    marginLeft: 8,
  },
  calendarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  calendarPlaceholderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  calendarPlaceholderSubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  simulatedCalendar: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 10,
  },
  calendarHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  calendarDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calendarDayHeader: {
    width: 30,
    textAlign: "center",
    fontSize: 12,
    color: "#999",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  selectedCalendarDay: {
    backgroundColor: "#FF6B00",
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCalendarDayText: {
    color: "#FFFFFF",
  },
  calendarDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF6B00",
    marginTop: 2,
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
  disabledCalendarDay: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
  },
  disabledCalendarDayText: {
    color: "#cccccc",
  },
});

export default HistoryScreen;
