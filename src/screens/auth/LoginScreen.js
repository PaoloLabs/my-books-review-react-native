import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { validateEmail } from '../../utils/Validation';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('tito.test@acme.com');
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
        if (field === 'password' && !value.trim()) {
            error = 'La contraseña es requerida';
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
            navigation.replace('Main');
        } catch (error) {
            Alert.alert('Error', 'Verifica tu correo y contraseña.');
            console.error('Error:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator animating size="large" style={styles.loader} />}
            
            <Text variant="headlineMedium" style={styles.title}>📚 MyBookReview</Text>

            <Card style={styles.card}>
                <Card.Content>
                    <TextInput
                        label="Email"
                        mode="outlined"
                        left={<TextInput.Icon icon="email" />}
                        value={email}
                        onChangeText={(value) => {
                            setEmail(value);
                            validateField('email', value);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email}
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    <TextInput
                        label="Contraseña"
                        mode="outlined"
                        secureTextEntry
                        left={<TextInput.Icon icon="lock" />}
                        value={password}
                        onChangeText={(value) => {
                            setPassword(value);
                            validateField('password', value);
                        }}
                        error={!!errors.password}
                        style={styles.input}
                    />
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        style={styles.button}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Iniciar Sesión
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Register')}
                        style={styles.registerButton}
                        disabled={isLoading}
                    >
                        ¿No tienes cuenta? Regístrate
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
    registerButton: {
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
