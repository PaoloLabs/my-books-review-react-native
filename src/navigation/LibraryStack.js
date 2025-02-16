import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from '../screens/main/Library/LibraryScreen';
import BookDetailScreen from '../screens/main/Library/BookDetailScreen';

const Stack = createNativeStackNavigator();

export default function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} options={{ title: 'Librería' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Detalle' }} />
    </Stack.Navigator>
  );
}