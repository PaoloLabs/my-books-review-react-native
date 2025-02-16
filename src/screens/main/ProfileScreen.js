import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView
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
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { PieChart } from 'react-native-chart-kit';

// Importamos useFocusEffect
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen({ navigation }) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [name, setName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [photoURL, setPhotoURL] = useState('');
  const [readCount, setReadCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Función para cargar la información del perfil
  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(firestore, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setEmail(data.email || currentUser.email);
        setPhotoURL(data.photoURL || '');
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    }
  };

  // Función para cargar estadísticas
  const loadStats = async () => {
    if (!currentUser) return;
    try {
      // 1. Libros leídos
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        const readBooks = data.readBooks || [];
        setReadCount(readBooks.length);
      } else {
        setReadCount(0);
      }

      // 2. Reseñas (colección 'reviews' filtrando por userId)
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(reviewsRef, where('userId', '==', currentUser.uid));
      const reviewsSnap = await getDocs(q);
      setReviewsCount(reviewsSnap.size);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // useFocusEffect para recargar datos cada vez que esta pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      // Cargamos info de perfil y estadísticas
      fetchUserProfile();
      loadStats();
    }, [])
  );

  // Subir imagen
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
      const pickedUri = result.assets[0].uri;
      uploadImage(pickedUri);
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
        () => {},
        (error) => {
          console.error('Error subiendo imagen:', error);
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('URL del emulador/real:', downloadURL);
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
      await setDoc(
        docRef,
        {
          name,
          email,
          photoURL
        },
        { merge: true }
      );
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
    {
      name: 'Leídos',
      population: readCount,
      color: '#1e90ff',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    },
    {
      name: 'Reseñas',
      population: reviewsCount,
      color: '#ff7f50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
    >
      <LoadingOverlay visible={uploading} />

      {/* FOTO DE PERFIL */}
      <TouchableOpacity onPress={pickImage}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
            <Text style={{ color: '#aaa' }}>Sin foto</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nombre */}
      <Text style={styles.label}>Nombre:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      {/* Email (no editable) */}
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        value={email}
        onChangeText={setEmail}
        editable={false}
      />

      {/* Gráfico circular: Libros leídos vs. Reseñas */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>Estadísticas</Text>

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
      </View>

      {/* Botón para guardar perfil */}
      <View style={{ marginTop: 20, width: '80%' }}>
        <Button
          title={uploading ? 'Guardando...' : 'Guardar Perfil'}
          onPress={saveProfile}
          disabled={uploading}
        />
      </View>

      {/* Botón para cerrar sesión */}
      <View style={{ marginTop: 10, width: '80%' }}>
        <Button title="Cerrar Sesión" onPress={handleLogout} color="#d9534f" />
      </View>

      {/* Botón para volver a la pantalla anterior */}
      <View style={{ marginTop: 10, width: '80%' }}>
        <Button
          title="Volver"
          onPress={() => navigation.goBack()}
          color="#888"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profilePicPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    width: '80%',
    textAlign: 'center',
  },
});
