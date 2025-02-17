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

import { useFocusEffect } from '@react-navigation/native';

import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';

import { firestore, auth } from '../../../config/firebase';

import { fetchBooksPaginated } from '../../../services/api';

import { commonStyles } from '../../../styles/CommonStyles';

export default function LibraryScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [readBooks, setReadBooks] = useState([]);

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

  useFocusEffect(
    useCallback(() => {
      loadMoreBooks();
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
    const maxDescLength = 100;
    const truncatedDescription = item.description
      ? item.description.length > maxDescLength
        ? `${item.description.substring(0, maxDescLength)}...`
        : item.description
      : 'Sin descripción';

    const ratingText = item.averageRating
      ? `Calificación: ${item.averageRating.toFixed(1)}`
      : 'Calificación: N/A';

    return (
      <View style={[commonStyles.bookContainer, { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5 }]}>
        {item.imageLinks?.thumbnail ? (
          <Image
            source={{ uri: item.imageLinks.thumbnail }}
            style={commonStyles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[commonStyles.bookImage, commonStyles.bookImagePlaceholder]}>
            <Text style={{ color: '#777' }}>Sin imagen</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={commonStyles.bookTitle}>{item.title}</Text>
          <Text style={commonStyles.description}>{truncatedDescription}</Text>
          <Text style={commonStyles.rating}>{ratingText}</Text>

          <TouchableOpacity
            style={[commonStyles.readButton, isRead && { backgroundColor: '#999' }]}
            onPress={() => markAsRead(item.id)}
            disabled={isRead}
          >
            <Text style={commonStyles.readButtonText}>
              {isRead ? 'Leído' : 'Marcar como leído'}
            </Text>
          </TouchableOpacity>

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