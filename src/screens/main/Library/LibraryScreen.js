import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getDoc, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore, auth } from '../../../config/firebase';
import { fetchBooks } from '../../../services/api';

export default function LibraryScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [readBooks, setReadBooks] = useState([]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const allBooks = await fetchBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReadBooks = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, { readBooks: [] });
        setReadBooks([]);
      } else {
        const userData = userSnap.data();
        setReadBooks(userData.readBooks || []);
      }
    } catch (error) {
      console.error('Error al cargar libros leídos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
      loadUserReadBooks();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = books.filter((book) =>
        book.title?.toLowerCase().includes(lowerQuery)
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const markAsRead = async (bookId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        readBooks: arrayUnion(bookId),
      });

      setReadBooks((prev) => [...prev, bookId]);
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  const renderBookItem = ({ item }) => {
    const isRead = readBooks.includes(item.id);
    const truncatedDescription = item.description
      ? item.description.length > 100
        ? `${item.description.substring(0, 100)}...`
        : item.description
      : 'Sin descripción';

    return (
      <Card style={styles.bookCard}>
        <Card.Cover
          source={{ uri: item.imageLinks?.thumbnail || 'https://via.placeholder.com/150' }}
          resizeMode="contain"
        />
        <Card.Content>
          <Text variant="titleMedium">{item.title}</Text>
          <Text variant="bodyMedium">{truncatedDescription}</Text>
          <Text variant="bodySmall" style={{ fontStyle: 'italic', marginTop: 5 }}>
            {item.averageRating ? `⭐ ${item.averageRating.toFixed(1)}` : 'Sin calificación'}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode={isRead ? 'outlined' : 'contained'} onPress={() => markAsRead(item.id)} disabled={isRead}>
            {isRead ? 'Leído' : 'Marcar como leído'}
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}>
            Ver Detalles
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar libros..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      {/* Lista de libros */}
      {loading ? (
        <ActivityIndicator animating size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    marginBottom: 10,
    borderRadius: 10,
  },
  bookCard: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3, // en Android
    shadowColor: '#000', // en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loader: {
    marginTop: 20,
    alignSelf: 'center',
  },
});