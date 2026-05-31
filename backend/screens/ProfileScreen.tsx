// screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
  const isLoggedIn = false; // 這裡未來接你的 Auth 狀態

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 使用者頂部區塊 */}
        <View style={styles.header}>
          <Icon name="account-circle" size={80} color="#cbd5e1" />
          {isLoggedIn ? (
            <View>
              <Text style={styles.userName}>Chih-Ming Chung</Text>
              <Text style={styles.userEmail}>user@example.com</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>登入 / 註冊</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 功能列表 */}
        <View style={styles.menuSection}>
          <MenuItem icon="shield-check-outline" label="帳號安全" />
          <MenuItem icon="bell-outline" label="通知設定" />
          <MenuItem icon="database-export-outline" label="匯出資料 (CSV)" />
          <MenuItem icon="help-circle-outline" label="幫助與支援" />
          <MenuItem icon="logout" label="登出" color="#ef4444" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, label, color = '#334155' }: any) => (
  <TouchableOpacity style={styles.menuItem}>
    <Icon name={icon} size={24} color={color} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    <Icon name="chevron-right" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginVertical: 30, gap: 12 },
  userName: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b' },
  loginBtn: { backgroundColor: '#1e3a8a', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  loginBtnText: { color: '#fff', fontWeight: 'bold' },
  menuSection: { backgroundColor: '#fff', borderRadius: 20, padding: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' }
});