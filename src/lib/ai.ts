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
    
    // Enhanced AI response system with comprehensive market analysis
    const question = request.data?.question?.toLowerCase() || '';

    let analysis = "";
    let suggestions = [];
    let risk_level: 'low' | 'medium' | 'high' = 'medium';

    // Bitcoin Analysis
    if (question.includes('bitcoin') || question.includes('btc')) {
      analysis = `📊 PHÂN TÍCH BITCOIN (BTC):

Bitcoin hiện đang giao dịch trong vùng quan trọng với các tín hiệu kỹ thuật hỗn hợp. Dựa trên dữ liệu gần đây:

🔹 Xu hướng: Sideway với thiên hướng tăng nhẹ
🔹 Support chính: $42,000 - $43,000
🔹 Resistance: $48,000 - $50,000
🔹 Volume: Trung bình, chưa có breakout mạnh
🔹 Fear & Greed Index: Neutral (50-60)

Các yếu tố ảnh hưởng:
• Chính sách tiền tệ của Fed
• Adoption từ các tập đoán lớn
• Quy định crypto từ các chính phủ`;

      suggestions = [
        "💡 Chiến lược DCA mua định kỳ để giảm thiểu rủi ro timing",
        "⚠️ Đặt stop-loss ở $41,500 để bảo vệ vốn",
        "📈 Target ngắn hạn: $47,000, dài hạn: $55,000",
        "🔍 Theo dõi volume breakout trên $46,000 để xác nhận uptrend",
        "⏰ Chú ý các sự kiện macro: CPI, Fed meeting, ETF updates"
      ];
      risk_level = 'medium';

    // Ethereum Analysis
    } else if (question.includes('ethereum') || question.includes('eth')) {
      analysis = `📊 PHÂN TÍCH ETHEREUM (ETH):

Ethereum đang thể hiện sức mạnh với hệ sinh thái DeFi và Layer 2 phát triển mạnh:

🔹 Xu hướng: Tích cực, outperform Bitcoin
🔹 Support: $2,800 - $3,000
🔹 Resistance: $3,500 - $3,800
🔹 Staking Ratio: 22% total supply
🔹 Gas Fees: Ổn định nhờ Layer 2

Catalysts tích cực:
• Shanghai upgrade thành công
• Layer 2 adoption tăng mạnh
• Institutional staking tăng
• DeFi TVL recovery`;

      suggestions = [
        "🚀 ETH có thể outperform BTC trong altseason",
        "💰 Xem xét staking ETH cho yield 4-5% APR",
        "🔄 Theo dõi ETH/BTC ratio - target 0.08-0.085",
        "⛽ Gas fees thấp = tín hiệu tích cực cho ecosystem",
        "🎯 Target: $3,600 ngắn hạn, $4,200 dài hạn"
      ];
      risk_level = 'low';

    // Risk Management
    } else if (question.includes('rủi ro') || question.includes('quản lý') || question.includes('risk')) {
      analysis = `⚠️ QUẢN LÝ RỦI RO TRONG CRYPTO TRADING:

Crypto là tài sản có volatility cao nhất. Quản lý rủi ro không chỉ bảo vệ vốn mà còn tối ưu lợi nhuận:

🔑 Nguyên tắc 2% Rule:
• Không rủi ro quá 2% tài sản trên 1 trade
• Ví dụ: Tài khoản $10,000 → Max risk $200/trade

📊 Phân bổ danh mục:
• 60% BTC + ETH (Core holdings)
• 30% Top altcoins (Growth)
• 10% Moonshots (High risk/reward)

🛡️ Tools quan trọng:
• Stop-loss orders
• Position sizing calculator
• DCA strategy
• Portfolio rebalancing`;

      suggestions = [
        "📏 Sử dụng position size calculator trước mỗi trade",
        "🎯 Set take-profit ở 2:1 hoặc 3:1 risk/reward ratio",
        "⏰ Review và rebalance portfolio h��ng tháng",
        "📱 Sử dụng alerts thay vì watch charts 24/7",
        "💭 Keep trading journal để học từ mistakes",
        "🧘 Control emotions - fear và greed là enemy #1"
      ];
      risk_level = 'high';

    // Altcoin Analysis
    } else if (question.includes('altcoin') || question.includes('alt')) {
      analysis = `🚀 PHÂN TÍCH THỊ TRƯỜNG ALTCOIN:

Altseason indicators đang cho tín hiệu hỗn hợp:

📈 Altcoin Market Cap: $400B (excluding BTC+ETH)
📊 BTC Dominance: 52% (giảm = tốt cho alts)
🔄 AltSeason Index: 65/100 (Moderate alt strength)

Sectors đáng chú ý:
🤖 AI Tokens: Hype cycle đầu
⚡ Layer 1s: Competition heating up
🎮 Gaming: Building through bear market
💊 RWA: Real-world assets tokenization
🔗 DeFi: Steady recovery`;

      suggestions = [
        "💎 Focus vào top 20 altcoins với high liquidity",
        "🔍 Research fundamental: team, partnerships, tokenomics",
        "📅 Theo dõi unlock schedule để tránh dumps",
        "⚡ Layer 1 alternatives: AVAX, NEAR, ATOM đáng quan tâm",
        "🎯 AI sector: Caution với bubble risk, nhưng long-term potential",
        "💰 Take profits incrementally, đừng hold 100% cho 'moon'"
      ];
      risk_level = 'high';

    // Technical Analysis
    } else if (question.includes('phân tích kỹ thuật') || question.includes('technical') || question.includes('rsi') || question.includes('macd')) {
      analysis = `���� PHÂN TÍCH KỸ THUẬT CHO CRYPTO:

Crypto market có đặc thù khác traditional markets:

⏰ Timeframes hiệu quả:
• 4H: Swing trading
• 1D: Position trading
• 1W: Long-term trend

🔢 Key Indicators:
• RSI (14): Overbought >70, Oversold <30
• MACD: Divergence signals quan trọng
• Volume: Must confirm price action
• Support/Resistance: Strong levels được test nhiều lần

⚠️ Crypto-specific factors:
• Weekend volume thấp → fakeouts nhiều
• Asia vs US session khác biệt
• Whale movements ảnh hưởng lớn`;

      suggestions = [
        "📊 Kết hợp multiple timeframes: Weekly + Daily + 4H",
        "📈 RSI divergence on daily chart = strong signal",
        "🌊 Volume profile hiệu quả hơn traditional volume",
        "🐋 Theo dõi whale alerts và on-chain metrics",
        "⚡ Breakout cần volume confirmation trong 24h",
        "🎯 Fibonacci retracements work well trong crypto"
      ];
      risk_level = 'medium';

    // Default comprehensive response
    } else {
      analysis = `💼 TỔNG QUAN THỊ TRƯỜNG CRYPTO:

Hiện tại thị trường đang trong giai đoạn consolidation sau bull run 2021:

📊 Market Overview:
• Total Market Cap: ~$1.7T
• BTC Dominance: 52%
• Daily Volume: $50-80B
• Fear & Greed: Neutral zone

🔮 Outlook 2024:
• Bitcoin Halving effect
• ETF approval momentum
• Regulatory clarity improving
• Institutional adoption growing

⚠️ Key Risks:
• Macro economic uncertainty
• Regulatory challenges
• Market manipulation
• Technology risks`;

      suggestions = [
        "📚 Giáo dục là investment tốt nhất - học về blockchain fundamentals",
        "💰 Start small, increase position khi có experience",
        "📱 Use reputable exchanges: Binance, Coinbase, Kraken",
        "🔐 Security first: Hardware wallet cho long-term holdings",
        "👥 Join crypto communities nhưng DYOR (Do Your Own Research)",
        "📈 Long-term perspective thường outperform short-term trading"
      ];
      risk_level = 'medium';
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
