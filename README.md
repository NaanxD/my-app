# 🍔 MealMaster - Restaurant Order Management App

> This is a React Native mobile application for restaurant owners to manage food delivery orders in real time.  
>  The app is designed for ease of use and efficiency, helping owners handle scheduled, live, and confirmed orders, track delivery drivers, and monitor restaurant performance.

---

## 🧩 Overview

**MealMaster** is a mobile app built with **React Native**, designed for **restaurant owners** to manage customer orders in real-time.  
This project was developed as a **demo for academic purposes**, focusing on UI logic and order management flow **without backend APIs**.

---

## 🚀 Features

- 📅 View orders by category: **Scheduled**, **Now**, **Confirmed**, and **History**
- 🔄 Update order status: **Edit**, **Cancel**, or **Confirm** orders
- 🚗 Assign drivers and track delivery progress (if applicable)
- 💸 View daily revenue and order summaries
- 🔍 Filter and sort orders by status
- 🟢 Toggle restaurant availability (open/close status)

---

## ⚙️ Tech Stack

- [React Native](https://reactnative.dev/) (Expo)
- [TypeScript](https://www.typescriptlang.org/)
- State management using **React Context API**
- Mock data or temporary local storage (no external backend yet)

> 📝 This version is focused on UI/UX and frontend logic. Backend integration can be added later (e.g., Firebase or Node.js).

---

## 📦 Getting Started

```bash
git clone https://github.com/NaanxD/my-app.git
cd my-app
npm install
npx expo start
```

After running the command, the Expo Developer Tools will open in your browser.
You can run the app in one of the following ways:

- 📱 Scan the QR code using the Expo Go app on your mobile device
- 💻 Click “Run on Android device/emulator” (requires Android Studio)
- 🖥️ Click “Run on iOS simulator” (macOS only, Xcode required)

---

## 📁 Project Structure

```bash
my-app/
├── assets/        → Images, icons, etc.
├── contexts/      → React Context for global state
├── data/          → Static data (e.g., sample orders)
├── screens/       → All screen views (Scheduled, Now, Confirmed, History, etc.)
├── utils/         → Helper functions and constants
├── App.tsx        → App root with navigation setup
├── index.ts       → Entry point for the app
├── app.json       → Expo project configuration
├── tsconfig.json  → TypeScript configuration
```

---

## 👨‍💻 Author

Developed by **Doan Thuc**  
📧 danth2111@gmail.com  
GitHub: [github.com/NaanxD](https://github.com/NaanxD)

---

## 🔖 License

MIT License – for educational use only.

---

© 2025 MealMaster. All rights reserved.
