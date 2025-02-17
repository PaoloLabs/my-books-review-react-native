
# 📚 My Books Review App - React Native + Expo

My Books Review es una aplicación móvil desarrollada en React Native que permite a los usuarios explorar, marcar como leídos y revisar libros. La app integra Firebase para la autenticación y el manejo de datos (Firestore y Storage) y utiliza librerías como react-native-paper, react-navigation y expo-linear-gradient para ofrecer una experiencia de usuario moderna y atractiva.

## 🚀 Comenzando

### Prerrequisitos

- Node.js >= 16.x
- Expo CLI
- Un editor de código (recomendado: VS Code)
- Expo Go app en tu dispositivo móvil (para testing)

## 📁 Estructura del Proyecto

```
my-books-review-react-native/
├── App.js
├── package.json
├── README.md
├── config/
│   └── firebase.js            // Configuración de Firebase (auth, firestore, storage)
├── navigation/
│   ├── TabNavigator.js        // Barra de pestañas personalizada
│   └── LibraryStack.js        // Stack de navegación para la sección "Librería"
├── screens/
│   ├── main/
│   │   ├── Library/
│   │   │   ├── LibraryScreen.js       // Pantalla principal de la biblioteca (listado de libros)
│   │   │   └── BookDetailScreen.js      // Detalle de cada libro
│   │   ├── MyBooksScreen.js             // Pantalla de "Mis Libros"
│   │   └── ProfileScreen.js             // Pantalla de perfil de usuario (con gradiente, estadísticas y edición)
├── services/
│   └── api.js                 // Funciones para obtener datos (fetchAllBooks, fetchBooksPaginated, etc.)
└── assets/
    ├── icons/                 // Íconos y gráficos
    └── images/                // Imágenes de respaldo, logos, fondos, etc.
```
## 🎯 Características

- **Autenticación y Perfil de Usuario**  
  - Inicio de sesión y registro mediante Firebase.
  - Edición de perfil con foto personalizable, utilizando ImagePicker y Firebase Storage.
  - Visualización de estadísticas de libros leídos y reseñas.

- **Navegación y UI Mejoradas**  
  - **Tab Navigator**: Barra de pestañas personalizada con íconos consistentes, colores definidos y separación adecuada, optimizada para dispositivos con notch.
  - **Stack Navigator**: Encabezados personalizados con fondos sólidos, títulos centrados y transiciones suaves en la sección de la biblioteca.
  - **ProfileScreen**:  
    - Fondo con degradado usando `expo-linear-gradient`.  
    - Componentes reorganizados para separar la foto, el formulario de perfil y las estadísticas.
    - Indicadores de carga al actualizar la imagen de perfil.
  - **LibraryScreen**:  
    - Barra de búsqueda optimizada para filtrar libros por título.
    - Eliminación de la paginación: ahora se cargan todos los libros de una sola vez.
    - Funcionalidad para marcar libros como leídos y actualizar el estado en Firestore.
    - Uso de `useFocusEffect` para refrescar datos y evitar problemas (como la lista vacía tras logout/login).

- **Interfaz Visual Moderna**  
  - Fondos con degradados que aportan un estilo moderno.
  - Componentes de **react-native-paper** con estilos consistentes.
  - Manejo optimizado de imágenes y sombras, evitando problemas con el overflow en componentes Paper.

---

## 💡 Tecnologías Utilizadas

- **React Native** – Framework para el desarrollo móvil.
- **Expo** – Herramientas y servicios para construir apps con React Native.
- **Firebase** – Autenticación, Firestore y Storage.
- **React Navigation** – Navegación mediante Tab Navigator y Native Stack Navigator.
- **React Native Paper** – Componentes UI con diseño Material.
- **Expo Linear Gradient** – Para fondos con degradados modernos.
- **React Native Elements** – Para íconos y componentes adicionales.

## Instalación

1. **Clona el repositorio:**
```bash
   git clone https://github.com/PaoloLabs/my-books-review-react-native.git
   cd my-books-review-react-native
```

2. **Instala las dependencias:**  
```bash
   npm install
   # o si usas yarn:
   yarn install
```
3. **Configura Firebase:**  
- Crea un proyecto en Firebase y habilita Authentication, Firestore y Storage.
- Actualiza el archivo **config/firebase.js** con las credenciales de tu proyecto.

4. **Inicia la aplicación:**  
```bash
   expo start
```
---

## 💡 Recomendaciones

1. **Gestión de Estado**
   - Considera usar Context API para estado global
   - Implementa reducers para operaciones complejas
   - Mantén el estado local cuando sea apropiado

2. **Código Limpio**
   - Sigue una estructura de carpetas coherente
   - Usa nombres descriptivos para componentes y funciones
   - Implementa PropTypes para validación de props
   - Comenta el código cuando sea necesario

3. **UI/UX**
   - Mantén un diseño consistente
   - Implementa estados de carga
   - Añade mensajes de error claros
   - Usa animaciones con moderación

4. **Performance**
   - Implementa memorización cuando sea necesario
   - Optimiza las imágenes
   - Usa lazy loading para componentes pesados
   - Implementa paginación en listas largas

## 🔍 Debugging

- Usa console.log() estratégicamente
- Implementa try-catch para manejo de errores
- Utiliza React Native Debugger para inspección
- Monitorea el rendimiento con las Dev Tools de React

## 📝 Recursos Útiles

- [Documentación de React Native](https://reactnative.dev/docs/getting-started)
- [Documentación de Expo](https://docs.expo.dev/)
- [Guía de Firebase](https://firebase.google.com/docs)
- [React Navigation Docs](https://reactnavigation.org/)
- [RNE UI Components](https://reactnativeelements.com/)

## ⚠️ Consideraciones Importantes

1. **Seguridad**
   - No expongas claves de API en el código
   - Implementa validaciones en el cliente y servidor
   - Usa variables de entorno para configuraciones sensibles

2. **Testing**
   - Prueba en iOS y Android
   - Verifica diferentes tamaños de pantalla
   - Prueba casos de error y edge cases
   - Implementa manejo de estado offline

## 📖 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para detalles

