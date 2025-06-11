import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { productService } from '@/services/api';
import { Product } from '@/models/Entity';
import { Button } from '@/components/Button';
import { useCart } from '@/contexts/CartContext';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id as string);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productService.getById(productId);
      setProduct(response.data.data);
    } catch (error) {
      console.log('Product detail loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ productId: product.id, quantity });
      Toast.show({
        type: 'success',
        text1: 'Added to cart',
        text2: `${product?.name} has been added to your cart.`,
      });
    }
  };

  const handleCheckout = () => {
    handleAddToCart();
    router.push('/(page)/checkout');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Product not found</Text>
        </View>
      </View>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg'];

  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setImageIndex(index);
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setImageIndex(index);
              setModalVisible(true);
            }}
          >
            <Image source={{ uri: item }} style={styles.productImage} />
          </TouchableOpacity>
        )}
        keyExtractor={(_, idx) => idx.toString()}
      />
      {/* Image Step Indicator */}
      <View style={styles.stepIndicator}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={[styles.stepDot, imageIndex === idx && styles.stepDotActive]}
          />
        ))}
      </View>
      {/* Full Image Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: images[imageIndex] }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
      {/* Product Info */}
      <ScrollView
        style={styles.infoScroll}
        contentContainerStyle={styles.infoContent}
      >
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>
          Rp {product.price?.toLocaleString()}
        </Text>
        <Text style={styles.productDescription}>{product.desc}</Text>
        {/* Seller Info - Descriptive, Typography, Color */}
        <View style={styles.sellerCard}>
          <Text style={styles.sellerTitle}>Seller</Text>
          <View style={styles.sellerRow}>
            {product.user?.picture && (
              <Image
                source={{ uri: product.user.picture }}
                style={styles.sellerAvatar}
              />
            )}
            <View style={styles.sellerInfoText}>
              <Text style={styles.sellerName}>{product.user?.name}</Text>
              {product.user?.email && (
                <Text style={styles.sellerEmail}>{product.user.email}</Text>
              )}
            </View>
          </View>
          <Text style={styles.sellerMeta}>
            Joined:{' '}
            <Text style={styles.sellerMetaValue}>
              {new Date(product.user?.createdAt || '').toLocaleDateString()}
            </Text>
          </Text>
        </View>
        <Text style={styles.createdAt}>
          Listed on {new Date(product.createdAt).toLocaleDateString()}
        </Text>
        <View style={{ height: 120 }} />
      </ScrollView>
      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomBar}>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Checkout"
          variant="secondary"
          onPress={handleCheckout}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  carousel: {
    backgroundColor: '#000',
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    resizeMode: 'cover',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    marginBottom: 8,
    zIndex: 2,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    opacity: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: 'contain',
  },
  infoScroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  infoContent: {
    padding: 24,
    paddingBottom: 0,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  productDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  sellerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sellerTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  sellerInfoText: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    fontFamily: 'Inter-Bold',
  },
  sellerEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  sellerMeta: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },
  sellerMetaValue: {
    color: Colors.text,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  createdAt: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
});
