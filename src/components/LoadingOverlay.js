import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, ActivityIndicator, Text } from 'react-native-paper';

export const LoadingOverlay = ({ visible, message = 'Cargando...' }) => {
    return (
        <Modal visible={visible} dismissable={false} contentContainerStyle={styles.overlay}>
            <View style={styles.content}>
                <ActivityIndicator size="large" animating color="#007BFF" />
                <Text style={styles.text}>{message}</Text>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
    },
    content: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});
