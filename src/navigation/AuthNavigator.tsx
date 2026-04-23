import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ValidateCodeScreen from '../screens/auth/ValidateCodeScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import { useAppConfig } from '../context/AppConfigContext';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator(): React.JSX.Element {
  const { config } = useAppConfig();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      {config.allowPublicRegistration && (
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
      )}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar contraseña' }} />
      <Stack.Screen name="ValidateCode" component={ValidateCodeScreen} options={{ title: 'Validar código' }} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ title: 'Nueva contraseña' }} />
    </Stack.Navigator>
  );
}
