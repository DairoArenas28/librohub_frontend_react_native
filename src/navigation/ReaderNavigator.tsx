import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ReaderTabParamList, ReaderStackParamList } from '../types';
import HomeScreen from '../screens/reader/HomeScreen';
import ProfileScreen from '../screens/reader/ProfileScreen';
import BookDetailScreen from '../screens/reader/BookDetailScreen';
import ChangePasswordScreen from '../screens/reader/ChangePasswordScreen';
import PDFViewerScreen from '../screens/reader/PDFViewerScreen';

const Tab = createBottomTabNavigator<ReaderTabParamList>();
const Stack = createStackNavigator<ReaderStackParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home:    { active: 'home',           inactive: 'home-outline' },
  Profile: { active: 'person',         inactive: 'person-outline' },
};

function ReaderTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'Inicio' }} />
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
