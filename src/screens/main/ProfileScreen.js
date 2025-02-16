import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Importa 'storage' ya conectado al emulador
import { storage, firestore } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import * as ImagePicker from 'expo-image-picker';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export default function ProfileScreen({ navigation }) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [name, setName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [photoURL, setPhotoURL] = useState('');
  const [booksRead, setBooksRead] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const docRef = doc(firestore, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setEmail(data.email || currentUser.email);
          setPhotoURL(data.photoURL || '');
          setBooksRead(data.booksRead || 0);
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      }
    };
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

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
      // Usar la instancia 'storage' conectada al emulador
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
            // La URL en el emulador NO será un link público real
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('URL del emulador:', downloadURL);
            setPhotoURL(downloadURL);
          } catch (err) {
            console.log('Error obteniendo URL (Emulador):', err);
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
          photoURL,
          booksRead
        },
        { merge: true }
      );
      setUploading(false);
      alert('Perfil actualizado.');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      setUploading(false);
    }
  };

  const incrementBooksRead = () => {
    setBooksRead((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={uploading} />

      <TouchableOpacity onPress={pickImage}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
            <Text style={{ color: '#aaa' }}>Sin foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nombre:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        value={email}
        onChangeText={setEmail}
        editable={false}
      />

      <Text style={styles.label}>Libros Leídos: {booksRead}</Text>
      <Button title="Sumar 1 libro leído" onPress={incrementBooksRead} />

      <Button
        title={uploading ? 'Guardando...' : 'Guardar Perfil'}
        onPress={saveProfile}
        disabled={uploading}
      />
      <Button title="Volver" onPress={() => navigation.goBack()} color="#888" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20
  },
  profilePicPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5
  }
});
