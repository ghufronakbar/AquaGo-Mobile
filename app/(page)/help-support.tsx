import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Mail, Phone, HelpCircle, MessageCircle } from 'lucide-react-native';

export default function HelpSupportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bantuan & Dukungan</Text>
        <Text style={styles.subtitle}>
          Kami siap membantu kebutuhan kamu di AquaGo!
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontak Kami</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@aquago.com')}
          >
            <Mail size={20} color={Colors.primary} />
            <Text style={styles.contactText}>support@aquago.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:+6281234567890')}
          >
            <Phone size={20} color={Colors.primary} />
            <Text style={styles.contactText}>+62 812-3456-7890</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Pertanyaan yang Sering Diajukan
          </Text>
          <View style={styles.faqItem}>
            <HelpCircle
              size={18}
              color={Colors.accent}
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.faqQ}>
                Bagaimana cara melakukan pemesanan?
              </Text>
              <Text style={styles.faqA}>
                Telusuri produk, tambahkan ke keranjang, lalu lanjutkan ke
                checkout. Pilih lokasi pengiriman dan metode pembayaran untuk
                menyelesaikan pesanan.
              </Text>
            </View>
          </View>
          <View style={styles.faqItem}>
            <HelpCircle
              size={18}
              color={Colors.accent}
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.faqQ}>
                Bagaimana saya bisa melacak pesanan?
              </Text>
              <Text style={styles.faqA}>
                Buka menu Pesanan untuk melihat status dan detail pesanan. Kamu
                akan mendapat notifikasi saat pesanan dikirim atau selesai.
              </Text>
            </View>
          </View>
          <View style={styles.faqItem}>
            <HelpCircle
              size={18}
              color={Colors.accent}
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.faqQ}>
                Bagaimana jika ada masalah dengan pesanan saya?
              </Text>
              <Text style={styles.faqA}>
                Hubungi tim dukungan kami melalui email atau telepon. Kami siap
                membantu menyelesaikan masalah dengan cepat.
              </Text>
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  faqA: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
});
