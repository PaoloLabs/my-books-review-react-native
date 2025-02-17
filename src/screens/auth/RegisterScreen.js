import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { validateEmail, validatePassword } from '../../utils/Validation';
import { commonStyles } from '../../styles/CommonStyles';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: 'pepe.test@acme.com',
    password: 'Test2025!',
    confirmPassword: 'Test2025!'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateRegisterForm = () => {
    let formErrors = {};

    // Email validation
    if (!formData.email) {
      formErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      formErrors.email = 'Formato de email inválido';
    }

    // Password validation
    if (!formData.password) {
      formErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      formErrors.password = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.';
    }

    // Password confirmation validation
    if (!formData.confirmPassword) {
      formErrors.confirmPassword = 'Por favor, confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
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
      Alert.alert(
        'Registro Exitoso',
        'Tu cuenta ha sido creada correctamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login')
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'No se pudo crear la cuenta. Inténtalo de nuevo.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'El correo electrónico ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Formato de correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
      }

      setIsLoading(false);

      Alert.alert(
        'Error de Registro',
        errorMessage,
        [
          { text: 'OK', onPress: () => console.log('Alerta cerrada') },
        ]
      );
      console.log('Error:', error.message);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingOverlay visible={isLoading} />
      <Text h3 style={commonStyles.title}>Registro</Text>

      <Input
        placeholder="Email"
        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        autoCapitalize="none"
        errorMessage={errors.email}
        errorStyle={commonStyles.errorText}
      />

      <Input
        placeholder="Contraseña"
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry
        errorMessage={errors.password}
        errorStyle={commonStyles.errorText}
      />

      <Input
        placeholder="Confirmar Contraseña"
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        value={formData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        secureTextEntry
        errorMessage={errors.confirmPassword}
        errorStyle={commonStyles.errorText}
      />

      <Button
        title="Registrar"
        onPress={handleRegister}
        containerStyle={commonStyles.button}
        disabled={isLoading}
      />

      <Button
        title="¿Ya tienes cuenta? Inicia sesión"
        type="clear"
        onPress={() => navigation.navigate('Login')}
        containerStyle={commonStyles.button}
        disabled={isLoading}
      />
    </View>
  );
}