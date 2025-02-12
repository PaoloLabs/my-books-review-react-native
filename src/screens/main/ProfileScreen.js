import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@rneui/themed';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text h4>Perfil</Text>
      <Button 
        title="Cerrar Sesión" 
        type="outline"
        containerStyle={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    marginTop: 20,
  },
});