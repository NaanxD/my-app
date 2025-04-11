import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
// Định nghĩa các kiểu dữ liệu chung cho toàn bộ ứng dụng

export type OrderItem = {
  name: string;
  quantity: number;
  price: string;
  description?: string;
  extras?: string[];
  spicy?: boolean;
  image?: string;
};

export type Order = {
  id: string;
  customer: string;
  pickup?: string;
  pickupIn?: string;
  delivery?: string;
  dishes?: number;
  distance?: string;
  amount?: string;
  customerPhone?: string;
  customerImage?: string;
  customerNotes?: string;
  items?: OrderItem[];
  status?: string;
  scheduledTime?: string;
  estimatedPickupTime?: string;
  date?: string;
  driver?: string;
  driverPhone?: string;
  driverImage?: string;
};

export type OrdersState = {
  scheduled: Order[];
  now: Order[];
  confirmed: Order[];
  history: Order[];
};

export type Contact = {
  name: string;
  phone: string;
  image?: string;
};

export type Driver = {
  name: string;
  phone: string;
  image?: string;
};

// Định nghĩa các kiểu tham số cho navigation
export type OrderDetailParams = {
  order: Order;
  type: string;
  showMoreOptions?: boolean;
  onCancel?: () => void;
  onDone?: () => void;
  onEdit?: () => void;
  returnToOrders?: boolean;
};

export type EditOrderParams = {
  order: Order;
};

export type CallParams = {
  contact: Contact;
};

export type TrackDriverParams = {
  driver: Driver;
};

export type RootStackParamList = {
  HomeMain: undefined;
  Menu: undefined;
  Employee: undefined;
  Feedback: { from?: string };
  Insights: undefined;
  HelpCenter: undefined;
  Payment: undefined;
  OrdersMain: undefined;
  OrderDetail: OrderDetailParams;
  EditOrder: EditOrderParams;
  TrackDriver: TrackDriverParams;
  Call: CallParams;
  History: undefined;
};
