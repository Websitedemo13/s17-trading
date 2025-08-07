import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    
    // For now, return mock response since OpenAI key is not configured
    // This will be replaced with actual OpenAI API call when key is provided
    const mockResponses = {
      portfolio_analysis: {
        analysis: "Phân tích danh mục đầu tư của bạn cho thấy sự đa dạng hóa tốt với 60% Bitcoin, 30% Ethereum và 10% altcoins. Hiệu suất trong 30 ngày qua là +15.2%, vượt trội so với thị trường chung.",
        suggestions: [
          "Xem xét tăng tỷ trọng Ethereum khi giá điều chỉnh về vùng hỗ trợ",
          "Đặt stop-loss cho Bitcoin ở mức $90,000",
          "Theo dõi các altcoin có fundamentals mạnh như SOL, ADA",
          "Cân nhắc DCA thêm khi thị trường sideway"
        ],
        risk_level: 'medium',
        confidence: 0.82
      },
      market_prediction: {
        analysis: "Dựa trên phân tích kỹ thuật và on-chain data, Bitcoin đang trong xu hướng tăng dài hạn. RSI hiện tại ở mức 65, cho thấy vẫn còn không gian tăng trước khi vào vùng quá mua.",
        suggestions: [
          "Entry tốt ở vùng $92,000 - $94,000",
          "Target ngắn hạn: $100,000",
          "Target dài hạn: $120,000 - $150,000",
          "Stop loss: $85,000"
        ],
        risk_level: 'medium',
        confidence: 0.75
      },
      trading_suggestion: {
        analysis: data.question ? 
          `Về câu hỏi "${data.question}": Dựa trên dữ liệu thị trường hiện tại, tôi khuyên bạn nên thận trọng và có kế hoạch rõ ràng. Thị trường crypto luôn biến động mạnh.` :
          "Thị trường hiện tại đang có xu hướng tích cực. Khối lượng giao dịch tăng 12% so với tuần trước, cho thấy sự quan tâm của nhà đầu tư đang gia tăng.",
        suggestions: [
          "Áp dụng chiến lược DCA để giảm rủi ro",
          "Không bao giờ đầu tư quá 5% tổng tài sản vào một coin",
          "Luôn set stop-loss ở mức 8-10%",
          "Theo dõi tin tức và sentiment thị trường hàng ngày"
        ],
        risk_level: 'medium',
        confidence: 0.78
      }
    };

    const response = mockResponses[type as keyof typeof mockResponses] || mockResponses.trading_suggestion;

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-insights function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});