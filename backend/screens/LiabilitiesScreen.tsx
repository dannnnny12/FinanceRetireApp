import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, KeyboardAvoidingView, Platform,
  SafeAreaView
} from 'react-native';
import { api } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 定義後端支援的正確 Enum 值
type LiabilityType = 'mortgage' | 'car_loan' | 'credit_card' | 'student_loan' | 'other';

type Liability = {
  _id: string;
  name: string;
  type: LiabilityType;
  amount: number;
};

// 顯示用的標籤
const TYPE_LABELS: Record<LiabilityType, string> = {
  mortgage: '房貸',
  car_loan: '車貸',
  credit_card: '卡債',
  student_loan: '學貸',
  other: '其他'
};

// 用於渲染按鈕的陣列
const TYPES: LiabilityType[] = ['mortgage', 'car_loan', 'credit_card', 'student_loan', 'other'];

export default function LiabilitiesScreen() {
  const [items, setItems] = useState<Liability[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<{ name: string; type: LiabilityType; amount: string }>({
    name: '',
    type: 'mortgage',
    amount: ''
  });

  // 1. 取得資料
  const fetchData = useCallback(async () => {
    try {
      const data = await api.listLiabilities();
      setItems(data || []);
    } catch (e: any) {
      console.error('Fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // 2. 新增資料
  const handleAdd = async () => {
    const amountNum = Number(form.amount);
    if (!form.name || isNaN(amountNum) || amountNum <= 0) {
      return Alert.alert('提示', '請填寫正確的名稱與金額');
    }

    try {
      // 送出前將資料整理好
      const payload = {
        name: form.name,
        type: form.type,
        amount: amountNum,
      };

      await api.createLiability(payload);
      
      // 成功後重置並關閉
      setForm({ name: '', type: 'mortgage', amount: '' });
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      // 優化錯誤顯示：嘗試解析後端回傳的具體錯誤訊息 (如：type 格式錯誤)
      const errorDetail = e.response?.data?.message || e.response?.data?.error || e.message;
      Alert.alert('新增失敗', typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail));
      console.log('Add Error Detail:', e.response?.data);
    }
  };

  // 3. 刪除資料
  const handleDelete = (id: string) => {
    Alert.alert('確認刪除', '確定要移除這筆負債紀錄嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除', style: 'destructive',
        onPress: async () => {
          try { 
            await api.deleteLiability(id);
            fetchData(); 
          }
          catch (e: any) { 
            Alert.alert('刪除失敗', e.message); 
          }
        },
      },
    ]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>總負債額度</Text>
        <View style={styles.totalRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.headerTotal}>{totalAmount.toLocaleString()}</Text>
          <Text style={styles.unitText}> 元</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="file-search-outline" size={60} color="#CBD5E1" />
            <Text style={styles.empty}>尚無負債紀錄，點擊下方按鈕新增</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.row} 
            onLongPress={() => handleDelete(item._id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Icon name="bank-minus" size={24} color="#EF4444" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.typeTag}>{TYPE_LABELS[item.type] || item.type}</Text>
            </View>
            <Text style={styles.amount}>-${item.amount.toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新增負債項目</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>債務名稱</Text>
            <TextInput 
              style={styles.input} 
              placeholder="例如：中國信託信用卡"
              value={form.name} 
              onChangeText={(t) => setForm({ ...form, name: t })} 
            />

            <Text style={styles.inputLabel}>分類</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.typeChip, form.type === t && styles.typeChipActive]}
                  onPress={() => setForm({ ...form, type: t })}>
                  <Text style={form.type === t ? styles.typeChipTextActive : styles.typeChipText}>
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>金額 (TWD)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="請輸入負債金額" 
              keyboardType="numeric"
              value={form.amount} 
              onChangeText={(t) => setForm({ ...form, amount: t })} 
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>確認新增項目</Text>
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
    backgroundColor: '#EF4444',
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  headerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline' },
  currencySymbol: { color: 'white', fontSize: 20, fontWeight: '700', marginRight: 4 },
  headerTotal: { color: 'white', fontSize: 36, fontWeight: '800' },
  unitText: { color: 'white', fontSize: 16, opacity: 0.9 },
  listContent: { padding: 16, paddingBottom: 100 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 16, marginBottom: 12, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  iconCircle: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' 
  },
  itemInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  typeTag: { fontSize: 12, color: '#64748B', marginTop: 4, backgroundColor: '#F1F5F9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  amount: { fontSize: 18, fontWeight: '700', color: '#EF4444' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  empty: { color: '#94A3B8', marginTop: 12, fontSize: 15 },
  fab: {
    position: 'absolute', right: 25, bottom: 30, width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: 'white', padding: 24, 
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    minHeight: '60%' 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#475569', marginBottom: 10 },
  input: { 
    backgroundColor: '#F8FAFC', borderRadius: 15, padding: 16, 
    marginBottom: 24, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0' 
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F1F5F9', marginRight: 10, marginBottom: 10,
  },
  typeChipActive: { backgroundColor: '#EF4444' },
  typeChipText: { color: '#475569', fontWeight: '600' },
  typeChipTextActive: { color: 'white', fontWeight: '700' },
  submitBtn: { 
    backgroundColor: '#EF4444', padding: 18, borderRadius: 18, 
    alignItems: 'center', marginTop: 10,
    shadowColor: '#EF4444', shadowOpacity: 0.2, shadowRadius: 10
  },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
});