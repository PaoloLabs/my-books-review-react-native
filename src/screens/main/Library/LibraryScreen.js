import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  Button,
  ActivityIndicator,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// React Navigation
import { useFocusEffect } from '@react-navigation/native';

// Firebase
import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { firestore, auth } from '../../../config/firebase'; // Ajusta la ruta a tu config

// Tu API para cargar libros (paginación)
import { fetchBooksPaginated } from '../../../services/api';

export default function LibraryScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Guardamos los IDs de libros leídos en un array
  const [readBooks, setReadBooks] = useState([]);

  // 1. Función para cargar libros de la API
  const loadMoreBooks = async () => {
    setLoading(true);
    try {
      const newBooks = await fetchBooksPaginated();
      setBooks((prevBooks) => {
        const updatedBooks = [...prevBooks, ...newBooks];
        setFilteredBooks(updatedBooks);
        return updatedBooks;
      });
    } catch (error) {
      console.error('Error al cargar libros:', error);
    }
    setLoading(false);
  };

  // 2. Cargar/Refrescar libros leídos desde Firestore
  const loadUserReadBooks = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Si es un usuario totalmente nuevo, creamos el doc con readBooks vacío
        await setDoc(userDocRef, { readBooks: [] });
        console.log('Nuevo usuario; documento creado con readBooks vacío.');
        setReadBooks([]);
      } else {
        // Si existe, cargamos su array real
        const userData = userSnap.data();
        setReadBooks(userData.readBooks || []);
      }
    } catch (error) {
      console.error('Error al cargar libros leídos:', error);
    }
  };

  // 3. useFocusEffect: refresca libros leídos cada vez que la pantalla recupere el foco
  useFocusEffect(
    useCallback(() => {
      loadUserReadBooks();
    }, [])
  );

  // 4. Al montar la pantalla, carga la lista de libros de la API
  useEffect(() => {
    loadMoreBooks();
  }, []);

  // 5. Filtrado según searchQuery
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

  // 6. Función para marcar el libro como leído en Firestore
  const markAsRead = async (bookId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Actualizamos el documento del usuario con arrayUnion
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        readBooks: arrayUnion(bookId),
      });

      // Actualizamos el estado local
      setReadBooks((prev) => [...prev, bookId]);
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  // 7. Renderizar cada libro en la lista
  const renderBookItem = ({ item }) => {
    // Ver si ya está en readBooks
    const isRead = readBooks.includes(item.id);

    // Truncar descripción (si existe)
    const maxDescLength = 100;
    const truncatedDescription = item.description
      ? item.description.length > maxDescLength
        ? `${item.description.substring(0, maxDescLength)}...`
        : item.description
      : 'Sin descripción';

    // Calificación (si la API lo provee)
    const ratingText = item.averageRating
      ? `Calificación: ${item.averageRating.toFixed(1)}`
      : 'Calificación: N/A';

    return (
      <View style={styles.bookContainer}>
        {/* Imagen */}
        {item.imageLinks?.thumbnail ? (
          <Image
            source={{ uri: item.imageLinks.thumbnail }}
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bookImage, styles.bookImagePlaceholder]}>
            <Text style={{ color: '#777' }}>Sin imagen</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{truncatedDescription}</Text>
          <Text style={styles.rating}>{ratingText}</Text>

          {/* Botón “Marcar como leído” */}
          <TouchableOpacity
            style={[styles.readButton, isRead && { backgroundColor: '#999' }]}
            onPress={() => markAsRead(item.id)}
            disabled={isRead}
          >
            <Text style={styles.readButtonText}>
              {isRead ? 'Leído' : 'Marcar como leído'}
            </Text>
          </TouchableOpacity>

          {/* Botón para ver detalles */}
          <Button
            title="Ver Detalles"
            onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Barra de búsqueda */}
      <TextInput
        placeholder="Buscar libros..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          height: 40,
          borderBottomWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 8,
        }}
      />

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  bookContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bookImage: {
    width: 80,
    height: 120,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  bookImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    marginBottom: 4,
    color: '#555',
  },
  rating: {
    fontStyle: 'italic',
    marginBottom: 8,
  },
  readButton: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  readButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
