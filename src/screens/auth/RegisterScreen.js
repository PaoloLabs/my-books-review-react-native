import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { validateEmail, validatePassword } from '../../utils/Validation';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateRegisterForm = () => {
    let formErrors = {};

    if (!formData.email.trim()) {
      formErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      formErrors.email = 'Formato de email inválido';
    }

    if (!formData.password.trim()) {
      formErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      formErrors.password = 'Debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos.';
    }

    if (!formData.confirmPassword.trim()) {
      formErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;
    
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setIsLoading(false);
      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada correctamente.', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'No se pudo crear la cuenta. Inténtalo de nuevo.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'El correo ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Formato de email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
      }

      Alert.alert('Error de Registro', errorMessage);
      console.log('Error:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator animating size="large" style={styles.loader} />}
      
      <Text variant="headlineMedium" style={styles.title}>📚 Crear Cuenta</Text>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Email"
            mode="outlined"
            left={<TextInput.Icon icon="email" />}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!errors.email}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <TextInput
            label="Contraseña"
            mode="outlined"
            secureTextEntry
            left={<TextInput.Icon icon="lock" />}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={!!errors.password}
            style={styles.input}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <TextInput
            label="Confirmar Contraseña"
            mode="outlined"
            secureTextEntry
            left={<TextInput.Icon icon="lock-check" />}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            error={!!errors.confirmPassword}
            style={styles.input}
          />
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Registrarse
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
            disabled={isLoading}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    padding: 20,
  },
  input: {
    marginTop: 10,
  },
  button: {
    marginTop: 20,
  },
  loginButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
});
