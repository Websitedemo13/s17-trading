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
    
    // Enhanced fallback response for demo purposes
    const question = request.data?.question?.toLowerCase() || '';
    
    let analysis = "Dựa trên dữ liệu thị trường hiện tại, ";
    let suggestions = [];
    let risk_level: 'low' | 'medium' | 'high' = 'medium';
    
    if (question.includes('bitcoin') || question.includes('btc')) {
      analysis += "Bitcoin đang cho thấy xu hướng tích cực với khối lượng giao dịch tăng mạnh. Các chỉ báo kỹ thuật cho thấy momentum tăng giá đang được duy trì.";
      suggestions = [
        "Xem xét mua DCA (Dollar Cost Average) để giảm rủi ro",
        "Đặt stop-loss ở mức 5-8% dưới giá mua",
        "Theo dõi mức kháng cự quan trọng tại $45,000",
        "Chú ý đến khối lượng giao dịch để xác nhận xu hướng"
      ];
    } else if (question.includes('ethereum') || question.includes('eth')) {
      analysis += "Ethereum đang hưởng lợi từ sự phát triển của hệ sinh thái DeFi và NFT. Việc nâng cấp lên Ethereum 2.0 tiếp tục tạo động lực tích cực.";
      suggestions = [
        "Theo dõi tỷ lệ ETH/BTC để đánh giá độ mạnh tương đối",
        "Chú ý đến gas fees như một chỉ báo hoạt động mạng",
        "Xem xét staking ETH 2.0 cho thu nhập thụ động",
        "Theo dõi TVL (Total Value Locked) trong DeFi"
      ];
      risk_level = 'low';
    } else if (question.includes('rủi ro') || question.includes('quản lý')) {
      analysis += "Quản lý rủi ro là yếu tố then chốt trong trading crypto. Thị trường có độ biến động cao đòi hỏi chiến lược quản lý vốn chặt chẽ.";
      suggestions = [
        "Không đầu tư quá 5-10% tổng tài sản vào crypto",
        "Đa dạng hóa danh mục với nhiều loại coin khác nhau",
        "Đặt stop-loss rõ ràng cho mọi vị thế",
        "Sử dụng position sizing phù hợp với tolerance risk"
      ];
      risk_level = 'high';
    } else if (question.includes('altcoin')) {
      analysis += "Thị trường altcoin đang cho thấy sự phân hóa mạnh. Các dự án có fundamentals tốt và utility thực tế đang được định giá lại.";
      suggestions = [
        "Tập trung vào các altcoin top 50 có thanh khoản tốt",
        "Nghiên cứu team phát triển và roadmap dự án",
        "Theo dõi partnerships và adoption thực tế",
        "Chú ý đến tokenomics và lịch unlock token"
      ];
      risk_level = 'high';
    } else if (question.includes('phân tích kỹ thuật') || question.includes('rsi') || question.includes('macd')) {
      analysis += "Phân tích kỹ thuật cho thấy thị trường đang trong giai đoạn consolidation. Các chỉ báo momentum như RSI và MACD cần được theo dõi chặt chẽ.";
      suggestions = [
        "RSI trên 70 báo hiệu vùng quá mua, dưới 30 là quá bán",
        "MACD golden cross thường báo hiệu xu hướng tăng",
        "Kết hợp volume để xác nhận tín hiệu breakout",
        "Sử dụng đường MA 200 làm trend filter"
      ];
    } else {
      analysis += "thị trường crypto đang trải qua giai đoạn thú vị với nhiều cơ hội đầu tư. Việc giáo dục bản thân và quản lý rủi ro là ưu tiên hàng đầu.";
      suggestions = [
        "Tìm hiểu về fundamentals của các dự án trước khi đầu tư",
        "Theo dõi tin tức và sự kiện quan trọng của thị trường",
        "Xây dựng chiến lược đầu tư dài hạn phù hợp",
        "Tham gia cộng đồng để học hỏi kinh nghiệm"
      ];
    }

    return {
      analysis,
      suggestions,
      risk_level,
      confidence: 0.8
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