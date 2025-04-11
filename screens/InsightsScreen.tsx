import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const InsightsScreen = () => {
  const navigation = useNavigation();

  // Dữ liệu mẫu cho biểu đồ bán hàng theo ngày trong tuần
  const salesData = [
    { day: "Mon", value: 480000, percent: 60 },
    { day: "Tue", value: 520000, percent: 65 },
    { day: "Wed", value: 650000, percent: 81 },
    { day: "Thu", value: 420000, percent: 52 },
    { day: "Fri", value: 700000, percent: 87 },
    { day: "Sat", value: 800000, percent: 100 },
    { day: "Sun", value: 550000, percent: 69 },
  ];

  // Định dạng tiền tệ
  const formatCurrency = (amount: number): string => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  // Component biểu đồ cột
  const renderBarChart = () => (
    <View style={styles.chart}>
      {salesData.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={styles.barLabelContainer}>
            <Text style={styles.barValue}>{formatCurrency(item.value)}</Text>
          </View>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: `${item.percent}%`,
                  backgroundColor: getBarColor(index),
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{item.day}</Text>
        </View>
      ))}
    </View>
  );

  // Chọn màu cho cột biểu đồ
  const getBarColor = (index: number): string => {
    const colors = [
      "#FF6B00",
      "#FF8F3F",
      "#FFA968",
      "#FFBD87",
      "#FFD1A7",
      "#FFE0CC",
      "#FFF0E6",
    ];
    return colors[index % colors.length];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.headerTitle}>Insights</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dateSelector}>
          <Text style={styles.dateSelectorLabel}>Select date range</Text>
          <TouchableOpacity style={styles.dateSelectorButton}>
            <Text style={styles.dateSelectorText}>Last 7 days</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Sales</Text>
          <Text style={styles.summaryAmount}>3.500.000 ₫</Text>
          <View style={styles.summaryTrend}>
            <Ionicons name="arrow-up" size={16} color="#4CAF50" />
            <Text style={styles.summaryTrendText}>12% from last week</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          {renderBarChart()}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Orders</Text>
            <Text style={styles.statsValue}>145</Text>
            <View style={styles.statsTrend}>
              <Ionicons name="arrow-up" size={14} color="#4CAF50" />
              <Text style={styles.statsTrendText}>8%</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Avg. Order Value</Text>
            <Text style={styles.statsValue}>24.138 ₫</Text>
            <View style={styles.statsTrend}>
              <Ionicons name="arrow-up" size={14} color="#4CAF50" />
              <Text style={styles.statsTrendText}>3%</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Customers</Text>
            <Text style={styles.statsValue}>98</Text>
            <View style={styles.statsTrend}>
              <Ionicons name="arrow-down" size={14} color="#F44336" />
              <Text style={[styles.statsTrendText, styles.negativeTrend]}>
                2%
              </Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Cancelled Orders</Text>
            <Text style={styles.statsValue}>12</Text>
            <View style={styles.statsTrend}>
              <Ionicons name="arrow-down" size={14} color="#4CAF50" />
              <Text style={styles.statsTrendText}>5%</Text>
            </View>
          </View>
        </View>

        <View style={styles.topItemsCard}>
          <Text style={styles.topItemsTitle}>Top Selling Items</Text>

          <View style={styles.topItem}>
            <Text style={styles.topItemRank}>1</Text>
            <View style={styles.topItemInfo}>
              <Text style={styles.topItemName}>Crab Soup</Text>
              <Text style={styles.topItemSales}>42 orders</Text>
            </View>
            <Text style={styles.topItemRevenue}>1.890.000 ₫</Text>
          </View>

          <View style={styles.topItem}>
            <Text style={styles.topItemRank}>2</Text>
            <View style={styles.topItemInfo}>
              <Text style={styles.topItemName}>Fried Chicken</Text>
              <Text style={styles.topItemSales}>38 orders</Text>
            </View>
            <Text style={styles.topItemRevenue}>760.000 ₫</Text>
          </View>

          <View style={styles.topItem}>
            <Text style={styles.topItemRank}>3</Text>
            <View style={styles.topItemInfo}>
              <Text style={styles.topItemName}>Chicken Pho</Text>
              <Text style={styles.topItemSales}>35 orders</Text>
            </View>
            <Text style={styles.topItemRevenue}>490.000 ₫</Text>
          </View>
        </View>
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
    marginLeft: 5,
  },
  content: {
    padding: 20,
  },
  dateSelector: {
    marginBottom: 20,
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
  summaryCard: {
    backgroundColor: "#FFF8F3",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  summaryTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B00",
    marginBottom: 5,
  },
  summaryTrend: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTrendText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 5,
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  chart: {
    height: 200,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barLabelContainer: {
    position: "absolute",
    top: -20,
    width: "100%",
    alignItems: "center",
  },
  barValue: {
    fontSize: 8,
    color: "#666",
    transform: [{ rotate: "-45deg" }],
  },
  barWrapper: {
    width: "60%",
    height: "75%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barLabel: {
    marginTop: 5,
    fontSize: 10,
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  statsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statsTrend: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsTrendText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 5,
  },
  negativeTrend: {
    color: "#F44336",
  },
  topItemsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  topItemsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  topItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  topItemRank: {
    width: 24,
    height: 24,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  topItemSales: {
    fontSize: 12,
    color: "#999",
  },
  topItemRevenue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});

export default InsightsScreen;
