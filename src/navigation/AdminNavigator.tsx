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

const HEADER_STYLE = {
  backgroundColor: '#000',
};
const HEADER_TITLE_STYLE = { fontWeight: '700' as const, fontSize: 17 };

function AdminTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: HEADER_STYLE,
        headerTintColor: '#fff',
        headerTitleStyle: HEADER_TITLE_STYLE,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminHome"    component={AdminHomeScreen}    options={{ title: 'Inicio', headerShown: false }} />
      <Tab.Screen name="Users"        component={UsersScreen}        options={{ title: 'Usuarios' }} />
      <Tab.Screen name="Books"        component={BooksScreen}        options={{ title: 'Libros' }} />
      <Tab.Screen name="Settings"     component={SettingsScreen}     options={{ title: 'Ajustes' }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: HEADER_STYLE,
        headerTintColor: '#fff',
        headerTitleStyle: HEADER_TITLE_STYLE,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs}        options={{ headerShown: false }} />
      <Stack.Screen name="UserForm"  component={UserFormScreen}   options={{ title: 'Formulario de usuario' }} />
      <Stack.Screen name="BookForm"  component={BookFormScreen}   options={{ title: 'Formulario de libro' }} />
    </Stack.Navigator>
  );
}
