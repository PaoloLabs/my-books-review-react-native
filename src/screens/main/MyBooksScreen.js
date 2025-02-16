import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { firestore, auth } from '../../config/firebase';
import { fetchBookDetails } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function MyBooksScreen() {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar los libros leídos del usuario
  const loadMyBooks = async () => {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      // 1. Leer readBooks del documento del usuario
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        // Si el doc del usuario no existe, creamos uno vacío
        await setDoc(userDocRef, { readBooks: [] });
        setMyBooks([]);
        setLoading(false);
        return;
      }

      const userData = userSnapshot.data();
      const readBooks = userData.readBooks || [];

      if (readBooks.length === 0) {
        // El usuario no tiene libros marcados como leídos
        setMyBooks([]);
        setLoading(false);
        return;
      }

      // 2. Consultar las reseñas del usuario para esos libros
      //    where('bookId','in', readBooks) y where('userId','==', currentUser.uid)
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(
        reviewsRef,
        where('bookId', 'in', readBooks),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      // Usamos onSnapshot para actualizaciones en tiempo real
      onSnapshot(q, async (snapshot) => {
        const userReviews = []; // { bookId, text, rating, ... }
        snapshot.forEach((docSnap) => {
          userReviews.push({ id: docSnap.id, ...docSnap.data() });
        });

        // 3. Para cada libro en readBooks, obtenemos detalles de la API
        const booksData = [];
        for (let bookId of readBooks) {
          const bookDetails = await fetchBookDetails(bookId);

          // Filtramos reseñas del usuario para este bookId
          const filteredReviews = userReviews.filter(
            (rev) => rev.bookId === bookId
          );

          booksData.push({
            bookId,
            title: bookDetails?.title || 'Sin título',
            authors: bookDetails?.authors || [],
            imageUrl: bookDetails?.imageLinks?.thumbnail || '',
            description: bookDetails?.description || '',
            reviews: filteredReviews, // Reseñas del usuario
          });
        }

        setMyBooks(booksData);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error cargando mis libros:', error);
      setLoading(false);
    }
  };

  // Cada vez que la pantalla recupere el foco, se recarga la lista
  useFocusEffect(
    useCallback(() => {
      loadMyBooks();
    }, [])
  );

  // También puedes querer cargar una primera vez al montar,
  // pero con useFocusEffect probablemente baste:
  // useEffect(() => {
  //   loadMyBooks();
  // }, []);

  const renderBookItem = ({ item }) => {
    return (
      <View style={styles.bookContainer}>
        {/* Imagen del libro */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bookImage, styles.bookPlaceholder]}>
            <Text style={{ color: '#666' }}>Sin imagen</Text>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.authors}>{item.authors.join(', ')}</Text>

          {/* Mostrar reseñas del usuario */}
          {item.reviews.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.subtitle}>Mis Reseñas:</Text>
              {item.reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <Text style={{ fontWeight: 'bold' }}>
                    Calificación: {rev.rating} / 5
                  </Text>
                  <Text>{rev.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ marginTop: 8, fontStyle: 'italic' }}>
              Aún no hay reseñas para este libro
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando tus libros leídos...</Text>
      </View>
    );
  }

  if (myBooks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No tienes libros marcados como leídos.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.bookId}
        renderItem={renderBookItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
  },
  bookImage: {
    width: 80,
    height: 120,
    backgroundColor: '#ccc',
  },
  bookPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  authors: {
    fontStyle: 'italic',
    marginVertical: 4,
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewItem: {
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
});
