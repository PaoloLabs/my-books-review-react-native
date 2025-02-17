import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyBooksScreen from '../screens/main/MyBooksScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import LibraryStack from './LibraryStack';
import { Icon } from '@rneui/themed';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Library"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Library') {
            iconName = 'book';
          } else if (route.name === 'MyBooks') {
            iconName = 'bookmark';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          const iconSize = focused ? size + 4 : size;

          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: 'rgba(96, 64, 151, 1)',
        tabBarInactiveTintColor: 'rgb(155, 150, 159)',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
          height: 70,
          paddingBottom: 10,
          paddingTop: 5
        },
        tabBarLabelStyle: {
          fontSize: 12
        },
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
        headerBackVisible: true
      })}
    >
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{
          headerShown: false,
          title: 'Biblioteca'
        }}
      />
      <Tab.Screen
        name="MyBooks"
        component={MyBooksScreen}
        options={{
          title: 'Mis Libros'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil'
        }}
      />
    </Tab.Navigator>
  );
}
