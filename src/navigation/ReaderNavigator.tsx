import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { ReaderTabParamList, ReaderStackParamList } from '../types';
import HomeScreen from '../screens/reader/HomeScreen';
import ProfileScreen from '../screens/reader/ProfileScreen';
import BookDetailScreen from '../screens/reader/BookDetailScreen';
import ChangePasswordScreen from '../screens/reader/ChangePasswordScreen';
import PDFViewerScreen from '../screens/reader/PDFViewerScreen';

const Tab = createBottomTabNavigator<ReaderTabParamList>();
const Stack = createStackNavigator<ReaderStackParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: '🏠', inactive: '🏠' },
  Profile: { active: '👤', inactive: '🧑' },
};

/**
 * Tabs del Lector: Home y Perfil.
 * Requisitos: 5.9, 8.7
 */
function ReaderTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name] ?? { active: '●', inactive: '○' };
          return (
            <Text style={{ fontSize: 22, color }}>
              {focused ? icons.active : icons.inactive}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

/**
 * Navigator del Lector.
 * Stack raíz con tabs anidados + rutas de detalle y cambio de contraseña.
 * Requisitos: 5.9, 8.7, 12.3
 */
export default function ReaderNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReaderTabs" component={ReaderTabs} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
    </Stack.Navigator>
  );
}
