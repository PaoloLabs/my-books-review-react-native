import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { getDoc, doc, collection, query, where, onSnapshot, orderBy, setDoc } from 'firebase/firestore';
import { firestore, auth } from '../../config/firebase';
import { fetchBookDetails } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function MyBooksScreen() {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyBooks = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, { readBooks: [] });
        setMyBooks([]);
        setLoading(false);
        return;
      }
      
      const userData = userSnapshot.data();
      const readBooks = userData.readBooks || [];
      if (readBooks.length === 0) {
        setMyBooks([]);
        setLoading(false);
        return;
      }
      
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(
        reviewsRef,
        where('bookId', 'in', readBooks),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      onSnapshot(q, async (snapshot) => {
        const userReviews = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const booksData = [];
        for (let bookId of readBooks) {
          const bookDetails = await fetchBookDetails(bookId);
          const filteredReviews = userReviews.filter((rev) => rev.bookId === bookId);
          booksData.push({
            bookId,
            title: bookDetails?.title || 'Sin título',
            authors: bookDetails?.authors || [],
            imageUrl: bookDetails?.imageLinks?.thumbnail || '',
            description: bookDetails?.description || '',
            reviews: filteredReviews,
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

  useFocusEffect(
    useCallback(() => {
      loadMyBooks();
    }, [])
  );

  const renderBookItem = ({ item }) => (
    <Card style={styles.bookCard}>
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.bookImage} resizeMode="contain" />
      <Card.Title title={item.title} subtitle={item.authors.join(', ') || 'Autor desconocido'} />
      <Card.Content>
        {item.reviews.length > 0 ? (
          <>
            <Text style={styles.subtitle}>Mis Reseñas:</Text>
            {item.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <Avatar.Icon size={24} icon="star" color="#FFD700" />
                <Text style={styles.reviewText}>{rev.text}</Text>
                <Text style={styles.reviewRating}>⭐ {rev.rating} / 5</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noReviews}>Aún no hay reseñas para este libro</Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ea" />
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
    <View style={styles.container}>
      <FlatList data={myBooks} keyExtractor={(item) => item.bookId} renderItem={renderBookItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bookCard: { marginBottom: 10, borderRadius: 10, elevation: 3 },
  bookImage: { height: 180, borderRadius: 10 },
  subtitle: { fontWeight: '600', marginBottom: 4 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  reviewText: { flex: 1, marginLeft: 8 },
  reviewRating: { fontWeight: 'bold', color: '#FFA500' },
  noReviews: { textAlign: 'center', color: '#777', fontStyle: 'italic' },
});
