import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export const LoadingOverlay = ({ visible }) => {
    if (!visible) return null;
    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
