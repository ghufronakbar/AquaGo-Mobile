import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Button } from '@/components/Button';
import { useCart } from '@/contexts/CartContext';
import { productService } from '@/services/api';
import { Product } from '@/models/Entity';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CartScreen() {
  const { cart, removeFromCart, getCart, clearCart, addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    getCart();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.data.data);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const cartProducts = products.filter((p) =>
    cart.some((c) => c.productId === p.id)
  );

  const handleIncrement = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  const handleDecrement = (productId: string) => {
    const cartItem = cart.find((c) => c.productId === productId);
    if (cartItem && cartItem.quantity > 1) {
      addToCart({ productId, quantity: -1 });
    } else {
      removeFromCart(productId);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const total = cartProducts.reduce((sum, product) => {
    const cartItem = cart.find((c) => c.productId === product.id);
    return sum + product.price * (cartItem?.quantity || 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.subtitle}>Your saved products</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {cartProducts.map((product) => {
          const cartItem = cart.find((c) => c.productId === product.id);
          return (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() =>
                router.push({
                  pathname: '/(page)/product-detail',
                  params: {
                    id: product.id,
                  },
                })
              }
            >
              <Image
                source={{
                  uri:
                    product.images?.[0] ||
                    'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg',
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice} numberOfLines={1}>
                  Rp {product.price?.toLocaleString()}
                </Text>
                <Text style={styles.itemTotal}>
                  Total: Rp{' '}
                  {(product.price * (cartItem?.quantity || 0)).toLocaleString()}
                </Text>
                <View style={styles.rowBetween}>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => handleDecrement(product.id)}
                    >
                      <Minus size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>
                      {cartItem?.quantity}
                    </Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => handleIncrement(product.id)}
                    >
                      <Plus size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(product.id)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {cartProducts.length === 0 && (
          <View style={styles.emptyState}>
            <ShoppingBag size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>Cart empty</Text>
            <Text style={styles.emptySubtext}>Let's get some products</Text>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.bottomBar}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rp {total.toLocaleString()}</Text>
        </View>
        <Button
          title="Checkout"
          onPress={() => router.push('/(page)/checkout')}
          style={{ flex: 1, marginRight: 8 }}
          disabled={cart.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    height: 120,
  },
  productImage: {
    width: 100,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  productInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  itemTotal: {
    fontSize: 14,
    color: Colors.accent,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 8,
    fontFamily: 'Inter-Bold',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  removeText: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 8,
  },
  totalBox: {
    marginRight: 16,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
