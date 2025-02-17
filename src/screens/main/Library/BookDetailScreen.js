import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

import { firestore, auth } from '../../../config/firebase';

import { fetchBookDetails } from '../../../services/api';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { commonStyles } from '../../../styles/CommonStyles';

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params;

  // Estados para el detalle del libro
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para reseñas
  const [reviews, setReviews] = useState([]);       // Lista de reseñas en Firestore
  const [reviewText, setReviewText] = useState(''); // Texto de la nueva reseña
  const [rating, setRating] = useState(0);          // Calificación por estrellas

  // Estado para saber si el libro ya está marcado como leído
  const [isRead, setIsRead] = useState(false);

  // Cargar datos del libro desde la API
  useEffect(() => {
    const getBookDetails = async () => {
      const bookData = await fetchBookDetails(bookId);
      setBook(bookData);
      setLoading(false);
    };
    getBookDetails();
  }, [bookId]);

  // Suscribirse en tiempo real a las reseñas de este libro
  useEffect(() => {
    const reviewsRef = collection(firestore, 'reviews');
    const q = query(
      reviewsRef,
      where('bookId', '==', bookId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = [];
      snapshot.forEach((docSnap) => {
        fetchedReviews.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReviews(fetchedReviews);
    });

    return () => unsubscribe();
  }, [bookId]);

  // Al montar o cambiar el bookId, verificar si el libro ya está en el array readBooks del usuario
  useEffect(() => {
    const checkIfRead = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Si no existe, lo creamos vacío
          await setDoc(userDocRef, { readBooks: [] });
          setIsRead(false);
        } else {
          const data = userDocSnap.data();
          if (data.readBooks?.includes(bookId)) {
            setIsRead(true);
          } else {
            setIsRead(false);
          }
        }
      } catch (error) {
        console.error('Error revisando si el libro está marcado como leído:', error);
      }
    };

    checkIfRead();
  }, [auth.currentUser, bookId]);

  // Envía una nueva reseña a Firestore
  const submitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Error', 'La reseña no puede estar vacía.');
      return;
    }
    if (rating < 1) {
      Alert.alert('Error', 'La calificación debe ser al menos de 1 estrella.');
      return;
    }
    // Verificamos si hay un usuario autenticado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No hay usuario autenticado.');
      return;
    }
    try {
      await addDoc(collection(firestore, 'reviews'), {
        bookId,
        text: reviewText,
        rating,
        createdAt: serverTimestamp(),
        userId: currentUser.uid
      });
      // Limpiar campos
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

  // Actualiza una reseña (ejemplo simple)
  const editReview = async (reviewId) => {
    try {
      const docRef = doc(firestore, 'reviews', reviewId);
      await updateDoc(docRef, { text: 'Reseña Editada', rating: 5 });
    } catch (error) {
      console.error('Error al editar la reseña:', error);
    }
  };

  // Función para marcar o desmarcar el libro como leído
  const toggleReadStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No hay usuario autenticado.');
        return;
      }

      const userDocRef = doc(firestore, 'users', currentUser.uid);

      // Primero asegurarnos de que el doc existe
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Si no existe, crearlo con array vacío
        await setDoc(userDocRef, { readBooks: [] });
      }

      // Si ya está leído, lo quitamos; si no, lo agregamos
      if (isRead) {
        await updateDoc(userDocRef, {
          readBooks: arrayRemove(bookId)
        });
        setIsRead(false);
        Alert.alert('¡Removido!', 'Se quitó el libro de tus leídos');
      } else {
        await updateDoc(userDocRef, {
          readBooks: arrayUnion(bookId)
        });
        setIsRead(true);
        Alert.alert('¡Libro guardado!', 'Se marcó este libro como leído en tu cuenta.');
      }

    } catch (error) {
      console.error('Error al cambiar el estado de leído:', error);
    }
  };

  // Componente: rating con estrellas ★
  const StarRating = ({ currentRating, onSelectRating }) => {
    const totalStars = 5;
    return (
      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        {Array.from({ length: totalStars }, (_, index) => {
          const starValue = index + 1;
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
        {/* Imagen del libro */}
        {book?.imageLinks?.thumbnail && (
          <Image
            source={{ uri: book.imageLinks.thumbnail }}
            style={{ width: 150, height: 220, alignSelf: 'center', marginBottom: 15 }}
          />
        )}

        {/* Título, autor, descripción */}
        <Text style={commonStyles.detailBookTitle}>{book?.title}</Text>
        <Text style={commonStyles.detailBookAuthor}>
          {book?.authors?.join(', ') || 'Autor desconocido'}
        </Text>
        <Text style={commonStyles.detailBookDescription}>
          {book?.description || 'No hay descripción disponible.'}
        </Text>

        {/* Formulario para crear nueva reseña */}
        <View style={commonStyles.detailReviewForm}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Añadir Reseña:</Text>
          <StarRating currentRating={rating} onSelectRating={setRating} />
          <TextInput
            style={commonStyles.detailInput}
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

        {/* Listado de reseñas desde Firestore */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Reseñas:</Text>
          {reviews.map((item) => (
            <View key={item.id} style={commonStyles.detailReviewItem}>
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

      {/* Botón para marcar/desmarcar como leído */}
      <TouchableOpacity style={[commonStyles.detailButton, isRead ? commonStyles.detailReadButtonActive : commonStyles.detailReadButton]}
        onPress={toggleReadStatus}>
        <Text style={commonStyles.detailButtonText}>{isRead ? "Leído" : "Marcar como leído"}</Text>
      </TouchableOpacity>
    </View>
  );
}

