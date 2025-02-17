import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { validateEmail } from '../../utils/Validation';
import { commonStyles } from '../../styles/CommonStyles';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('pepe.test@acme.com');
    const [password, setPassword] = useState('Test2025!');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (field, value) => {
        let error = '';

        if (field === 'email') {
            if (!value.trim()) {
                error = 'El email es requerido';
            } else if (!validateEmail(value)) {
                error = 'Formato de email inválido';
            }
        }

        if (field === 'password') {
            if (!value.trim()) {
                error = 'La contraseña es requerida';
            }
        }

        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const validateLoginForm = () => {
        let formErrors = {};

        if (!email.trim()) {
            formErrors.email = 'El email es requerido';
        } else if (!validateEmail(email)) {
            formErrors.email = 'Formato de email inválido';
        }

        if (!password.trim()) {
            formErrors.password = 'La contraseña es requerida';
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateLoginForm()) return;

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsLoading(false);
            navigation.replace('Main');
        } catch (error) {
            setIsLoading(false);
            Alert.alert(
                'Error de Inicio de Sesión',
                'Verifica tu correo electrónico y contraseña.'
            );
            console.log('Error:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        return email.trim() && password.trim() && validateEmail(email);
    };

    return (
        <View style={commonStyles.container}>
            <LoadingOverlay visible={isLoading} />
            <Text h3 style={commonStyles.title}>My BookReview</Text>
            <Input
                placeholder="Email" 
                leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                value={email}
                onChangeText={(value) => {
                    setEmail(value);
                    validateField('email', value);
                }}
                autoCapitalize="none"
                errorMessage={errors.email}
                errorStyle={commonStyles.errorText}
            />
            <Input
                placeholder="Contraseña" 
                secureTextEntry 
                leftIcon={{ type: 'font-awesome', name: 'lock' }} 
                value={password}
                onChangeText={(value) => {
                    setPassword(value);
                    validateField('password', value);
                }}
                errorMessage={errors.password}
                errorStyle={commonStyles.errorText}
            />
            <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                containerStyle={commonStyles.button}
                disabled={!isFormValid() || isLoading}
            />
            <Button
                title="¿No tienes cuenta? Regístrate"
                type="clear"
                onPress={() => navigation.navigate('Register')}
                containerStyle={commonStyles.buttonText}
                disabled={isLoading}
            />
        </View>
    );
}