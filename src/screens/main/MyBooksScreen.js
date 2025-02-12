import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

export default function MyBooksScreen() {
  return (
    <View style={styles.container}>
      <Text h4>Mis Libros</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});