import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from '../screens/main/Library/LibraryScreen';
import BookDetailScreen from '../screens/main/Library/BookDetailScreen';

const Stack = createNativeStackNavigator();

export default function LibraryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: 'rgba(96, 64, 151, 1)'
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        },
        animation: 'slide_from_right',
        headerBackVisible: true
      }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} options={{ title: 'Librería' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Detalle' }} />
    </Stack.Navigator>
  );
}