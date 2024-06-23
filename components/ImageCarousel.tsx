import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Image, StyleSheet, Dimensions, Text, Platform, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

// Definir la interfaz Producto al inicio del archivo
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  disponible: boolean;
  categoria_id: number;
  created_at: string;
  updated_at: string;
  descripcion?: string; // Asumiendo que "descripcion" es opcional
}

const categorias = [
  { title: 'Cafes', imagen: require('@/assets/images/icono_cafe.png'), categoria: 'Cafe' },
  { title: 'Donas', imagen: require('@/assets/images/icono_dona.png'), categoria: 'Donas' },
  { title: 'Galletas', imagen: require('@/assets/images/icono_galletas.png'), categoria: 'Galletas' },
  { title: 'Hamburguesas', imagen: require('@/assets/images/icono_hamburguesa.png'), categoria: 'Hamburguesas' },
  { title: 'Pastel', imagen: require('@/assets/images/icono_pastel.png'), categoria: 'Pasteles' },
  { title: 'Pizzas', imagen: require('@/assets/images/icono_pizza.png'), categoria: 'Pizzas' },
];

const ImageCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Cafe');
  const productosScrollViewRef = useRef<ScrollView>(null); // Referencia para el ScrollView de productos

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`http://192.168.100.22:8001/api/categorias/${categoriaSeleccionada.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        setProductos(data); // Suponiendo que los productos se devuelven directamente como un array
        setActiveIndex(0); // Reiniciar índice activo al inicio
        if (productosScrollViewRef.current) {
          productosScrollViewRef.current.scrollTo({ x: 0, animated: false }); // Scroll al inicio al cambiar categoría
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProductos();
  }, [categoriaSeleccionada]);

  const onScrollProductos = (event: { nativeEvent: { layoutMeasurement: { width: any; }; contentOffset: { x: any; }; }; }) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    let index = Math.floor(contentOffsetX / slideSize);
    if (index >= productos.length) {
      index = 0; // Volver al inicio
    } else if (index < 0) {
      index = productos.length - 1; // Ir al final
    }
    setActiveIndex(index);
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number }; contentSize: { width: number }; layoutMeasurement: { width: number }; }; }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;

    if (contentOffsetX >= contentWidth - layoutWidth) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: true });
      }
    } else if (contentOffsetX <= 0) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={productosScrollViewRef} // Referencia al ScrollView de productos
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScrollProductos} // Evento de scroll para productos
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {productos.map((producto, index) => (
            <View key={index} style={styles.productSlide}>
              <Image source={{ uri: producto.imagen }} style={styles.productImage} resizeMode="cover" />
              <View style={styles.productTextContainer}>
                <Text style={styles.productTitle}>{producto.nombre}</Text>
                <Text style={styles.productDescription}>${producto.precio.toFixed(2)}</Text>
                <Text style={styles.productDescription}>Disponible: {producto.disponible ? 'Sí' : 'No'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {productos.map((_, index) => (
            <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
          ))}
        </View>
      </View>

<View style={styles.catalogContainer}>
        <Text style={styles.title}>Conoce nuestro catálogo</Text>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          onScrollEndDrag={handleScroll}
          scrollEventThrottle={6}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ x: 0, animated: false });
            }
          }}
        >
          {categorias.map((categoria, index) => (
            <TouchableOpacity key={index} style={styles.slide} onPress={() => setCategoriaSeleccionada(categoria.categoria)}>
              <Image source={categoria.imagen} style={styles.image} resizeMode="cover" />
              <View style={styles.textContainer}>
                <Text style={styles.gameTitle}>{categoria.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  catalogContainer: {
    flex: 1,
    backgroundColor: 'rgb(29, 29, 29)',
    marginTop: 30,
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: -1,
  },
  scrollViewContent: {
    alignItems: 'center',
    marginHorizontal: Platform.OS === 'android' ? 0 : 129,
    paddingHorizontal: Platform.OS === 'android' ? 129 : 0,
  },
  slide: {
    width: Platform.OS === 'android' ? 390 - 38 : 400 - 38, 
    marginHorizontal: Platform.OS === 'android' ? -125 : -125,
    borderRadius: 10,
  },
  image: {
    margin: 10,
    marginTop: 19,
    width: '23%',
    height: 60,
    padding: 10,
    borderRadius: 10,
  },
  textContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    width: 84,
    backgroundColor: 'rgba(0, 0, 0, .7)',
    padding: 6,
    borderRadius: 10,
  },
  gameTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  carouselContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    width: width,
    marginBottom: 10,
  },
  productSlide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '80%',
    left: -130,
    height: 380,
    borderRadius: 16,
  },
  productTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: -80,
    width: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productTitle: {
    padding: 3,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  productDescription: {
    padding: 3,
    fontSize: 9,
    color: '#fff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'yellow',
  },
});

export default ImageCarousel;