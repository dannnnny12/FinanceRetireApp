import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, RefreshControl, ScrollView,
  TouchableOpacity, ActivityIndicator, Dimensions,
  TextInput, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDashboard } from '../hooks/useDashboard';
import { fmtMoney } from '../utils/format'; 
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from "react-native-gifted-charts";
import { api } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { data, loading, error, refresh } = useDashboard();
  
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}><ActivityIndicator size="large" color="#0F172A" /></View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}><Text style={{ color: 'red' }}>API 錯誤: {error}</Text></View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const handleUpdateGoal = async () => {
    // 將字串轉為數字
    const goalNum = parseFloat(tempGoal);
    
    if (isNaN(goalNum) || goalNum <= 0) {
      Alert.alert("錯誤", "請輸入有效的金額");
      return;
    }

    try {
      // 1. 呼叫 api.ts 中定義的 updateGoal
      // 根據你的 api 定義，這會發送 PUT 請求到 /dashboard/goal
      await api.updateGoal(goalNum);

      // 2. 成功後關閉 Modal
      setGoalModalVisible(false);
      
      // 3. 立即刷新畫面資料，這樣 ProgressCard 就會顯示新的進度
      await refresh(); 
      
      Alert.alert("成功", "退休目標已更新");
    } catch (e: any) {
      console.error(e);
      Alert.alert("更新失敗", e.message || "請檢查網路連線");
    }
  };
  /**
   * 計算預計達標月份
   * @param currentAssets 目前資產
   * @param goal 退休目標
   * @param monthlyContribution 每月固定投入 (假設 30,000)
   * @param annualReturnRate 年化報酬率 (例如 0.07 代表 7%)
   */
  const calculateMonthsToGoal = (currentAssets: number, goal: number, monthlyContribution: number, annualReturnRate: number) => {
    if (currentAssets >= goal) return 0;

    const monthlyRate = annualReturnRate / 12;
    
    // 若完全沒有報酬率，回歸簡單除法
    if (monthlyRate === 0) {
      return Math.ceil((goal - currentAssets) / monthlyContribution);
    }

    // 複利公式：n = log((FV*r + P) / (PV*r + P)) / log(1 + r)
    // FV: 目標, PV: 現值, P: 每月投入, r: 月利率
    const numerator = Math.log((goal * monthlyRate + monthlyContribution) / (currentAssets * monthlyRate + monthlyContribution));
    const denominator = Math.log(1 + monthlyRate);
    
    return Math.ceil(numerator / denominator);
  };
  
  const ProgressCard = () => {
    // 設定計算參數 (未來可以移至設定頁面或由 API 取得)
    const ANNUAL_RETURN_RATE = 0.10; // 7% 年化報酬率
    const MONTHLY_SAVINGS = 100000;   // 每月預計儲蓄額
    
    const remainingMonths = calculateMonthsToGoal(
      data.totalAssets,
      data.retirementGoal,
      MONTHLY_SAVINGS,
      ANNUAL_RETURN_RATE
    );

    const years = Math.floor(remainingMonths / 12);
    const months = remainingMonths % 12;

    return (
      <View style={styles.retireCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.retireTitle}>退休儲蓄進度</Text>
          <Icon name="information-outline" size={16} color="#94a3b8" style={{ marginLeft: 4 }} />
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AnimatedCircularProgress
            size={100} width={10} fill={data.progressPercent || 0}
            tintColor="#10b981" backgroundColor="#e2e8f0" lineCap="round" rotation={0}
          >
            {fill => <Text style={styles.progressPct}>{fill.toFixed(2)}%</Text>}
          </AnimatedCircularProgress>
          
          <View style={styles.retireInfoArea}>
            <Text style={styles.labelSmall}>預計達標時間 (複利 7% 估算)</Text>
            <Text style={[styles.moneyValue, { color: '#1e3a8a', fontWeight: '700' }]}>
              約 <Text style={styles.moneyBig}>{years}</Text> 年 <Text style={styles.moneyBig}>{months}</Text> 個月
            </Text>
            
            <View style={styles.goalEditRow}>
              <Text style={styles.metaLabel}>目標 {fmtMoney(data.retirementGoal)} 元</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
                  <Icon name="pencil-outline" size={12} color="#3b82f6" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.labelSmall, { marginTop: 4, fontSize: 10, color: '#cbd5e1' }]}>
              假設每月投入 {fmtMoney(MONTHLY_SAVINGS)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const AllocationChartCard = () => {
  // 準備圖表資料，根據 data.allocation 轉換
    const chartData = [
      { value: data.allocation?.stock || 0, color: '#3b82f6', text: '股票' },
      { value: data.allocation?.deposit || 0, color: '#f59e0b', text: '存款' },
      { value: data.allocation?.cash || 0, color: '#10b981', text: '現金' },
    ].filter(item => item.value > 0);

    return (
      <View style={styles.chartCard}>
        <Text style={styles.detailTitle}>資產配置分析</Text>
        <View style={styles.chartRow}>
          <PieChart
            data={chartData}
            donut
            showGradient
            sectionAutoFocus
            radius={70}
            innerRadius={55}
            innerCircleColor={'#ffffff'}
            centerLabelComponent={() => (
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 12, color: '#94a3b8'}}>總資產</Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1e293b'}}>
                  {Math.round(data.totalAssets / 10000)}萬
                </Text>
              </View>
            )}
          />
          <View style={styles.chartLegend}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: item.color}]} />
                <Text style={styles.legendText}>{item.text}</Text>
                <Text style={styles.legendValue}>
                  {((item.value / data.totalAssets) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const FinancialCard = ({ label, value, color, change }: any) => (
    <View style={[styles.finSmallCard, { width: CARD_WIDTH }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.retireTitle}>{label}</Text>
        <Icon name="help-circle-outline" size={14} color="#94a3b8" style={{ marginLeft: 4 }} />
      </View>
      <Text style={[styles.finCardAmount, { color }]}>{fmtMoney(value)} <Text style={{fontSize:11}}>元</Text></Text>
      <View style={styles.changeRow}>
        <Text style={styles.labelSmall}>較上月 </Text>
        <Text style={{ color: change.includes('+') ? '#10b981' : '#ef4444', fontWeight: '600', fontSize: 13 }}>{change}</Text>
      </View>
    </View>
  );

  const NetWorthCard = () => (
    <View style={styles.netWorthCard}>
      <View style={styles.netWorthLeft}>
        <Text style={styles.netWorthLabel}>淨資產</Text>
        <Text style={styles.netWorthValue}>{fmtMoney(data.totalAssets - data.totalLiabilities)} <Text style={{fontSize:12}}>元</Text></Text>
      </View>
      <View style={styles.netWorthRight}>
        <View style={{alignItems: 'flex-end', marginRight: 10}}>
           <Text style={styles.labelSmall}>較上月 </Text>
           <Text style={styles.netChangeText}>+4.3% ↗</Text>
        </View>
        <Icon name="scale-balance" size={24} color="#94a3b8" />
      </View>
    </View>
  );
  
  const DetailsList = () => {
      let detailItems = [];

      if (activeTab === 'assets') {
        detailItems = Object.entries(data.allocation || {}).map(([key, val]: any) => ({
          label: key === 'stock' ? '股票' : (key === 'deposit' ? '存款' : key),
          value: val,
          pct: ((val / (data.totalAssets || 1)) * 100).toFixed(1),
          icon: key === 'stock' ? 'chart-line' : 'currency-usd',
          color: key === 'stock' ? '#3b82f6' : '#f59e0b'
        }));
      } else {
        // 修正 1：直接處理陣列資料，並處理單位換算
        // 如果你的 data.totalLiabilities 單位是「萬」，則項目金額也要除以 10000
        const rawLiabilities = Array.isArray(data.liabilitiesDetail) ? data.liabilitiesDetail : [];
        
        detailItems = rawLiabilities.map((item: any) => {
          const amountInWan = item.amount;
          return {
            label: item.name || '未命名',
            value: amountInWan,
            // 修正 2：計算百分比，確保分母單位一致
            pct: (data.totalLiabilities > 0) 
              ? ((amountInWan / data.totalLiabilities) * 100).toFixed(1) 
              : "0.0",
            icon: 'bank',
            color: '#ef4444'
          };
        });
      }

      return (
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>資產與負債明細</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => navigation.navigate(activeTab === 'assets' ? 'Assets' : 'Liabilities')}
            >
              <Icon name="plus" size={16} color="#fff" />
              <Text style={styles.addBtnText}>新增項目</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'assets' && styles.tabItemActive]}
              onPress={() => setActiveTab('assets')}
            >
              <Text style={[styles.tabText, activeTab === 'assets' && styles.tabTextActive]}>資產</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'liabilities' && styles.tabItemActive]}
              onPress={() => setActiveTab('liabilities')}
            >
              <Text style={[styles.tabText, activeTab === 'liabilities' && styles.tabTextActive]}>負債</Text>
            </TouchableOpacity>
          </View>

          {detailItems.length > 0 ? (
            detailItems.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.listIcon, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.listContent}>
                  <View style={styles.listTopRow}>
                    <Text style={styles.itemName}>{item.label}</Text>
                    <Text style={styles.itemValue}>{fmtMoney(item.value)} <Text style={styles.labelSmall}>元</Text></Text>
                    <Text style={styles.itemPct}>{item.pct}%</Text>
                    <Icon name="chevron-right" size={20} color="#cbd5e1" />
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${item.pct}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.labelSmall}>暫無資料</Text>
            </View>
          )}
        </View>
      );
    };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topNav}>
          <Icon name="menu" size={26} color="#334155" />
          <Text style={styles.navTitle}>我的退休計畫</Text>
          <Icon name="bell-outline" size={26} color="#334155" />
      </View>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <ProgressCard />
        <View style={styles.finRow}>
          <FinancialCard label="總資產" value={data.totalAssets} color="#10b981" change="+3.2% ↗" />
          <FinancialCard label="總負債" value={data.totalLiabilities} color="#ef4444" change="-1.1% ↘" />
        </View>
        <NetWorthCard />
        <AllocationChartCard />
        <DetailsList />

        <Modal visible={isGoalModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>修改退休目標金額</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                value={tempGoal}
                onChangeText={setTempGoal}
                autoFocus
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={styles.cancelBtn}><Text>取消</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleUpdateGoal} style={styles.confirmBtn}><Text style={{color:'#fff', fontWeight:'600'}}>確認修改</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, gap: 12, paddingBottom: 30 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 13, height: 44,paddingTop: 4, paddingBottom: 8,marginTop: -60,},
  navTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', letterSpacing: 0.5, },
  retireCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  retireTitle: { fontSize: 14, fontWeight: '600', color: '#475569' },
  retireContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressPct: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  retireInfoArea: { flex: 1, marginLeft: 20 },
  labelSmall: { fontSize: 11, color: '#94a3b8' },
  moneyValue: { fontSize: 15, color: '#1e293b', marginTop: 4 },
  moneyBig: { fontSize: 22, fontWeight: '800' },
  metaLabel: { fontSize: 11, color: '#94a3b8' },
  goalEditRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  finRow: { flexDirection: 'row', justifyContent: 'space-between' },
  finSmallCard: { backgroundColor: '#fff', borderRadius: 20, padding: 14 },
  finCardAmount: { fontSize: 17, fontWeight: '800', marginVertical: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center' },
  netWorthCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netWorthLeft: { flex: 1 },
  netWorthRight: { flexDirection: 'row', alignItems: 'center' },
  netWorthLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  netWorthValue: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', marginTop: 2 },
  netChangeText: { color: '#10b981', fontWeight: '600', fontSize: 13 },
  detailSection: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  detailTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  addBtn: { backgroundColor: '#1e3a8a', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#fff', marginLeft: 4, fontWeight: '600', fontSize: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 3, marginBottom: 16 },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabItemActive: { backgroundColor: '#1e3a8a' },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  listItem: { flexDirection: 'row', marginBottom: 16 },
  listIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  listContent: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  listTopRow: { flexDirection: 'row', alignItems: 'center' },
  itemName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },
  itemValue: { fontWeight: '700', marginRight: 4, fontSize: 14 },
  itemPct: { color: '#94a3b8', width: 40, textAlign: 'right', fontSize: 12 },
  progressBg: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 2 },
  emptyState: { padding: 20, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingVertical: 6, fontSize: 18, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: 8 },
  confirmBtn: { backgroundColor: '#1e3a8a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  chartLegend: {
    flex: 1,
    marginLeft: 20,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
});