import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text h4>Librería</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});