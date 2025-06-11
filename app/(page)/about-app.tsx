import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Droplets, Info, CheckCircle, ShieldCheck } from 'lucide-react-native';

export default function AboutAppScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoBox}>
          <Droplets size={48} color={Colors.primary} />
          <Text style={styles.appName}>AquaGo</Text>
        </View>
        <Text style={styles.slogan}>Air Bersih, Antar Cepat</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Misi Kami</Text>
          <Text style={styles.sectionText}>
            AquaGo berkomitmen untuk membuat air bersih dan segar dapat diakses
            semua orang, kapan saja dan di mana saja. Kami menghubungkan kamu
            dengan penjual terpercaya dan mengantar air langsung ke rumahmu
            hanya dengan beberapa sentuhan.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <View style={styles.featureRow}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.featureText}>
              Mudah mencari produk dan melakukan pemesanan
            </Text>
          </View>
          <View style={styles.featureRow}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.featureText}>
              Lacak pesanan secara real-time & dapat notifikasi
            </Text>
          </View>
          <View style={styles.featureRow}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.featureText}>
              Pembayaran aman & perlindungan data
            </Text>
          </View>
          <View style={styles.featureRow}>
            <ShieldCheck size={20} color={Colors.primary} />
            <Text style={styles.featureText}>
              Penjual terpercaya & kualitas terjamin
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info Versi</Text>
          <View style={styles.versionRow}>
            <Info size={18} color={Colors.textSecondary} />
            <Text style={styles.versionText}>AquaGo v1.0.0</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dibuat dengan ❤️ di Indonesia</Text>
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
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  slogan: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
});
