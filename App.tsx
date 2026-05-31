import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 修正路徑：根據 截圖 2026-05-04 晚上7.42.16.png，路徑應移除 backend
import DashboardScreen from './backend/screens/DashboardScreen';
import AssetsScreen from './backend/screens/AssetsScreen';
import LiabilitiesScreen from './backend/screens/LiabilitiesScreen';
import ProfileScreen from './backend/screens/ProfileScreen'; 

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontWeight: '800', color: '#1e293b' },
            tabBarActiveTintColor: '#1e3a8a',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: { 
              height: 65, 
              paddingBottom: 10,
              paddingTop: 5,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#f1f5f9'
            },
            tabBarIcon: ({ color, size, focused }) => {
              let iconName: string = 'help-circle';

              if (route.name === 'Dashboard') {
                iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              } else if (route.name === 'Assets') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Liabilities') {
                iconName = focused ? 'bank-transfer' : 'bank-transfer-out';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'account' : 'account-outline';
              }

              return <Icon name={iconName} size={26} color={color} />;
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ title: '控制台' }} 
          />
          <Tab.Screen 
            name="Assets" 
            component={AssetsScreen} 
            options={{ title: '資產' }} 
          />
          <Tab.Screen 
            name="Liabilities" 
            component={LiabilitiesScreen} 
            options={{ title: '負債' }} 
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: '我的' }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}