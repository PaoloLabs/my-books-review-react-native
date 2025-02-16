import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://reactnd-books-api.udacity.com';

const getAuthToken = async () => {
  let token = await AsyncStorage.getItem('auth_token');
  if (!token) {
    token = Math.random().toString(36).substr(2, 16);
    await AsyncStorage.setItem('auth_token', token);
  }
  return token;
};

export const fetchBooks = async () => {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/books`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': token
      }
    });
    const data = await response.json();
    return data.books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

let allBooks = [];
let currentIndex = 0;
const PAGE_SIZE = 5;

export const fetchBooksPaginated = async () => {
  if (allBooks.length === 0) {
    allBooks = await fetchBooks();
  }
  const nextBooks = allBooks.slice(currentIndex, currentIndex + PAGE_SIZE);
  currentIndex += PAGE_SIZE;
  return nextBooks;
};

export const fetchBookDetails = async (bookId) => {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/books/${bookId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': token
      }
    });
    const data = await response.json();
    return data.book;
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};
