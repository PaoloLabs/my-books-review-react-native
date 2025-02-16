import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// Se importa Firestore (asegúrate de tener la config de Firebase)
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase'; 
import { fetchBookDetails } from '../../../services/api';
import { LoadingOverlay } from '../../../components/LoadingOverlay';

export default function BookDetailScreen({ route, navigation }) {
  // Se recibe el ID del libro desde la navegación
  const { bookId } = route.params;

  // Estados para el detalle del libro
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para reseñas
  const [reviews, setReviews] = useState([]);           // Lista de reseñas en Firestore
  const [reviewText, setReviewText] = useState('');     // Texto de la nueva reseña
  const [rating, setRating] = useState(0);              // Calificación por estrellas

  // Se obtiene el detalle del libro de la API (Udacity Books)
  useEffect(() => {
    const getBookDetails = async () => {
      const bookData = await fetchBookDetails(bookId);
      setBook(bookData);
      setLoading(false);
    };
    getBookDetails();
  }, [bookId]);

  // Se suscribe en tiempo real a las reseñas de este libro
  useEffect(() => {
    // Referencia a la colección 'reviews'
    const reviewsRef = collection(firestore, 'reviews');
    // Consulta filtrando por el campo bookId
    const q = query(
      reviewsRef,
      where('bookId', '==', bookId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedReviews = [];
      snapshot.forEach(docSnap => {
        fetchedReviews.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReviews(fetchedReviews);
    });

    // Al desmontar el componente, se limpia la suscripción
    return () => unsubscribe();
  }, [bookId]);

  // Envía una nueva reseña a Firestore
  const submitReview = async () => {
    if (!reviewText.trim()) {
      return; // Asegurarse de que el texto no esté vacío
    }
    if (rating < 1) {
      return; // Asegurarse de que haya una calificación
    }
    try {
      // Agregar nuevo documento a la colección 'reviews'
      await addDoc(collection(firestore, 'reviews'), {
        bookId,          // Para saber a qué libro pertenece la reseña
        text: reviewText,
        rating,
        createdAt: serverTimestamp(),
        // userId o userEmail si lo deseas, si manejas usuarios con Firebase Auth
      });
      // Resetea los campos del formulario
      setReviewText('');
      setRating(0);
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
    }
  };

  // Elimina una reseña de Firestore
  const deleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(firestore, 'reviews', reviewId));
    } catch (error) {
      console.error('Error al eliminar la reseña:', error);
    }
  };

  // Actualiza una reseña (por ejemplo, cambia el texto a “Editado”)
  const editReview = async (reviewId) => {
    try {
      const docRef = doc(firestore, 'reviews', reviewId);
      await updateDoc(docRef, { text: 'Reseña Editada', rating: 5 });
    } catch (error) {
      console.error('Error al editar la reseña:', error);
    }
  };

  // Componente que dibuja las estrellas según la calificación
  // y maneja la selección de calificación
  const StarRating = ({ currentRating, onSelectRating }) => {
    // Se define cuántas estrellas en total
    const totalStars = 5;
    
    return (
      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        {Array.from({ length: totalStars }, (_, index) => {
          const starValue = index + 1;
          // Si la calificación es >= starValue, la estrella se “pinta”
          const isFilled = currentRating >= starValue;

          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => onSelectRating(starValue)}
              style={{ marginRight: 5 }}
            >
              <Text style={{ fontSize: 24, color: isFilled ? '#FFD700' : '#ccc' }}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return <LoadingOverlay visible={loading} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 15 }}>
        {book?.imageLinks?.thumbnail && (
          <Image 
            source={{ uri: book.imageLinks.thumbnail }} 
            style={{ width: 150, height: 220, alignSelf: 'center', marginBottom: 15 }} 
          />
        )}
        <Text style={styles.bookTitle}>{book?.title}</Text>
        <Text style={styles.bookAuthor}>{book?.authors?.join(', ')}</Text>
        <Text style={styles.bookDescription}>{book?.description || 'No hay descripción disponible.'}</Text>

        {/* Sección para crear una nueva reseña */}
        <View style={styles.reviewForm}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Añadir Reseña:</Text>
          <StarRating currentRating={rating} onSelectRating={setRating} />
          <TextInput
            style={styles.input}
            placeholder="Escribe tu reseña..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
          />
          <Button 
            title="Enviar Reseña"
            onPress={submitReview}
          />
        </View>

        {/* Sección que lista las reseñas obtenidas de Firestore */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Reseñas:</Text>
          {reviews.map(item => (
            <View key={item.id} style={styles.reviewItem}>
              <Text style={{ fontWeight: 'bold' }}>
                Calificación: {item.rating} / 5
              </Text>
              <Text>{item.text}</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Button 
                  title="Editar"
                  onPress={() => editReview(item.id)}
                />
                <View style={{ width: 10 }} />
                <Button 
                  title="Borrar"
                  color="red"
                  onPress={() => deleteReview(item.id)}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Button title="Volver a la Biblioteca" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  bookAuthor: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10
  },
  bookDescription: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 20
  },
  reviewForm: {
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10
  },
  reviewItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10
  }
});
