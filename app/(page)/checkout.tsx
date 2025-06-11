import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useCart } from '@/contexts/CartContext';
import { productService, orderService } from '@/services/api';
import { Product } from '@/models/Entity';
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { User, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CheckoutScreen() {
  const { cart, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    fetchProducts();
    getUserLocation();
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

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (!location)
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
    } catch {}
  };

  const cartProducts = products.filter((p) =>
    cart.some((c) => c.productId === p.id)
  );
  const total = cartProducts.reduce((sum, product) => {
    const cartItem = cart.find((c) => c.productId === product.id);
    return sum + product.price * (cartItem?.quantity || 0);
  }, 0);

  const handlePickLocation = async () => {
    setModalVisible(true);
    setLocationError('');
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e) {
      setLocationError('Could not get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    setLocation({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
    setLocationLoading(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      });
      if (geocode && geocode.length > 0) {
        setAddress(
          `${geocode[0].name || ''} ${geocode[0].street || ''}, ${
            geocode[0].city || ''
          }, ${geocode[0].region || ''}, ${geocode[0].country || ''}`.trim()
        );
      }
    } catch (e) {
      setAddress('');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleChooseCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      // Reverse geocode
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode && geocode.length > 0) {
        setAddress(
          `${geocode[0].name || ''} ${geocode[0].street || ''}, ${
            geocode[0].city || ''
          }, ${geocode[0].region || ''}, ${geocode[0].country || ''}`.trim()
        );
      }
      setModalVisible(false);
    } catch (e) {
      setLocationError('Could not get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!location || !address) {
      Alert.alert('Error', 'Please pick a location and enter address.');
      return;
    }
    setSaving(true);
    try {
      const res = await orderService.create({
        latitude: location?.latitude,
        longitude: location?.longitude,
        location: address,
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      Toast.show({
        type: 'success',
        text1: 'Order placed!',
        text2: 'Your order has been created.',
      });
      clearCart();
      if (res.data.data.mtRedirectUrl) {
        router.push({
          pathname: '/(page)/payment',
          params: {
            url: res.data.data.mtRedirectUrl,
            id: res.data.data.id,
          },
        });
      }
    } catch (e) {
      Alert.alert('Checkout failed', 'Could not place order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ flex: 1, marginTop: 100 }}
        color={Colors.primary}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>
          Review your cart and complete your order
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {cartProducts.map((product) => {
          const cartItem = cart.find((c) => c.productId === product.id);
          return (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{
                  uri:
                    product.images?.[0] ||
                    'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg',
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  Rp {product.price?.toLocaleString()}
                </Text>
                <Text style={styles.itemTotal}>
                  Total: Rp{' '}
                  {(product.price * (cartItem?.quantity || 0)).toLocaleString()}
                </Text>
                <Text style={styles.productQuantity}>
                  Quantity: {cartItem?.quantity}
                </Text>
                <View style={styles.sellerRow}>
                  {product.user?.picture ? (
                    <Image
                      source={{ uri: product.user.picture }}
                      style={styles.sellerAvatar}
                    />
                  ) : (
                    <View style={styles.sellerAvatarPlaceholder}>
                      <User size={18} color={Colors.primary} />
                    </View>
                  )}
                  <Text style={styles.sellerName}>{product.user?.name}</Text>
                </View>
              </View>
            </View>
          );
        })}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>Rp {total.toLocaleString()}</Text>
        </View>
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your delivery address"
          multiline
          numberOfLines={3}
          style={styles.textarea}
        />
        <TouchableOpacity style={styles.mapButton} onPress={handlePickLocation}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.mapButtonText}>
            {location ? 'Change Location' : 'Pick Location on Map'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <View style={styles.mapModalContainer}>
            <Text style={styles.mapInfo}>
              Tap to pick a location on the map
            </Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || userLocation?.latitude || -6.2,
                longitude:
                  location?.longitude || userLocation?.longitude || 106.816666,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
            >
              {location && <Marker coordinate={location} />}
            </MapView>
            <Button
              title="Choose Current Location"
              onPress={handleChooseCurrentLocation}
              style={styles.mapCurrentButton}
            />
            <Button
              title="Done"
              onPress={() => setModalVisible(false)}
              style={styles.mapDoneButton}
            />
            {locationLoading && (
              <ActivityIndicator
                style={styles.mapLoading}
                color={Colors.primary}
              />
            )}
            {locationError ? (
              <Text style={styles.mapError}>{locationError}</Text>
            ) : null}
          </View>
        </Modal>
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.bottomBar}>
        <Button
          title={saving ? 'Processing...' : 'Proceed to Checkout'}
          onPress={handleProceed}
          disabled={saving || !location || !address || cart.length === 0}
          style={{ flex: 1 }}
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
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  itemTotal: {
    fontSize: 14,
    color: Colors.accent,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  sellerAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sellerName: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
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
  textarea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  mapButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  mapInfo: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  map: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  mapDoneButton: {
    margin: 20,
    marginTop: 12,
    marginBottom: 28,
  },
  mapLoading: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
  },
  mapError: {
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
  mapCurrentButton: {
    marginHorizontal: 20,
    marginTop: 12,
  },
});
