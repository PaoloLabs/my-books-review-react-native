import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { storage, firestore } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput, Button, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen({ navigation }) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [photoURL, setPhotoURL] = useState('');
  const [readCount, setReadCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Cargar información del perfil
  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(firestore, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setLastName(data.lastName || '');
        setEmail(data.email || currentUser.email);
        setPhotoURL(data.photoURL || '');
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    }
  };

  // Cargar estadísticas de libros leídos y reseñas
  const loadStats = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        setReadCount(data.readBooks?.length || 0);
      } else {
        setReadCount(0);
      }

      const reviewsRef = collection(firestore, 'reviews');
      const q = query(reviewsRef, where('userId', '==', currentUser.uid));
      const reviewsSnap = await getDocs(q);
      setReviewsCount(reviewsSnap.size);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      loadStats();
    }, [])
  );

  // Subir imagen de perfil
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso denegado para acceder a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7
    });
    if (!result.canceled && result.assets.length) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `profilePics/${currentUser.uid}.jpg`);
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        () => { },
        (error) => {
          console.error('Error subiendo imagen:', error);
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setPhotoURL(downloadURL);
          } catch (err) {
            console.log('Error obteniendo URL:', err);
          }
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setUploading(true);
      const docRef = doc(firestore, 'users', currentUser.uid);
      await setDoc(docRef, { name, lastName, email, photoURL }, { merge: true });
      setUploading(false);
      Alert.alert('Perfil actualizado', 'Los cambios se han guardado.');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Auth');
    } catch (error) {
      Alert.alert('Error al cerrar sesión', error.message);
    }
  };

  const pieData = [
    { name: 'Leídos', population: readCount, color: '#1e90ff', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Reseñas', population: reviewsCount, color: '#ff7f50', legendFontColor: '#7F7F7F', legendFontSize: 15 }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      {uploading && <ActivityIndicator animating size="large" color="#0000ff" />}

      {/* Foto de perfil */}
      <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
        {photoURL ? (
          <Avatar.Image source={{ uri: photoURL }} size={120} />
        ) : (
          <Avatar.Icon size={120} icon="account" />
        )}
      </TouchableOpacity>

      {/* Datos del usuario */}
      <Card style={styles.card}>
        <Card.Title title="Información de Perfil" />
        <Card.Content>
          <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
          <TextInput label="Apellido" value={lastName} onChangeText={setLastName} mode="outlined" style={styles.input} />
          <TextInput label="Email" value={email} mode="outlined" style={[styles.input, { backgroundColor: '#eee' }]} disabled />
        </Card.Content>
      </Card>

      {/* Gráfico de estadísticas */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>Estadísticas</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth * 0.8}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#f9f9f9',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No hay datos para mostrar.</Text>
        )}      </View>

      {/* Botones */}
      <Button mode="contained" onPress={saveProfile} style={styles.button}>Guardar Perfil</Button>
      <Button mode="contained" onPress={handleLogout} style={[styles.button, { backgroundColor: '#d9534f' }]}>Cerrar Sesión</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  profilePicContainer: { marginBottom: 20 },
  card: { width: '90%', marginBottom: 20 },
  input: { marginBottom: 10 },
  button: { marginVertical: 10 },
  label: { fontWeight: 'bold', fontSize: 18, textAlign: 'center' }
});
