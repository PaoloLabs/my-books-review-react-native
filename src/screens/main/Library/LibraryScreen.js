import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, ActivityIndicator, TextInput } from 'react-native';
import { fetchBooksPaginated } from '../../../services/api';

export default function LibraryScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Función para cargar más libros de la API
  const loadMoreBooks = async () => {
    setLoading(true);
    const newBooks = await fetchBooksPaginated();
    setBooks(prevBooks => {
      const updatedBooks = [...prevBooks, ...newBooks];
      setFilteredBooks(updatedBooks); // Asegura que la lista filtrada también se actualice
      return updatedBooks;
    });
    setLoading(false);
  };

  // Cargar libros al montar el componente
  useEffect(() => {
    loadMoreBooks();
  }, []);

  // Filtrar libros en base al término de búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(
        books.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, books]);

  // Renderiza cada libro en la lista
  const renderBookItem = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 18 }}>{item.title}</Text>
      <Button 
        title="Ver Detalles" 
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })} 
      />
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Campo de búsqueda con filtrado dinámico */}
      <TextInput
        placeholder="Buscar libros..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ height: 40, borderBottomWidth: 1, marginBottom: 10, paddingHorizontal: 8 }}
      />
      
      {/* Lista de libros con paginación y búsqueda */}
      <FlatList
        data={filteredBooks} // Se usa la lista filtrada
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      />
    </View>
  );
}
