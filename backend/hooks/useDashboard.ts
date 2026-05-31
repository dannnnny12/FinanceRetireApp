import { useCallback, useEffect, useState } from 'react';
import { api, DashboardDTO } from '../services/api';

// 擴充 DashboardDTO 的類型定義，確保 TypeScript 知道有這個欄位
interface EnhancedDashboardDTO extends DashboardDTO {
  liabilitiesDetail?: any[];
}

export function useDashboard() {
  const [data, setData] = useState<EnhancedDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 修正：同時抓取 Dashboard 總覽與 負債明細
      const [dashboardData, liabilitiesList] = await Promise.all([
        api.getDashboard(),
        fetch('http://127.0.0.1:3000/liabilities').then(res => res.json())
      ]);

      // 將明細資料整合進 data 物件中
      setData({
        ...dashboardData,
        liabilitiesDetail: liabilitiesList 
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}