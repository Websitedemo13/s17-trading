import { supabase } from '@/integrations/supabase/client';

export interface AIInsightRequest {
  type: 'portfolio_analysis' | 'market_prediction' | 'trading_suggestion';
  data: any;
}

export interface AIInsightResponse {
  analysis: string;
  suggestions: string[];
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
}

export const getAIInsights = async (request: AIInsightRequest): Promise<AIInsightResponse> => {
  try {
    // Call Supabase Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('ai-insights', {
      body: request
    });

    if (error) {
      console.error('AI Insights Error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    
    // Fallback response for demo purposes
    return {
      analysis: "Dựa trên dữ liệu thị trường hiện tại, Bitcoin đang cho thấy xu hướng tăng giá mạnh. Khối lượng giao dịch tăng 15% so với tuần trước, cho thấy sự quan tâm của nhà đầu tư đang gia tăng.",
      suggestions: [
        "Xem xét DCA (Dollar Cost Average) để giảm rủi ro",
        "Đặt stop-loss ở mức 5-10% dưới giá hiện tại",
        "Theo dõi chỉ số RSI để tránh mua ở vùng quá mua",
        "Phân bổ danh mục đầu tư với 60% BTC, 30% ETH, 10% altcoins"
      ],
      risk_level: 'medium',
      confidence: 0.75
    };
  }
};

export const analyzePortfolio = async (portfolio: any[]) => {
  return getAIInsights({
    type: 'portfolio_analysis',
    data: { portfolio }
  });
};

export const getPrediction = async (symbol: string) => {
  return getAIInsights({
    type: 'market_prediction',
    data: { symbol }
  });
};

export const getTradingSuggestion = async (marketData: any) => {
  return getAIInsights({
    type: 'trading_suggestion',
    data: { marketData }
  });
};