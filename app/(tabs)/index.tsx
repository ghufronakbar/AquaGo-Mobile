import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { userService, productService } from '@/services/api';
import {
  Droplets,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  TrendingUp,
  CalendarArrowDown,
} from 'lucide-react-native';
import { Overview, Product } from '@/models/Entity';

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [overview, setOverview] = useState<Overview>({
    completedOrders: 0,
    pendingOrders: 0,
    waitingOrders: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load recent orders and popular products
      const [productsResponse, overviewResponse] = await Promise.all([
        productService.getAll(),
        userService.getDashboard(),
      ]);

      setPopularProducts(productsResponse.data.data.slice(0, 3));
      setOverview(overviewResponse.data.data);
    } catch (error) {
      console.log('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Halo, {user?.name}!</Text>
              <Text style={styles.subtitle}>
                Siap untuk pemesanan air bersih?
              </Text>
            </View>
            <View style={styles.logo}>
              <Droplets size={24} color="white" />
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/products')}
            >
              <Package size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Lihat Produk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/orders')}
            >
              <ShoppingBag size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Pesanan Saya</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produk Populer</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productList}>
              {popularProducts.map((product) => (
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
                        product?.images?.[0] ||
                        'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg',
                    }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    Rp {product.price?.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas Anda</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={24} color={Colors.warning} />
              <Text style={styles.statNumber}>{overview.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pesanan Pending</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={24} color={Colors.success} />
              <Text style={styles.statNumber}>{overview.completedOrders}</Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>
            <View style={styles.statCard}>
              <CalendarArrowDown size={24} color={Colors.primary} />
              <Text style={styles.statNumber}>{overview.waitingOrders}</Text>
              <Text style={styles.statLabel}>Menunggu Pengiriman</Text>
            </View>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Inter-Bold',
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  productList: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
  },
  productCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  productPrice: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
