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
    detailButton: {
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    detailReadButton: {
        backgroundColor: '#007BFF',
    },
    detailReadButtonActive: {
        backgroundColor: '#28A745',
    },
    detailButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    detailBookTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
    },
    detailBookAuthor: {
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10
    },
    detailBookDescription: {
        fontSize: 16,
        textAlign: 'justify',
        marginBottom: 20
    },
    detailReviewForm: {
        padding: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5
    },
    detailInput: {
        height: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 10
    },
    detailReviewItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10
    }
});
