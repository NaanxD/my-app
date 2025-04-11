import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { AppProvider } from "./contexts/AppContext";

// Screens
import HomeScreen from "./screens/HomeScreen";
import OrdersScreen from "./screens/OrdersScreen";
import PaymentScreen from "./screens/PaymentScreen";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import EditOrderScreen from "./screens/EditOrderScreen";
import TrackDriverScreen from "./screens/TrackDriverScreen";
import CallScreen from "./screens/CallScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import HistoryScreen from "./screens/HistoryScreen";
import MenuScreen from "./screens/MenuScreen";
import EmployeeScreen from "./screens/EmployeeScreen";
import InsightsScreen from "./screens/InsightsScreen";
import HelpCenterScreen from "./screens/HelpCenterScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Employee" component={EmployeeScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

const OrdersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="EditOrder" component={EditOrderScreen} />
      <Stack.Screen name="TrackDriver" component={TrackDriverScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: "#FF6B00",
              tabBarInactiveTintColor: "#888888",
              tabBarStyle: {
                height: 60,
                paddingVertical: 5,
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor: "#EEEEEE",
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "500",
                paddingBottom: 5,
              },
              tabBarIcon: ({ focused, color }) => {
                const iconSize = 24;

                if (route.name === "Home") {
                  return (
                    <Ionicons
                      name={focused ? "home" : "home-outline"}
                      size={iconSize}
                      color={color}
                    />
                  );
                } else if (route.name === "Manage") {
                  return (
                    <MaterialCommunityIcons
                      name="silverware-fork-knife"
                      size={iconSize}
                      color={color}
                    />
                  );
                }
                return null;
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Manage" component={OrdersStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
