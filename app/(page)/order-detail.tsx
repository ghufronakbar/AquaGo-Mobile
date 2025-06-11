import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { orderService } from '@/services/api';
import { Order, OrderItem } from '@/models/Entity';
import { Colors } from '@/constants/Colors';
import {
  User,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Calendar,
  Truck,
  Receipt,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';

const statusColors = {
  Pending: Colors.warning,
  Dibayar: Colors.primary,
  Dikirim: Colors.secondary,
  Selesai: Colors.success,
  Dibatalkan: Colors.error,
};

const statusIcons = {
  Pending: <Clock size={18} color={Colors.warning} />,
  Dibayar: <Package size={18} color={Colors.primary} />,
  Dikirim: <Truck size={18} color={Colors.secondary} />,
  Selesai: <CheckCircle size={18} color={Colors.success} />,
  Dibatalkan: <XCircle size={18} color={Colors.error} />,
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchOrder(id as string);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await orderService.getById(orderId);
      setOrder(res.data.data);
    } catch (e) {
      setError('Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (order && order.mtRedirectUrl) {
      router.push({
        pathname: '/(page)/payment',
        params: { id: order.id, url: order.mtRedirectUrl },
      });
    }
  };

  const handleMarkCompleted = async () => {
    if (!order) return;
    try {
      setLoading(true);
      await orderService.markCompleted(order.id);
      fetchOrder(order.id);
    } catch (e) {
      Alert.alert('Failed', 'Could not mark as completed.');
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
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error || 'Order not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detail Order</Text>
        <Text style={styles.subtitle}>Check your past order!</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
            <View style={styles.statusContainer}>
              {statusIcons[order.status]}
              <Text
                style={[
                  styles.status,
                  { color: statusColors[order.status] || Colors.text },
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{order.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
        {/* Status Actions & Info */}
        {order.status === 'Pending' && (
          <View style={styles.statusInfoBox}>
            <Text style={styles.statusInfoText}>
              Please proceed to payment as soon as possible to avoid automatic
              cancellation.
            </Text>
            <View style={{ marginTop: 12 }}>
              <Button
                title="Proceed to Payment"
                onPress={handleProceedToPayment}
              />
            </View>
          </View>
        )}
        {order.status === 'Dibayar' && (
          <View style={styles.statusInfoBox}>
            <Text style={styles.statusInfoText}>
              Waiting for shipping by seller. Please be patient while your order
              is being processed.
            </Text>
          </View>
        )}
        {order.status === 'Dikirim' && (
          <View style={styles.statusInfoBox}>
            <Text style={styles.statusInfoText}>
              Your order has been shipped! Mark as completed if you have
              received your order.
            </Text>
            <View style={{ marginTop: 12 }}>
              <Button title="Mark as Completed" onPress={handleMarkCompleted} />
            </View>
          </View>
        )}
        {order.status === 'Selesai' && (
          <View style={styles.statusInfoBox}>
            <Text style={styles.statusInfoText}>
              This order is completed. Thank you for shopping with us!
            </Text>
          </View>
        )}
        {order.status === 'Dibatalkan' && (
          <View style={styles.statusInfoBox}>
            <Text style={styles.statusInfoText}>
              This order has been cancelled.
            </Text>
          </View>
        )}
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.orderItems.map((item: OrderItem) => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{
                uri:
                  item.product?.images?.[0] ||
                  'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg',
              }}
              style={styles.productImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.productName}>{item.product?.name}</Text>
              <Text style={styles.productPrice}>
                Rp {item.pricePerItem?.toLocaleString()}{' '}
                <Text style={styles.productQuantity}>
                  x {item.quantity} Item
                </Text>
              </Text>
              <Text style={styles.itemTotal}>
                Total: Rp {(item.pricePerItem * item.quantity).toLocaleString()}
              </Text>
              <View style={styles.sellerRow}>
                {item.product?.user?.picture ? (
                  <Image
                    source={{ uri: item.product.user.picture }}
                    style={styles.sellerAvatar}
                  />
                ) : (
                  <View style={styles.sellerAvatarPlaceholder}>
                    <User size={18} color={Colors.primary} />
                  </View>
                )}
                <Text style={styles.sellerName}>
                  {item.product?.user?.name}
                </Text>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.totalCard}>
          <Receipt
            size={20}
            color={Colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            Rp {order.total?.toLocaleString()}
          </Text>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    height: 100,
  },
  productImage: {
    width: 80,
    height: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  productQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  itemTotal: {
    fontSize: 14,
    color: Colors.accent,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sellerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  sellerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sellerName: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    fontFamily: 'Inter-SemiBold',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginRight: 8,
  },
  totalValue: {
    fontSize: 20,
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
  headerTitle: {
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
  statusInfoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: -8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  statusInfoText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
});
