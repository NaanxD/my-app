import { Order, OrderStats } from "../contexts/AppContext";

/**
 * Format money value with thousands separator and currency symbol
 * @param amount Numeric amount to format
 * @returns Formatted money string
 */
export const formatMoney = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
};

/**
 * Get ISO date string from a Date object (YYYY-MM-DD)
 * @param date Date object
 * @returns ISO date string
 */
export const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Get a date from a specific number of days ago
 * @param daysAgo Number of days ago
 * @returns Date object
 */
export const getDateFromDaysAgo = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

/**
 * Format a date object to a human-readable string
 * @param date Date object
 * @returns Formatted date string (e.g., "15 Apr 2023")
 */
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Calculate statistics from a list of orders
 * @param orders List of orders to calculate statistics from
 * @returns Object containing net sales, completed and cancelled counts
 */
export const calculateStatsFromOrders = (orders: Order[]): OrderStats => {
  let completed = 0;
  let cancelled = 0;
  let totalSales = 0;

  orders.forEach((order) => {
    if (order.status === "completed") {
      completed++;

      // Extract numeric value from price string
      if (order.amount) {
        const priceValue = parseInt(order.amount.replace(/[^\d]/g, ""));
        if (!isNaN(priceValue)) {
          totalSales += priceValue;
        }
      }
    } else if (order.status === "cancelled") {
      cancelled++;
    }
  });

  return {
    netSales: formatMoney(totalSales),
    completed,
    cancelled,
  };
};

/**
 * Filter orders by date range
 * @param orders List of orders to filter
 * @param dateRange Date range to filter by (start and end dates)
 * @returns Filtered list of orders
 */
export const filterOrdersByDateRange = (
  orders: Order[],
  dateRange: { start: string | null; end: string | null }
): Order[] => {
  if (!dateRange.start) return orders;

  return orders.filter((order) => {
    if (!order.date) return false;

    const orderDate = new Date(order.date);

    // For single date
    if (!dateRange.end) {
      const targetDate = new Date(dateRange.start as string);
      return orderDate.toDateString() === targetDate.toDateString();
    }

    // For date range
    const startDate = new Date(dateRange.start as string);
    const endDate = new Date(dateRange.end as string);

    // Set time to beginning/end of day for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return orderDate >= startDate && orderDate <= endDate;
  });
};

/**
 * Generate sample orders for a given date
 * @param date Target date
 * @param count Number of orders to generate
 * @returns List of sample orders
 */
export const generateSampleOrdersForDate = (
  date: Date,
  count: number = 5
): Order[] => {
  const orders: Order[] = [];
  const dateStr = formatDisplayDate(date);

  // Generate random orders
  for (let i = 0; i < count; i++) {
    const isCompleted = Math.random() > 0.3; // 70% completed, 30% cancelled

    orders.push({
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: `Customer ${i + 1}`,
      dishes: Math.floor(1 + Math.random() * 3),
      distance: `${(1 + Math.random() * 5).toFixed(1)}km`,
      amount: formatMoney(Math.floor(50000 + Math.random() * 250000)),
      status: isCompleted ? "completed" : "cancelled",
      date: dateStr,
      time: `${Math.floor(10 + Math.random() * 12)}:${Math.floor(
        Math.random() * 60
      )
        .toString()
        .padStart(2, "0")} ${Math.random() > 0.5 ? "AM" : "PM"}`,
      customerImage: `https://randomuser.me/api/portraits/${
        Math.random() > 0.5 ? "men" : "women"
      }/${Math.floor(1 + Math.random() * 99)}.jpg`,
    });
  }

  return orders;
};
