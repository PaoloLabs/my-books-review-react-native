import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, TextInput, Avatar, ActivityIndicator, Snackbar, IconButton, Modal, Portal } from 'react-native-paper';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore, auth } from '../../../config/firebase';
import { fetchBookDetails } from '../../../services/api';

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Estados para editar reseña
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [editReviewId, setEditReviewId] = useState(null);

  const currentUser = auth.currentUser;

  const StarRating = ({ currentRating, onSelectRating }) => (
    <View style={styles.starRatingContainer}>
      {Array.from({ length: 5 }, (_, index) => (
        <IconButton
          key={index}
          icon={index + 1 <= currentRating ? 'star' : 'star-outline'}
          iconColor="#FFD700"
          size={30}
          onPress={() => onSelectRating(index + 1)}
        />
      ))}
    </View>
  );

  useEffect(() => {
    const getBookDetails = async () => {
      const bookData = await fetchBookDetails(bookId);
      setBook(bookData);
      setLoading(false);
    };
    getBookDetails();
  }, [bookId]);

  useEffect(() => {
    const reviewsRef = collection(firestore, 'reviews');
    const q = query(reviewsRef, where('bookId', '==', bookId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(fetchedReviews);
      const userExistingReview = fetchedReviews.find(review => review.userId === currentUser?.uid);
      setUserReview(userExistingReview || null);
    });

    return () => unsubscribe();
  }, [bookId]);

  useEffect(() => {
    const checkIfRead = async () => {
      if (!currentUser) return;
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      setIsRead(userDocSnap.exists() && userDocSnap.data().readBooks?.includes(bookId));
    };
    checkIfRead();
  }, [bookId]);

  const toggleReadStatus = async () => {
    if (!currentUser) {
      setSnackbarMessage('Debes iniciar sesión para marcar como leído.');
      setSnackbarVisible(true);
      return;
    }

    const userDocRef = doc(firestore, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, { readBooks: [] });
    }

    if (isRead) {
      await updateDoc(userDocRef, { readBooks: arrayRemove(bookId) });
      setIsRead(false);
    } else {
      await updateDoc(userDocRef, { readBooks: arrayUnion(bookId) });
      setIsRead(true);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim() || rating < 1) {
      setSnackbarMessage('Debes escribir una reseña y asignar al menos 1 estrella.');
      setSnackbarVisible(true);
      return;
    }
    if (!currentUser) {
      setSnackbarMessage('Debes iniciar sesión para escribir una reseña.');
      setSnackbarVisible(true);
      return;
    }
    try {
      const userName = currentUser.email || 'Usuario Anónimo';
      console.log('Usuario:', currentUser);
      await addDoc(collection(firestore, 'reviews'), {
        bookId,
        text: reviewText,
        rating,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        userName,
      });

      setReviewText('');
      setRating(0);
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(firestore, 'reviews', reviewId));
      setSnackbarMessage('Reseña eliminada correctamente.');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error al eliminar la reseña:', error);
    }
  };

  const updateReview = async () => {
    if (!editReviewText.trim() || editReviewRating < 1) {
      setSnackbarMessage('Debes escribir una reseña válida y asignar al menos 1 estrella.');
      setSnackbarVisible(true);
      return;
    }
    try {
      const docRef = doc(firestore, 'reviews', editReviewId);
      await updateDoc(docRef, { text: editReviewText, rating: editReviewRating });
      setEditModalVisible(false);
      setSnackbarMessage('Reseña actualizada con éxito.');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error al actualizar la reseña:', error);
    }
  };

  const openEditModal = (review) => {
    setEditReviewId(review.id);
    setEditReviewText(review.text);
    setEditReviewRating(review.rating);
    setEditModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        {book?.imageLinks?.thumbnail && (
          <Card.Cover source={{ uri: book.imageLinks.thumbnail }} style={styles.bookImage} />
        )}
        <Card.Title title={book?.title} subtitle={book?.authors?.join(', ') || 'Autor desconocido'} />
        <Card.Content>
          <Text variant="bodyMedium">{book?.description || 'No hay descripción disponible.'}</Text>
        </Card.Content>
      </Card>

      {!userReview && (
        <Card style={styles.sectionCard}>
          <Card.Title title="Añadir Reseña" />
          <Card.Content>
            <Text style={{ fontWeight: 'bold' }}>Calificación:</Text>
            <StarRating currentRating={rating} onSelectRating={setRating} />
            <TextInput label="Escribe tu reseña..." mode="outlined" multiline value={reviewText} onChangeText={setReviewText} style={styles.input} />
            <Button mode="contained" onPress={submitReview} style={styles.button}>Subir Reseña</Button>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <Card.Title title="Reseñas" />
        <Card.Content>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No hay reseñas aún.</Text>
          ) : (
            reviews.map((item) => (
              <View key={item.id} style={styles.reviewItem}>
                <Avatar.Icon size={36} icon="account" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.reviewText}>{item.text}</Text>
                  <Text style={styles.reviewRating}>⭐ {item.rating} / 5</Text>
                </View>
                {currentUser?.uid === item.userId && (
                  <View style={styles.reviewActions}>
                    <IconButton icon="pencil" size={20} onPress={() => openEditModal(item)} />
                    <IconButton icon="delete" size={20} onPress={() => deleteReview(item.id)} />
                  </View>
                )}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Title title="Editar Reseña" />
            <Card.Content>
              <StarRating currentRating={editReviewRating} onSelectRating={setEditReviewRating} />
              <TextInput label="Editar reseña..." mode="outlined" multiline value={editReviewText} onChangeText={setEditReviewText} style={styles.input} />
              <Button mode="contained" onPress={updateReview} style={styles.button}>Guardar Cambios</Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      <Button mode="contained" onPress={toggleReadStatus} style={styles.button}>
        {isRead ? 'Marcar como No Leído' : 'Marcar como Leído'}
      </Button>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  bookImage: { height: 250 },
  sectionCard: { marginVertical: 10 },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  userName: { fontWeight: 'bold' },
  reviewText: { fontSize: 16 },
  reviewRating: { fontWeight: 'bold', color: '#FFA500' },
  noReviews: { textAlign: 'center', color: '#777' },
  starRatingContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
});