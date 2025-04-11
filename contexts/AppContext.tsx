import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  scheduledOrders,
  nowOrders,
  confirmedOrders,
  historyOrders,
} from "../data/orders";
import {
  formatMoney,
  getDateString,
  calculateStatsFromOrders,
  filterOrdersByDateRange as filterOrdersByDateRangeUtil,
} from "../utils/orderStats";

// Define a simpler Order interface that includes all possible properties
export interface Order {
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
  items?: any[];
  // Add any other properties that might exist in the orders
  customerPhone?: string;
  customerNotes?: string;
  pickupIn?: string;
  [key: string]: any; // This allows for any other properties
}

export interface OrderStats {
  netSales: string;
  completed: number;
  cancelled: number;
}

export interface OrderStatsMap {
  [date: string]: OrderStats;
}

interface AppContextType {
  orders: {
    scheduled: Order[];
    now: Order[];
    confirmed: Order[];
    history: Order[];
  };
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => void;
  moveOrderToTab: (orderId: string, fromTab: string, toTab: string) => void;
  cancelOrder: (orderId: string, sourceTab: string) => void;
  markOrderAsDone: (orderId: string) => void;
  getOrderStats: (dateOrRange: {
    start: string | null;
    end: string | null;
  }) => OrderStats;
  getDateOrderStats: (date: string) => OrderStats;
  getOrdersByDateRange: (dateRange: {
    start: string | null;
    end: string | null;
  }) => Order[];
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  orders: {
    scheduled: [],
    now: [],
    confirmed: [],
    history: [],
  },
  updateOrder: () => {},
  moveOrderToTab: () => {},
  cancelOrder: () => {},
  markOrderAsDone: () => {},
  getOrderStats: () => ({ netSales: "0 ₫", completed: 0, cancelled: 0 }),
  getDateOrderStats: () => ({ netSales: "0 ₫", completed: 0, cancelled: 0 }),
  getOrdersByDateRange: () => [],
});

