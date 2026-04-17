import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList, AdminStackParamList } from '../types';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import BooksScreen from '../screens/admin/BooksScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import UserFormScreen from '../screens/admin/UserFormScreen';
import BookFormScreen from '../screens/admin/BookFormScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  AdminHome:    { active: 'home',           inactive: 'home-outline' },
  Users:        { active: 'people',         inactive: 'people-outline' },
  Books:        { active: 'library',        inactive: 'library-outline' },
  Settings:     { active: 'settings',       inactive: 'settings-outline' },
  AdminProfile: { active: 'person-circle',  inactive: 'person-circle-outline' },
};

function AdminTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminHome"    component={AdminHomeScreen}    options={{ title: 'Inicio' }} />
      <Tab.Screen name="Users"        component={UsersScreen}        options={{ title: 'Usuarios' }} />
      <Tab.Screen name="Books"        component={BooksScreen}        options={{ title: 'Libros' }} />
      <Tab.Screen name="Settings"     component={SettingsScreen}     options={{ title: 'Ajustes' }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

/**
 * Navigator del Administrador.
 * Stack raíz con tabs anidados + rutas de formularios.
 * Requisitos: 9.6, 12.4
 */
export default function AdminNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="UserForm" component={UserFormScreen} />
      <Stack.Screen name="BookForm" component={BookFormScreen} />
    </Stack.Navigator>
  );
}
