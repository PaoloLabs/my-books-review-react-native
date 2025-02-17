import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        marginVertical: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 5,
    },
    bookContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    bookImage: {
        width: 80,
        height: 120,
        borderRadius: 5,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    readButton: {
        backgroundColor: '#007BFF',
        padding: 8,
        borderRadius: 5,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    readButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
