import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, KeyboardAvoidingView, Platform,
  SafeAreaView
} from 'react-native';
import { api } from '../services/api';
// 引入圖示
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Asset = {
  _id: string;
  name: string;
  type: 'stock' | 'etf' | 'bond' | 'cash' | 'deposit' | 'crypto' | 'other';
  quantity: number;
  price: number;
  symbol?: string;
  currency?: string;
};

const TYPE_LABELS: Record<Asset['type'], string> = {
  stock: '股票', etf: 'ETF', bond: '債券', cash: '現金',
  deposit: '定存', crypto: '虛擬貨幣', other: '其他'
};

const ASSET_TYPES: Asset['type'][] = ['stock', 'etf', 'bond', 'cash', 'deposit', 'crypto', 'other'];

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'stock' as Asset['type'],
    quantity: '',
    price: '',
    symbol: '',
  });

  const fetchAssets = useCallback(async () => {
    try {
      const data = await api.listAssets();
      setAssets(data || []);
    } catch (e: any) {
      console.error('Fetch error:', e);
    }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssets();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    const qty = Number(form.quantity);
    const prc = Number(form.price);
    
    if (!form.name || isNaN(qty) || isNaN(prc)) {
      Alert.alert('提示', '請填寫完整且正確的資料');
      return;
    }

    try {
      // 依據你的 api.ts 定義補齊欄位
      await api.createAsset({
        name: form.name,
        type: form.type,
        quantity: qty,
        price: prc,
        symbol: form.symbol || '',
        currency: 'TWD', // 預設幣別
      });
      
      setForm({ name: '', type: 'stock', quantity: '', price: '', symbol: '' });
      setModalVisible(false);
      fetchAssets();
    } catch (e: any) {
      Alert.alert('新增失敗', e.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('確認刪除', '確定要刪除此資產嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => {
          try {
            await api.deleteAsset(id);
            fetchAssets();
          } catch (e: any) { Alert.alert('刪除失敗', e.message); }
        },
      },
    ]);
  };

  const totalValue = (item: Asset) => item.quantity * item.price;
  const grandTotal = assets.reduce((sum, item) => sum + totalValue(item), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* 總額概覽卡片 */}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>資產總市值</Text>
        <Text style={styles.headerTotal}>$ {grandTotal.toLocaleString()}</Text>
      </View>

      <FlatList
        data={assets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>尚無資產，點擊下方按鈕新增</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onLongPress={() => handleDelete(item._id)}>
            <View style={styles.iconCircle}>
              <Icon name={item.type === 'stock' ? 'trending-up' : 'wallet-outline'} size={24} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{TYPE_LABELS[item.type]}</Text>
              <Text style={styles.detail}>
                {item.quantity} 單位 @ ${item.price.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.amount}>${totalValue(item).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新增資產</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="名稱（如 台積電）"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />

            <TextInput
              style={styles.input}
              placeholder="代號（可選，如 2330）"
              value={form.symbol}
              onChangeText={(t) => setForm({ ...form, symbol: t })}
            />

            <View style={styles.typeRow}>
              {ASSET_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, form.type === t && styles.typeChipActive]}
                  onPress={() => setForm({ ...form, type: t })}
                >
                  <Text style={form.type === t ? styles.typeChipTextActive : styles.typeChipText}>
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="持有數量"
                keyboardType="numeric"
                value={form.quantity}
                onChangeText={(t) => setForm({ ...form, quantity: t })}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="現價 / 成本"
                keyboardType="decimal-pad"
                value={form.price}
                onChangeText={(t) => setForm({ ...form, price: t })}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>確認新增資產</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerCard: {
    backgroundColor: '#10B981', padding: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#10B981', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  headerLabel: { color: 'white', opacity: 0.8, fontSize: 14, marginBottom: 5 },
  headerTotal: { color: 'white', fontSize: 32, fontWeight: '800' },
  listContent: { paddingBottom: 100 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginTop: 10,
    borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  iconCircle: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' 
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  type: { fontSize: 12, color: '#64748B', marginTop: 2 },
  detail: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  amount: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  empty: { textAlign: 'center', marginTop: 60, color: '#94A3B8' },
  fab: {
    position: 'absolute', right: 24, bottom: 32,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  input: {
    backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16,
  },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  inputHalf: { flex: 1, marginRight: 8, marginBottom: 0 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#F1F5F9', marginRight: 8, marginBottom: 10,
  },
  typeChipActive: { backgroundColor: '#10B981' },
  typeChipText: { color: '#475569' },
  typeChipTextActive: { color: 'white', fontWeight: '700' },
  submitBtn: { 
    backgroundColor: '#10B981', padding: 16, borderRadius: 12, 
    alignItems: 'center', marginTop: 10 
  },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});