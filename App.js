import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/config/firebase";
import { LoadingOverlay } from './src/components/LoadingOverlay'; // Importar el componente de carga

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe; // Limpieza del listener cuando se desmonta el componente
  }, []);

  // Mostrar loading mientras Firebase verifica la sesión
  if (isAuthenticated === null) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Main' : 'Auth'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
