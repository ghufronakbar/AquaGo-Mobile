import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { orderService } from '@/services/api';
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Calendar,
  Truck,
} from 'lucide-react-native';
import { Order } from '@/models/Entity';
import { router } from 'expo-router';

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'Pending':
      return <Clock size={20} color={Colors.warning} />;
    case 'Dibayar':
      return <Package size={20} color={Colors.primary} />;
    case 'Dikirim':
      return <Truck size={20} color={Colors.secondary} />;
    case 'Selesai':
      return <CheckCircle size={20} color={Colors.success} />;
    case 'Dibatalkan':
      return <XCircle size={20} color={Colors.error} />;
    default:
      return <Clock size={20} color={Colors.textSecondary} />;
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Pending':
      return Colors.warning;
    case 'Dibayar':
      return Colors.primary;
    case 'Dikirim':
      return Colors.secondary;
    case 'Selesai':
      return Colors.success;
    case 'Dibatalkan':
      return Colors.error;
    default:
      return Colors.textSecondary;
  }
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data.data);
    } catch (error) {
      console.log('Orders loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleCompleteOrder = async (orderId: string) => {
    Alert.alert(
      'Selesaikan Pesanan',
      'Apakah Anda yakin ingin menandai pesanan ini sebagai selesai?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Selesai',
          onPress: async () => {
            try {
              setLoading(true);
              await orderService.markCompleted(orderId);
              loadOrders();
            } catch (error) {
              Alert.alert('Kesalahan', 'Gagal menyelesaikan pesanan');
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Batalkan Pesanan',
      'Anda yakin ingin membatalkan pesanan ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await orderService.cancel(orderId);
              loadOrders();
            } catch (error) {
              Alert.alert('Kesalahan', 'Gagal membatalkan pesanan');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pesanan Saya</Text>
        <Text style={styles.subtitle}>Lacak pengiriman air Anda</Text>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() =>
              router.push({
                pathname: '/(page)/order-detail',
                params: {
                  id: order.id,
                },
              })
            }
          >
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>
                  Pesanan #{order.id?.slice(0, 8)}
                </Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(order.status)}
                  <Text
                    style={[
                      styles.orderStatus,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderTotal}>
                Rp {order.total?.toLocaleString()}
              </Text>
            </View>

            {/* Order Details */}
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {order.location}
                </Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {order.orderItems?.map((item: any, index: number) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemName}>
                    {item.product?.name || 'Produk'}
                  </Text>
                  <Text style={styles.itemQuantity}>{item.quantity} x</Text>
                  <Text style={styles.itemTotal}>
                    Total: Rp{' '}
                    {(item.pricePerItem * item.quantity).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Order Actions */}
            {order.status === 'Dikirim' && (
              <View style={styles.orderActions}>
                <Button
                  title="Tandai Selesai"
                  onPress={() => handleCompleteOrder(order.id)}
                  variant="primary"
                  size="small"
                />
              </View>
            )}

            {order.status === 'Pending' && (
              <View style={styles.orderActions}>
                <Button
                  title="Batalkan Pesanan"
                  onPress={() => handleCancelOrder(order.id)}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>Belum ada pesanan</Text>
            <Text style={styles.emptySubtext}>
              Pesanan Anda akan muncul di sini setelah Anda melakukan pemesanan
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  itemTotal: {
    fontSize: 14,
    color: Colors.accent,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
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
