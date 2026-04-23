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

const HEADER_STYLE = {
  backgroundColor: '#000',
};
const HEADER_TITLE_STYLE = { fontWeight: '700' as const, fontSize: 17 };

function ReaderTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: HEADER_STYLE,
        headerTintColor: '#fff',
        headerTitleStyle: HEADER_TITLE_STYLE,
        tabBarActiveTintColor: '#000000ff',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'Inicio', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function ReaderNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: HEADER_STYLE,
        headerTintColor: '#fff',
        headerTitleStyle: HEADER_TITLE_STYLE,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="ReaderTabs"     component={ReaderTabs}          options={{ headerShown: false }} />
      <Stack.Screen name="BookDetail"     component={BookDetailScreen}     options={{ title: 'Detalle del libro' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
      <Stack.Screen name="PDFViewer"      component={PDFViewerScreen}      options={{ title: 'Lector PDF' }} />
    </Stack.Navigator>
  );
}
