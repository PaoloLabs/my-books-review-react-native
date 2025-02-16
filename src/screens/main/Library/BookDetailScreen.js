import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView } from 'react-native';
import { fetchBookDetails } from '../../../services/api';
import { LoadingOverlay } from '../../../components/LoadingOverlay';

export default function BookDetailScreen({ route, navigation }) {
    const { bookId } = route.params; // Obtener el ID del libro desde la navegación
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getBookDetails = async () => {
            const bookData = await fetchBookDetails(bookId);
            setBook(bookData);
            setLoading(false);
        };
        getBookDetails();
    }, [bookId]);

    return (
        <View style={{ flex: 1 }}>
            <LoadingOverlay visible={loading} />

            {!loading && (
                <ScrollView style={{ flex: 1, padding: 15 }}>
                    {book?.imageLinks?.thumbnail && (
                        <Image
                            source={{ uri: book.imageLinks.thumbnail }}
                            style={{ width: 150, height: 220, alignSelf: 'center', marginBottom: 15 }}
                        />
                    )}
                    <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>{book.title}</Text>
                    <Text style={{ fontSize: 18, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 }}>{book.authors?.join(', ')}</Text>
                    <Text style={{ fontSize: 16, textAlign: 'justify' }}>{book.description || 'No hay descripción disponible.'}</Text>
                    <Button title="Volver a la Biblioteca" onPress={() => navigation.goBack()} />
                </ScrollView>
            )}
        </View>
    );
}