// Hook for using the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state with mock data for demo purposes
  const [orders, setOrders] = useState({
    scheduled: [...scheduledOrders] as Order[],
    now: [...nowOrders] as Order[],
    confirmed: [...confirmedOrders] as Order[],
    history: [...historyOrders] as Order[],
  });

  // Update an order's details
  const updateOrder = (orderId: string, updatedOrder: Partial<Order>) => {
    setOrders((prevOrders) => {
      // Create new object to ensure state immutability
      const newOrders = { ...prevOrders };

      // Find the tab containing the order
      for (const tab of ["scheduled", "now", "confirmed", "history"] as const) {
        const index = newOrders[tab].findIndex((order) => order.id === orderId);
        if (index !== -1) {
          // Update the order
          newOrders[tab][index] = { ...newOrders[tab][index], ...updatedOrder };
          break;
        }
      }

      return newOrders;
    });
  };

  // Move an order from one tab to another
  const moveOrderToTab = (orderId: string, fromTab: string, toTab: string) => {
    setOrders((prevOrders) => {
      // Create new object to ensure state immutability
      const newOrders = { ...prevOrders };

      // Find the order in the source tab
      const orderIndex = newOrders[fromTab as keyof typeof newOrders].findIndex(
        (order) => order.id === orderId
      );

      if (orderIndex !== -1) {
        // Get the order
        const order = {
          ...newOrders[fromTab as keyof typeof newOrders][orderIndex],
        };

        // Remove from source tab
        newOrders[fromTab as keyof typeof newOrders] = newOrders[
          fromTab as keyof typeof newOrders
        ].filter((_, index) => index !== orderIndex);

        // Add to destination tab
        newOrders[toTab as keyof typeof newOrders] = [
          order,
          ...newOrders[toTab as keyof typeof newOrders],
        ];
      }

      return newOrders;
    });
  };

  // Cancel an order
  const cancelOrder = (orderId: string, sourceTab: string) => {
    setOrders((prevOrders) => {
      // Create new object to ensure state immutability
      const newOrders = { ...prevOrders };

      // Find the order in the source tab
      const sourceTabKey = sourceTab as keyof typeof newOrders;
      const orderIndex = newOrders[sourceTabKey].findIndex(
        (order) => order.id === orderId
      );

      if (orderIndex !== -1) {
        // Get the order and mark as cancelled
        const order = {
          ...newOrders[sourceTabKey][orderIndex],
          status: "cancelled",
          items: [],
          amount: "0 ₫", // Set amount to 0 for cancelled orders
        };

        // Add date if not present
        if (!order.date) {
          order.date = new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        }

        // Remove from source tab
        newOrders[sourceTabKey] = newOrders[sourceTabKey].filter(
          (_, index) => index !== orderIndex
        );

        // Add to history tab
        newOrders.history = [order, ...newOrders.history];
      }

      return newOrders;
    });
  };

  // Mark an order as done
  const markOrderAsDone = (orderId: string) => {
    setOrders((prevOrders) => {
      // Create new object to ensure state immutability
      const newOrders = { ...prevOrders };

      // Find the order in the now tab
      const orderIndex = newOrders.now.findIndex(
        (order) => order.id === orderId
      );

      if (orderIndex !== -1) {
        // Get the order and mark as looking for driver
        const order = {
          ...newOrders.now[orderIndex],
          status: "looking_for_driver",
        };

        // Remove from now tab
        newOrders.now = newOrders.now.filter(
          (_, index) => index !== orderIndex
        );

        // Add to confirmed tab (not history)
        newOrders.confirmed = [order, ...newOrders.confirmed];
      }

      return newOrders;
    });
  };

  // Add sample items to completed orders in history tab
  React.useEffect(() => {
    setOrders((prevOrders) => {
      const newOrders = { ...prevOrders };

      // Add items to completed orders in history tab
      newOrders.history = newOrders.history.map((order) => {
        if (
          order.status !== "cancelled" &&
          (!order.items || order.items.length === 0)
        ) {
          // Generate random items
          const items = [
            {
              name: "Special Beef Noodle Soup",
              quantity: Math.floor(Math.random() * 2) + 1,
              price: "89.000 ₫",
              description:
                "Rice noodles, rare beef, brisket, tendon, meatballs",
              extras: ["1 x Extra herbs"],
            },
            {
              name: "House Special Fried Rice",
              quantity: Math.floor(Math.random() * 2) + 1,
              price: "78.000 ₫",
              description: "Rice, BBQ pork, shrimp, fried egg",
              extras: ["1 x Extra vegetables"],
            },
            {
              name: "Grilled Pork Sandwich",
              quantity: 1,
              price: "45.000 ₫",
              description: "Baguette, grilled pork, pate, pickled vegetables",
              extras: [],
            },
            {
              name: "Hanoi Grilled Pork Vermicelli",
              quantity: Math.floor(Math.random() * 2) + 1,
              price: "65.000 ₫",
              description: "Rice vermicelli, grilled pork patties, fish sauce",
              extras: ["1 x Fresh herbs"],
            },
            {
              name: "Spicy Beef Stew",
              quantity: 1,
              price: "95.000 ₫",
              description: "Slow-cooked beef, lemongrass, star anise",
              extras: ["1 x Crusty bread"],
            },
            {
              name: "Seafood Hot & Sour Soup",
              quantity: Math.floor(Math.random() * 2) + 1,
              price: "72.000 ₫",
              description: "Shrimp, squid, pineapple, tamarind broth",
              extras: ["1 x Extra chili"],
            },
          ];

          // Select 1-3 random items
          const randomItems = [];
          const numItems = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numItems; i++) {
            const randomIndex = Math.floor(Math.random() * items.length);
            randomItems.push(items[randomIndex]);
          }

          // Calculate total amount based on items and their quantities
          let totalAmount = 0;
          randomItems.forEach((item) => {
            // Extract price value (remove currency symbol and dots)
            const priceStr = item.price
              .replace("₫", "")
              .replace(/\./g, "")
              .trim();
            const basePrice = parseInt(priceStr, 10);
            // Multiply by quantity to get total for this item
            totalAmount += basePrice * item.quantity;
          });

          // Format total amount back to Vietnamese currency format
          const formattedAmount =
            totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

          return {
            ...order,
            items: randomItems,
            amount: formattedAmount, // Update order amount based on calculated items
          };
        }
        return order;
      });

      return newOrders;
    });
  }, []);

  // Add sample items to confirmed orders
  React.useEffect(() => {
    setOrders((prevOrders) => {
      const newOrders = { ...prevOrders };

      // Add items to confirmed orders
      newOrders.confirmed = newOrders.confirmed.map((order) => {
        if (!order.items || order.items.length === 0) {
          // Menu items available
          const menuItems = [
            {
              name: "Premium Seafood Platter",
              quantity: 1,
              price: "245.000 ₫",
              description:
                "Fresh prawns, oysters, mussels, crab meat, and calamari",
              extras: ["1 x Seafood sauce", "1 x Lemon wedges"],
            },
            {
              name: "Grilled Lamb Chops",
              quantity: 2,
              price: "175.000 ₫",
              description:
                "New Zealand lamb with mint sauce and roasted vegetables",
              extras: ["1 x Mashed potatoes"],
            },
            {
              name: "Wagyu Beef Steak",
              quantity: 1,
              price: "320.000 ₫",
              description: "Grade A5 Japanese Wagyu with truffle sauce",
              extras: ["1 x Premium wine sauce", "1 x Grilled asparagus"],
            },
            {
              name: "Lobster Thermidor",
              quantity: 1,
              price: "295.000 ₫",
              description:
                "Lobster meat in a rich creamy sauce, topped with cheese",
              extras: ["1 x Saffron rice"],
            },
            {
              name: "Seafood Pasta Special",
              quantity: 1,
              price: "155.000 ₫",
              description: "Linguine with mixed seafood in white wine sauce",
              extras: ["1 x Parmesan cheese", "1 x Garlic bread"],
            },
            {
              name: "Peking Duck",
              quantity: 1,
              price: "285.000 ₫",
              description: "Whole roasted duck with pancakes and hoisin sauce",
              extras: ["1 x Cucumber and scallions"],
            },
          ];

          // Generate 2-4 random items for each order for more substantial orders
          const randomItems = [];
          // Random number between 2 and 4
          const numItems = Math.floor(Math.random() * 3) + 2;
          for (let i = 0; i < numItems; i++) {
            const randomIndex = Math.floor(Math.random() * menuItems.length);
            // Sometimes add multiple of the same item with different quantities
            const existingItemIndex = randomItems.findIndex(
              (item) => item.name === menuItems[randomIndex].name
            );

            if (existingItemIndex > -1 && Math.random() > 0.5) {
              // Increase quantity of existing item
              randomItems[existingItemIndex].quantity += 1;
              // Recalculate price based on base price and new quantity
              const basePrice =
                parseInt(
                  randomItems[existingItemIndex].price
                    .replace("₫", "")
                    .replace(/\./g, "")
                    .trim(),
                  10
                ) / randomItems[existingItemIndex].quantity;

              const newTotal =
                basePrice * randomItems[existingItemIndex].quantity;
              randomItems[existingItemIndex].price =
                newTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
                " ₫";
            } else {
              // Add new item, possibly with quantity > 1
              const quantity =
                Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 2 : 1;
              const basePrice = parseInt(
                menuItems[randomIndex].price
                  .replace("₫", "")
                  .replace(/\./g, "")
                  .trim(),
                10
              );

              const newItem = {
                ...menuItems[randomIndex],
                quantity: quantity,
                price:
                  (basePrice * quantity)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫",
              };

              randomItems.push(newItem);
            }
          }

          // Calculate total amount and dishes count
          let totalAmount = 0;
          randomItems.forEach((item) => {
            // Extract price value (remove currency symbol and dots)
            const priceStr = item.price
              .replace("₫", "")
              .replace(/\./g, "")
              .trim();
            const itemPrice = parseInt(priceStr, 10);
            totalAmount += itemPrice;
          });

          // Format total amount back to Vietnamese currency format
          const formattedAmount =
            totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

          // Add some driver information for confirmed orders (delivery is in progress)
          return {
            ...order,
            items: randomItems,
            amount: formattedAmount,
            dishes: randomItems.length,
            driver: order.driver || "Tony Wang",
            driverPhone: order.driverPhone || "0274 458 999",
            driverImage:
              order.driverImage ||
              "https://randomuser.me/api/portraits/men/75.jpg",
            status: "on_the_way",
          };
        }
        return order;
      });

      return newOrders;
    });
  }, []);

  // Calculate stats based on actual history orders
  const getOrderStats = (dateRange: {
    start: string | null;
    end: string | null;
  }): OrderStats => {
    // If no dates specified, return overall stats
    if (!dateRange.start) {
      return calculateStatsFromOrders(orders.history);
    }

    // Get filtered orders and calculate stats
    const filteredOrders = getOrdersByDateRange(dateRange);
    return calculateStatsFromOrders(filteredOrders);
  };

  // Get stats for a specific date
  const getDateOrderStats = (dateString: string): OrderStats => {
    return getOrderStats({ start: dateString, end: null });
  };

  // Get orders for a date range
  const getOrdersByDateRange = (dateRange: {
    start: string | null;
    end: string | null;
  }): Order[] => {
    if (!dateRange.start) return orders.history;

    return filterOrdersByDateRangeUtil(orders.history, dateRange);
  };

  // Create value object
  const contextValue: AppContextType = {
    orders,
    updateOrder,
    moveOrderToTab,
    cancelOrder,
    markOrderAsDone,
    getOrderStats,
    getDateOrderStats,
    getOrdersByDateRange,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
